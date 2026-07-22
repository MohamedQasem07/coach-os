/* ============================================================
   Coach OS — Google Apps Script backend
   Paste this whole file into: Extensions ▸ Apps Script (inside
   the "coach" Google Sheet), replacing any starter code, then
   deploy as a Web App (see DEPLOY.md for exact steps).
   ============================================================ */

const ENTITIES = ['clients','packages','subs','sessions','meas','payments','goals','notes','audit','settings'];

function doGet(e) {
  return ContentService.createTextOutput('Coach OS backend is running.');
}

function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return respond({ok:false, error:'bad_request'});
  }
  // The trainee portal is the one action a trainee reaches without the coach's
  // password. It authenticates itself with a link token plus a 4-digit code,
  // so it must be handled BEFORE the coach password check.
  if (body.action === 'portal') {
    try { return respond(handlePortal(body)); }
    catch (err) { return respond({ok:false, error:'server_error'}); }
  }
  if (!checkPassword(body.password)) {
    return respond({ok:false, error:'unauthorized'});
  }
  try {
    if (body.action === 'auth') return respond({ok:true});
    if (body.action === 'push') return respond(handlePush(body.ops || []));
    if (body.action === 'pull') return respond(handlePull(body.cursors || {}));
    return respond({ok:false, error:'unknown_action'});
  } catch (err) {
    return respond({ok:false, error:String(err)});
  }
}

/* ---------- trainee portal ----------
   A 4-digit code is only 10,000 possibilities, so the code must never be
   checked in the browser and guessing must be throttled here. Five wrong
   attempts locks that token for 15 minutes.

   The response is a deliberately narrow projection of the trainee's own
   record. Payments, phone numbers, coach notes, the audit log and every other
   client stay on the server. */
function readAll(entity) {
  const sh = getSheet(entity);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  return sh.getRange(2, 1, lastRow - 1, 4).getValues()
    .filter(function(r){ return r[0] && !r[3]; })          // skip deleted rows
    .map(function(r){
      var d = {};
      try { d = r[1] ? JSON.parse(r[1]) : {}; } catch (e) {}
      d.id = String(r[0]);
      return d;
    });
}

function handlePortal(body) {
  const token = String(body.token || '');
  const code  = String(body.code  || '');
  if (token.length < 16) return {ok:false, error:'bad_code'};

  const cache = CacheService.getScriptCache();
  const lockKey = 'pf_' + token;
  const fails = Number(cache.get(lockKey) || 0);
  if (fails >= 5) return {ok:false, error:'locked'};

  const clients = readAll('clients');
  let me = null;
  for (var i = 0; i < clients.length; i++) {
    if (clients[i].portalToken && clients[i].portalToken === token) { me = clients[i]; break; }
  }
  // Same generic error and same work whether the token or the code was wrong,
  // so the response cannot be used to tell valid tokens from invalid ones.
  if (!me || String(me.portalCode || '') !== code || !code) {
    cache.put(lockKey, String(fails + 1), 900);
    return {ok:false, error:'bad_code'};
  }
  cache.remove(lockKey);

  const mine = function(rows){ return rows.filter(function(r){ return r.clientId === me.id; }); };
  const subs = mine(readAll('subs'));
  const sub  = subs.filter(function(s){ return s.status === 'active'; })[0] || null;

  const allSessions = mine(readAll('sessions'));
  const today = Utilities.formatDate(new Date(),
    Session.getScriptTimeZone(), 'yyyy-MM-dd');

  const sessions = allSessions
    .filter(function(s){ return s.status === 'done'; })
    .sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); })
    .slice(0, 20)
    .map(function(s){ return {date:s.date, muscles:s.muscles || [], dur:s.dur || null}; });

  // What the trainee actually opens the portal for: when is my next session.
  // Scheduled only, today onward, soonest first.
  const upcoming = allSessions
    .filter(function(s){
      return s.status === 'scheduled' && String(s.date) >= today;
    })
    .sort(function(a,b){
      var d = String(a.date).localeCompare(String(b.date));
      return d !== 0 ? d : String(a.time || '').localeCompare(String(b.time || ''));
    })
    .slice(0, 6)
    .map(function(s){
      return {date:s.date, time:s.time || null, muscles:s.muscles || [], dur:s.dur || null};
    });

  const meas = mine(readAll('meas'))
    .sort(function(a,b){ return String(b.date).localeCompare(String(a.date)); })
    .slice(0, 12)
    .map(function(m){ return {date:m.date, weight:m.weight || null}; });

  return {ok:true, client:{
    name: me.name, goal: me.goal || null, level: me.level || null,
    age: me.age || null, gender: me.gender || null,
    height: me.height || null, activity: me.activity || 1.55,
    foodSwaps: me.foodSwaps || {}
  }, sub: sub ? {total:sub.total, used:sub.used, end:sub.end} : null,
     sessions: sessions, upcoming: upcoming, meas: meas};
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function checkPassword(pw) {
  const secret = PropertiesService.getScriptProperties().getProperty('APP_PASSWORD');
  return !!secret && !!pw && pw === secret;
}

function getSheet(entity) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(entity);
  if (!sh) {
    sh = ss.insertSheet(entity);
    sh.appendRow(['id', 'data', 'updated_at', 'deleted_at']);
  }
  return sh;
}

/* ---------- push: apply a batch of upsert/delete ops ---------- */
function handlePush(ops) {
  const now = new Date().toISOString();
  const results = [];
  const byEntity = {};
  ops.forEach(op => { (byEntity[op.entity] = byEntity[op.entity] || []).push(op); });

  Object.keys(byEntity).forEach(entity => {
    if (ENTITIES.indexOf(entity) === -1) return;
    const sh = getSheet(entity);
    const lastRow = sh.getLastRow();
    const values = lastRow > 1 ? sh.getRange(2, 1, lastRow - 1, 4).getValues() : [];
    const idIndex = {};
    values.forEach((r, i) => { idIndex[String(r[0])] = i; });

    byEntity[entity].forEach(op => {
      const idx = idIndex[String(op.id)];
      const rowNum = idx !== undefined ? idx + 2 : -1;
      if (op.op === 'delete') {
        if (rowNum > 0) {
          sh.getRange(rowNum, 3, 1, 2).setValues([[now, now]]);
        } else {
          sh.appendRow([op.id, '{}', now, now]);
        }
      } else {
        const dataStr = JSON.stringify(op.payload || {});
        if (rowNum > 0) {
          sh.getRange(rowNum, 2, 1, 3).setValues([[dataStr, now, '']]);
        } else {
          sh.appendRow([op.id, dataStr, now, '']);
          idIndex[String(op.id)] = values.length;
          values.push([op.id, dataStr, now, '']);
        }
      }
      results.push({entity: entity, id: op.id, updated_at: now});
    });
  });
  return {ok: true, results: results};
}

/* ---------- pull: rows changed since each entity's cursor ---------- */
function handlePull(cursors) {
  const out = {};
  ENTITIES.forEach(entity => {
    const since = cursors[entity] || '1970-01-01T00:00:00.000Z';
    const sh = getSheet(entity);
    const lastRow = sh.getLastRow();
    const values = lastRow > 1 ? sh.getRange(2, 1, lastRow - 1, 4).getValues() : [];
    const rows = [];
    values.forEach(r => {
      const [id, data, updatedAtRaw, deletedAtRaw] = r;
      if (!updatedAtRaw) return;
      const updatedIso = new Date(updatedAtRaw).toISOString();
      if (updatedIso > since) {
        let parsed = {};
        try { parsed = data ? JSON.parse(data) : {}; } catch (e) { parsed = {}; }
        rows.push({
          id: String(id),
          data: parsed,
          updated_at: updatedIso,
          deleted_at: deletedAtRaw ? new Date(deletedAtRaw).toISOString() : null
        });
      }
    });
    out[entity] = rows;
  });
  return {ok: true, entities: out};
}

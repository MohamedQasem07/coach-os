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

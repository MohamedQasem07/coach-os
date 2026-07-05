# ربط Coach OS بشيت "coach" — خطوات مرة واحدة بس

## 1. حط الكود جوه الشيت
1. افتح شيت **coach** الفاضي اللي عملته.
2. من القائمة فوق: **الإضافات (Extensions) ← Apps Script**.
3. هتفتح صفحة كود فاضية (`Code.gs`) — امسح اللي فيها، وانسخ **كل** محتوى ملف `Code.gs` اللي جنب index.html والصقه هناك.
4. احفظ (Ctrl+S أو أيقونة الحفظ فوق). سمّي المشروع أي اسم (مثلاً "Coach OS Backend").

## 2. حط الباسورد بتاعك
1. من نفس صفحة Apps Script: **الإعدادات (⚙️ Project Settings)** من القائمة الجانبية اليسرى.
2. انزل لـ **Script Properties ← Add script property**.
3. Property: `APP_PASSWORD`
   Value: أي باسورد تختاره إنت (ده اللي هتدخل بيه على التطبيق — احفظه في مكان آمن).
4. Save.

## 3. انشر كـ Web App
1. رجّع لصفحة الكود (Editor)، اضغط **Deploy ← New deployment**.
2. اضغط على أيقونة الترس ⚙️ جنب "Select type" واختار **Web app**.
3. الإعدادات:
   - **Execute as**: Me (حسابك)
   - **Who has access**: Anyone
4. اضغط **Deploy**. هيطلب صلاحيات (Authorize access) — وافق ووصل بحسابك اللي مالك الشيت.
5. هيديك رابط شكله كده:
   `https://script.google.com/macros/s/XXXXXXXXXXXXXXXX/exec`
   **انسخ الرابط ده كامل — ده اللي هنحطه في التطبيق.**

## 4. ابعتلي الرابط
ابعتلي رابط الـ `/exec` ده عشان أحطه في `index.html`، والتطبيق هيبقى شغال ويقدر يخزّن وياخد بيانات من الشيت.

> ملاحظة: لو غيّرت أي حاجة في الكود بعد كده، لازم تعمل **Deploy ← Manage deployments ← ✏️ (edit) ← New version ← Deploy** عشان التعديل يتفعّل على نفس الرابط.

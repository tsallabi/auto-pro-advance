# 🔄 AutoPro Platform - Handoff Document for Claude

## تاريخ: 2026-02-27

---

## 📋 ملخص المشروع

AutoPro هي منصة مزادات سيارات مستوردة (على نمط Copart/IAAI) تخدم السوق الليبي والعربي.

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js + Socket.IO + better-sqlite3
- **المسار**: `C:\Users\Pawel\.gemini\antigravity\scratch\autopro\`

---

## 🏗️ الملفات الرئيسية

| الملف | الوصف |
|---|---|
| `server.ts` | الخادم الرئيسي (Express + Socket.IO + SQLite) - ~1760 سطر |
| `src/pages/AdminDashboard.tsx` | لوحة تحكم المدير - ~2570 سطر |
| `src/pages/UserDashboard.tsx` | لوحة تحكم المشتري - ~970 سطر |
| `src/pages/SellerDashboard.tsx` | لوحة تحكم التاجر - ~69000 بايت |
| `src/pages/Home.tsx` | الصفحة الرئيسية |
| `src/pages/CarDetails.tsx` | صفحة تفاصيل السيارة |
| `src/context/StoreContext.tsx` | إدارة الحالة العامة (Context) |

---

## ✅ ما تم إنجازه في هذه الجلسة

### 1. تعديل نظام الإيداع (Deposit System) في `server.ts`

**قبل**: كان `/api/deposit` يقوم بتحديث رصيد المستخدم فوراً (غير آمن).
**بعد**: أصبح يحفظ المعاملة بحالة `pending` وينتظر موافقة المدير.

#### الكود المعدل (سطر ~1291 في server.ts)

```typescript
// POST /api/deposit - يحفظ كـ pending فقط
app.post("/api/deposit", (req, res) => {
    const { userId, amount, method = 'bank_transfer' } = req.body;
    const now = new Date().toISOString();
    const txId = `tx-${Date.now()}`;
    try {
      db.prepare(`
        INSERT INTO transactions(id, userId, amount, type, status, timestamp, method)
        VALUES(?, ?, ?, 'deposit', 'pending', ?, ?)
      `).run(txId, userId, amount, now, method);
      sendInternalMessage(userId, 'admin-1', 
        '🆕 طلب إيداع عربون جديد', 
        `قام العميل (ID: ${userId}) بطلب إيداع مبلغ $${amount.toLocaleString()} عبر ${method}.\nيرجى مراجعة التحويل وتأكيده.`
      );
      res.json({ success: true, message: "تم إرسال طلب الإيداع بنجاح.", txId });
    } catch (err) {
      res.status(500).json({ error: "فشل إرسال طلب الإيداع" });
    }
});
```

#### Endpoint جديد للموافقة على الإيداع

```typescript
// POST /api/admin/approve-deposit/:txId
app.post("/api/admin/approve-deposit/:txId", (req, res) => {
    const { txId } = req.params;
    try {
      const tx = db.prepare("SELECT * FROM transactions WHERE id = ? AND status = 'pending'").get(txId);
      if (!tx) return res.status(404).json({ error: "المعاملة غير موجودة" });
      db.transaction(() => {
        db.prepare("UPDATE transactions SET status = 'completed' WHERE id = ?").run(txId);
        db.prepare("UPDATE users SET deposit = deposit + ?, buyingPower = (deposit + ?) * 10 WHERE id = ?").run(tx.amount, tx.amount, tx.userId);
        sendInternalMessage('admin-1', tx.userId,
          '✅ تم تأكيد استلام العربون',
          `تم تأكيد إيداع مبلغ $${tx.amount.toLocaleString()}. قوتك الشرائية الآن هي $${((tx.amount * 10)).toLocaleString()} إضافية.`
        );
      })();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "فشل تأكيد الإيداع" });
    }
});
```

### 2. تعديلات في `AdminDashboard.tsx`

- **أضيف state**: `const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);` (سطر 42)
- **أضيف case جديد**: `case 'financial_approvals'` في دالة `renderContent()` (سطر 617-708) - يعرض جدول بالإيداعات المعلقة مع أزرار "تأكيد الاستلام" و "رفض"
- **أزيل fetch التجار** من useEffect وأُضيف بدلاً منه fetch للمستخدمين المعلقين والإيداعات (سطر 56-60)

### 3. Endpoints موجودة مسبقاً في server.ts

```
GET  /api/admin/pending-users          - المستخدمين بانتظار التوثيق
POST /api/admin/approve-user/:id       - تفعيل مستخدم (سطر 734)
POST /api/admin/reject-user/:id        - رفض مستخدم (سطر 752)
POST /api/admin/cars/:id/review        - مراجعة سيارة (approve/reject)
GET  /api/admin/system-summary         - ملخص النظام للـ Dashboard
GET  /api/admin/merchants              - قائمة التجار
POST /api/admin/approve-deposit/:txId  - تأكيد إيداع (جديد ✅)
```

---

## ❌ ما يحتاج للإكمال (المهام المتبقية)

### المهمة 1: إضافة API endpoint لجلب المعاملات المفلترة

**المشكلة**: لا يوجد endpoint `GET /api/transactions` يدعم فلترة بـ `?status=pending&type=deposit`
**الحل المطلوب**: إضافة endpoint في `server.ts`:

```typescript
app.get("/api/transactions", (req, res) => {
    const { status, type, userId } = req.query;
    try {
      let query = "SELECT * FROM transactions WHERE 1=1";
      const params: any[] = [];
      if (status) { query += " AND status = ?"; params.push(status); }
      if (type) { query += " AND type = ?"; params.push(type); }
      if (userId) { query += " AND userId = ?"; params.push(userId); }
      query += " ORDER BY timestamp DESC";
      const transactions = db.prepare(query).all(...params);
      res.json(transactions);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
});
```

### المهمة 2: التأكد من وجود عمود `method` في جدول transactions

**المشكلة**: الكود الجديد يحفظ `method` في جدول transactions لكن قد لا يكون العمود موجوداً في تعريف الجدول.
**الحل**: ابحث عن `CREATE TABLE` لجدول transactions في `server.ts` وأضف `method TEXT DEFAULT 'bank_transfer'` إذا لم يكن موجوداً.

### المهمة 3: إضافة جلب البيانات في useEffect لصفحة financial_approvals

**المشكلة**: حالياً الـ useEffect يجلب الإيداعات فقط عند فتح `user_verification`
**الحل**: أضف شرطاً إضافياً في useEffect (سطر ~56 في AdminDashboard.tsx):

```typescript
if (view === 'financial_approvals') {
    fetch('/api/transactions?status=pending&type=deposit')
      .then(res => res.json())
      .then(setPendingDeposits);
}
```

### المهمة 4: إضافة رابط التنقل لصفحة financial_approvals

**المشكلة**: لا يوجد زر في الواجهة للوصول لصفحة مراجعة الإيداعات.
**أين**: في الـ return الأساسي (سطر 2087) يوجد فقط `{renderContent()}` بدون Sidebar.
**معلومة مهمة**: التنقل في AdminDashboard يتم عبر URL params (`?view=xxx`). لا يوجد Sidebar مكون منفصل - كل الأقسام يتم الوصول إليها عبر تغيير `?view=` في الرابط.
**خياران**:

1. إضافة شريط تنقل (tabs bar) في أعلى الصفحة
2. أو إضافة رابط في صفحة Overview (`case 'overview'` سطر ~1637) كـ Quick Action

### المهمة 5: تحديث واجهة المشتري (UserDashboard.tsx)

**المشكلة**: دالة `handleDeposit` في `UserDashboard.tsx` (سطر 114) تتوقع أن يعود الـ response بـ `data.user` لتحديث بيانات المستخدم محلياً، لكن الـ API المعدل لم يعد يعيد المستخدم المحدث (لأن الرصيد لا يتغير فوراً).
**الحل**: تعديل `handleDeposit` في UserDashboard.tsx:

```typescript
const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert('يرجى إدخال مبلغ صحيح', 'error');
      return;
    }
    setIsSubmittingDeposit(true);
    try {
      const res = await fetch('/api/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: effectiveUser.id, amount })
      });
      if (res.ok) {
        // لا نحدث الرصيد محلياً - سيتحدث بعد موافقة المدير
        showAlert('تم إرسال طلب الإيداع بنجاح! سيتم تحديث رصيدك بعد مراجعة الإدارة.', 'success');
        setShowDepositModal(false);
        fetch(`/api/transactions/user/${effectiveUser.id}`).then(r => r.json()).then(setTransactions);
      } else {
        showAlert('فشل إتمام العملية.', 'error');
      }
    } catch (e) {
      showAlert('خطأ في الاتصال بالخادم', 'error');
    } finally {
      setIsSubmittingDeposit(false);
    }
};
```

---

## 🗺️ الخطة الكاملة لرحلة المشتري (Buyer Journey)

### المرحلة 1: التسجيل والتوثيق ✅ (مكتمل)

- تسجيل المشتري مع بيانات KYC (هوية، IBAN، عنوان)
- مراجعة المدير للوثائق → تفعيل/رفض الحساب
- إرسال رسالة داخلية بالنتيجة

### المرحلة 2: إيداع العربون 🔶 (جزئياً مكتمل)

- المشتري يطلب إيداع → يُحفظ كـ pending ✅
- المدير يراجع → يوافق → يتحدث الرصيد ✅ (Backend جاهز)
- واجهة المدير لمراجعة الإيداعات ✅ (case 'financial_approvals' مكتوب)
- **متبقي**: ربط كل القطع ببعضها (المهام 1-5 أعلاه)

### المرحلة 3: المزايدة والفوز (لم يبدأ)

- المشتري يزايد في المزاد الحي (موجود ⚡ - CopartAuctionSystem)
- عند الفوز: إنشاء فاتورة تلقائية
- **متبقي**: ربط الفوز بإنشاء الفاتورة تلقائياً

### المرحلة 4: دفع الفاتورة (لم يبدأ)

- المشتري يدفع الفاتورة (حالياً وهمي عبر `/api/invoices/:id/pay`)
- **متبقي**: ربط الدفع ببوابة حقيقية (Stripe/Tlync)

### المرحلة 5: الشحن والاستلام (جزئياً موجود)

- تتبع الشحنات موجود في لوحة المدير
- **متبقي**: أتمتة إنشاء الشحنة بعد الدفع

---

## 🗺️ خطة رحلة التاجر (Seller Journey)

### المرحلة 1: تسجيل التاجر ✅

### المرحلة 2: إضافة سيارة → مراجعة المدير → نشر في المزاد ✅

### المرحلة 3: محفظة أرباح التاجر (Seller Wallet) ❌ لم يبدأ

### المرحلة 4: عقود بيع إلكترونية ❌ لم يبدأ

---

## 🐛 مشكلة معروفة في AdminDashboard.tsx

في `case 'inventory_review'` (سطر ~1115)، يوجد خطأ مطبعي:

```javascript
// خاطئ:
body: JSON.JSON.stringify({ action: 'reject', reason })
// صحيح:
body: JSON.stringify({ action: 'reject', reason })
```

---

## 📊 بنية قاعدة البيانات (الجداول الرئيسية)

| الجدول | الأعمدة الرئيسية |
|---|---|
| `users` | id, firstName, lastName, email, password, role, status, deposit, buyingPower, commission, nationalId, iban, country, address1, joinDate |
| `cars` | id, lotNumber, vin, make, model, year, status (pending_approval/live/closed/rejected), sellerId, currentBid, winnerId |
| `transactions` | id, userId, amount, type (deposit/purchase/commission), status (pending/completed), timestamp, **method** (قد يكون مفقود!) |
| `invoices` | id, userId, carId, amount, status (unpaid/paid), pickupAuthCode |
| `messages` | id, senderId, receiverId, subject, content, category, isRead, timestamp |
| `notifications` | id, userId, title, message, type, isRead, timestamp |
| `bids` | id, carId, bidderId, amount, timestamp |
| `shipments` | id, carId, userId, status, origin, destination |

---

## 🎯 ملخص تنفيذي سريع لـ Claude

**أعطِ Claude هذا الملف واطلب منه:**

> "أريدك تكمل المهام 1 إلى 5 المذكورة في قسم 'ما يحتاج للإكمال'. ابدأ بالمهمة 1 (إضافة GET /api/transactions مع فلترة) ثم المهمة 2 (التأكد من وجود عمود method) ثم المهمة 3 (useEffect) ثم المهمة 4 (إضافة رابط تنقل) ثم المهمة 5 (تحديث handleDeposit في UserDashboard). بعد الانتهاء، شغّل السيرفر وتأكد أنه يعمل بدون أخطاء."

---

*تم إنشاء هذا الملف تلقائياً في 2026-02-27*

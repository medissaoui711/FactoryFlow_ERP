# Factory ERP System

نظام متقدم لتخطيط موارد المؤسسات (ERP) مُصمم خصيصاً للمصانع والمنشآت الصناعية. يهدف النظام إلى إدارة العمليات التشغيلية، المخزون، الإنتاج، المبيعات، المشتريات، والمالية في بيئة مركزية آمنة تعتمد على بنية خدمات مرنة وتدعم تعدد اللغات (العربية والإنجليزية).

---

## 🏗️ البنية التحتية والتقنيات (Tech Stack)

تم بناء النظام باستخدام أحدث تقنيات الـ Full-Stack لضمان الأداء، قابلية التوسع، والموثوقية:

### الواجهة الأمامية (Frontend)
- **الإطار (Framework):** React 19 مع Vite لسرعة البناء والتطوير.
- **التوجيه (Routing):** React Router v7.
- **التصميم (Styling):** Tailwind CSS v4 مع مكونات Radix UI.
- **إدارة الحالة والبيانات:** React Hooks.
- **تعدد اللغات (i18n):** i18next و React-i18next.
- **الرسوم البيانية (Charts):** Recharts.
- **الحركات (Animations):** Framer Motion.

### الواجهة الخلفية (Backend)
- **الخادم (Server):** Node.js مع Express.js.
- **لغة البرمجة (Language):** TypeScript (صارمة النوع - Strict Typing).
- **التفاعل مع قواعد البيانات (ORM):** Drizzle ORM.
- **قاعدة البيانات (Database):** PostgreSQL.
- **المصادقة (Authentication):** Firebase Authentication & Firebase Admin SDK.

---

## 🔒 المصادقة وإدارة الصلاحيات (RBAC)

يتبنى النظام نموذج **التحكم في الوصول القائم على الأدوار (Role-Based Access Control - RBAC)**. 
- تعتمد المصادقة على Firebase للتحقق من هوية المستخدمين عبر `Tokens`.
- يتم إدارة الأدوار (Roles) في الـ Middleware الخاص بالخادم لتأمين الـ Endpoints ومنع الوصول غير المصرح به.
- **الأدوار المدعومة:** `admin`, `accountant`, `warehouse`, `production`, `sales`.
- يمتلك النظام لوحات قيادة (Dashboards) تفاعلية تتغير بناءً على دور المستخدم، مع توفير سجلات تدقيق (Audit Logs) شفافة لمدير النظام (Admin).

---

## 📊 الوحدات الأساسية (Core Modules)

1. **المالية والخزينة (Finance & Treasury)**
   - إدارة الحسابات، الإيرادات والمصروفات.
   - متابعة الشيكات وإدارة دورة حياتها.
   - القيود اليومية (Journal Entries) المزدوجة لضمان التوازن المالي.
2. **المخزون (Inventory)**
   - تكويد الأصناف وإدارة المواد الخام والمنتجات النهائية.
   - تتبع الحركات المخزنية (وارد/منصرف).
3. **الإنتاج (Production)**
   - أوامر الإنتاج المباشرة (Live Production) وأوامر القص (Cutting Orders).
   - ربط استهلاك المواد الخام بإنتاج المنتجات النهائية (BOM).
4. **المبيعات والمشتريات (Sales & Purchases)**
   - إدارة الموردين والعملاء.
   - إنشاء وإصدار أوامر الشراء (Purchase Orders) وفواتير البيع (Sales Invoices) وتكاملها مع المخزون والمالية.
5. **التقارير ولوحات القيادة (Dashboards & Reports)**
   - مؤشرات أداء رئيسية (KPIs) ديناميكية.
   - سجلات التدقيق لتتبع الحركات الحساسة.

---

## 📂 الهيكلية العامة للمشروع (Project Structure)

```text
├── src/
│   ├── components/         # المكونات المشتركة (UI, Layout, etc.)
│   ├── db/                 # تعريف الجداول (Schema)، اتصال Drizzle، واستعلامات قواعد البيانات
│   ├── lib/                # مكتبات مساعدة، إعدادات Firebase، والترجمة (locales)
│   ├── middleware/         # طبقة الحماية (RBAC, Auth Middlewares)
│   ├── pages/              # واجهات النظام مقسمة حسب الوحدات (Finance, Inventory, etc.)
│   ├── server/             # طبقة الخدمات (Services) والمستودعات (Repositories) - Backend Logic
│   ├── App.tsx             # نقطة الدخول للتوجيه (Router Entry)
│   └── main.tsx            # نقطة إقلاع React
├── server.ts               # نقطة إقلاع خادم Express والـ API Routes
├── package.json            # الاعتماديات وسكريبتات التشغيل
├── vite.config.ts          # إعدادات Vite
├── tailwind.config.js      # إعدادات TailwindCSS
└── drizzle.config.ts       # إعدادات Drizzle ORM
```

---

## 🚀 بدء التشغيل وبيئة التطوير (Getting Started)

### المتطلبات الأساسية (Prerequisites)
- Node.js (v20 أو أحدث)
- PostgreSQL (مُعد للعمل محلياً أو عبر Cloud)
- مفاتيح إعداد Firebase (بملف `firebase-applet-config.json` أو عبر متغيرات البيئة)

### خطوات التشغيل

1. **تثبيت الاعتماديات:**
   ```bash
   npm install
   ```

2. **تجهيز قاعدة البيانات:**
   تأكد من إعداد متغيرات البيئة في ملف `.env` (مثل `DATABASE_URL`). ثم قم بتشغيل Drizzle لمزامنة الجداول:
   ```bash
   npm run db:push
   ```

3. **تشغيل خادم التطوير (Frontend + Backend):**
   ```bash
   npm run dev
   ```
   *يقوم هذا الأمر بتشغيل كل من Express Backend و Vite Middleware ضمن عملية واحدة، مما يسهل التطوير ويمنع مشاكل الـ CORS.*

---

## 🛠️ أوامر مفيدة (Available Scripts)

- `npm run dev`: تشغيل خادم التطوير (Full-Stack).
- `npm run build`: بناء النظام للإنتاج (يقوم ببناء الواجهة الأمامية عبر Vite وواجهة الـ Backend عبر esbuild كملف مجمع CommonJS).
- `npm run start`: تشغيل النظام بعد البناء (يعمل من مجلد `dist`).
- `npm run lint`: فحص جودة الكود وتطابق الـ TypeScript.
- `npm run db:studio`: فتح واجهة Drizzle Studio لاستعراض وتعديل قاعدة البيانات بصرياً.

---

## 🧪 الاختبارات (Testing)

نستخدم إطار **Vitest** لإجراء اختبارات الوحدة (Unit Tests) لضمان استقرار العمليات المحاسبية، المخزنية والخدمات الأساسية.
لتشغيل الاختبارات:
```bash
npx vitest run
```
*يغطي النظام حالياً طبقات الـ Services والـ Middleware بصورة ممتازة مع قابلية للتوسع في اختبارات الواجهة (Component Tests).*

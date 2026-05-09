# TotalReportScreen Dokumentatsiyasi

Ushbu hujjat `TotalReportScreen` sahifasining dizayn tuzilishi, undagi widgetlar joylashuvi hamda sahifa murojaat qiladigan API'lar haqida to'liq tahlilni o'z ichiga oladi.

## 1. Umumiy Ma'lumot

- **Sahifa nomi:** `TotalReportScreen`
- **Fayl joylashuvi:** `lib/features/total_report/presentation/total_report_screen.dart`
- **Asosiy vazifasi:** Foydalanuvchiga filiallarning umumiy savdo holati (Savdo), mijozlar bazasi bilan ishlash holati (AKB) hamda KPI (ishlab chiqilmoqda) bo'yicha hisobotlarni belgilangan sana oralig'ida taqdim etish.
- **State Management:** `GetX` (`SalesByCategoryController` va `ReportByClientController` orqali)

---

## 2. Dizayn va Elementlar Joylashuvi (Layout Analysis)

Sahifa `Scaffold` asosida qurilgan bo'lib, quyidagi asosiy o'zaklardan tashkil topgan:

### 2.1. AppBar (Yuqori panel)
- **Fon rangi:** Oq (`AppColors.white`)
- **Sarlavha (Title):** "Umumiy hisobot" matni markazlashtirilgan (`centerTitle: true`), o'lchami 18.sp, qalinligi 700 (`FontWeight.w700`), harflar orasidagi masofa (letter spacing) -0.5 ga teng.
- **Ajratuvchi chiziq (Bottom Divider):** AppBar ostida 1 piksel qalinlikdagi och kulrang (`AppColors.borderLight`) chiziq joylashgan.

### 2.2. Asosiy Qism (Body)
Asosiy qism `Column` widgetidan tashkil topgan bo'lib, uning ichida yuqoridan pastga qarab elementlar quyidagicha ketma-ketlikda joylashgan:

#### A. Sana Oralig'ini Tanlash qismi (`_buildDateRangeSelector`)
- **Fon rangi:** Oq, atrofi 16.w horizontal va 12.h vertical padding bilan o'ralgan.
- **Elementlar:** Yonma-yon joylashgan 3 ta element:
  1. **"Dan" tugmasi (Boshlanish sanasi):** Chap tomonda joylashgan. Ichida kalendar ikonka (`Icons.calendar_today_outlined`, `AppColors.primary` rangida) hamda "Dan" matni va tanlangan sana ko'rsatiladi. Tugma foni och kulrang (`AppColors.backgroundLight`), chetlari 12.r qilib yumaloqlangan.
  2. **Yo'nalish ikonkas (Arrow Icon):** O'rtada `Icons.arrow_forward_rounded` ikonkasi (kulrang rangda, 20.r o'lchamda) joylashgan.
  3. **"Gacha" tugmasi (Tugash sanasi):** O'ng tomonda, "Dan" tugmasi bilan bir xil ko'rinish va xususiyatlarga ega.

#### B. TabBar qismi
- **Joylashuvi:** Sanalar oralig'i ostida joylashgan.
- **Konteyner dizayni:** Foni oq, ichidagi `TabBar` foni `AppColors.backgroundLight`, chetlari 14.r radius bilan yumaloqlangan.
- **Aktiv Tab dizayni (Indicator):** `AppColors.primary` rangli fon, 10.r radius va ostida yengil soya (Shadow) mavjud.
- **Tablar ro'yxati:**
  1. **Savdo:** Sumka ikonkasi (`Icons.shopping_bag_outlined`) + "Savdo"
  2. **AKB:** Odamlar ikonkasi (`Icons.groups_outlined`) + "AKB"
  3. **KPI:** Statistika ikonkasi (`Icons.assessment_outlined`) + "KPI"

#### C. TabBarView (Kontent qismi)
`Expanded` widgeti ichiga olingan bo'lib, qolgan barcha bo'sh joyni egallaydi. Tanlangan tabga qarab kerakli widgetni ko'rsatadi:
- 1-sahifa: `TotalSalesTab`
- 2-sahifa: `TotalAkbTab`
- 3-sahifa: `UnderConstructionWidget`

### 2.3. Sana Tanlash Modali (Bottom Sheet)
Foydalanuvchi "Dan" yoki "Gacha" tugmasini bosa, pastdan chiquvchi oyna:
- **Dizayni:** Foni oq, tepa burchaklari 24.r yumaloqlangan, tepasida kichik ushlagich (handle) chizig'i.
- **Sarlavha:** Qaysi tugma bosilganiga qarab "Boshlanish sanasi" yoki "Tugash sanasi".
- **Picker:** `CupertinoDatePicker` ishlatilgan, o'zgarishlar aylanma ro'yxat tarzida tanlanadi.
- **Tugmalar:** Pastda "Bekor qilish" (kulrang matn, oq fon) va "Tayyor" (`AppColors.primary` fonli asosiy tugma) yonma-yon joylashgan.

---

## 3. Murojaat Qilinadigan API'lar

Sahifa asosan 2 ta asosiy API bilan ishlaydi. Ma'lumotlarni yuklash sahifa ochilganda (`initState` ichida) va sana oralig'i o'zgarganda ishga tushuvchi `_fetchData()` funksiyasi orqali chaqiriladi.

### 3.1. Savdo Hisoboti API'si (TotalSalesTab uchun)
- **Controller:** `SalesByCategoryController`
- **Method:** `fetchSalesByCategory()`
- **API Klient fayli:** `sales_by_category_api.dart` (`SalesByCategoryApi`)
- **Endpoint:** `GET /supervisor/api/get_sales_by_category`
- **Yuboriladigan parametrlar (Query Parameters):**
  - `branch_id` (int): Filial ID'si
  - `date_begin` (String): Boshlanish sanasi (Y-m-d formatida)
  - `date_end` (String): Tugash sanasi (Y-m-d formatida)
- **Maqsadi:** Kategoriyalar bo'yicha savdo miqdori, summasi, agentlarning savdo natijalari va rejaga nisbatan bajarilish foizini yuklab olish.

### 3.2. AKB Hisoboti API'si (TotalAkbTab uchun)
- **Controller:** `ReportByClientController`
- **Method:** `fetchReportByClient()`
- **API Klient fayli:** `report_by_client_api.dart` (`ReportByClientApi`)
- **Endpoint:** `GET /supervisor/api/get_report_by_client`
- **Yuboriladigan parametrlar (Query Parameters):**
  - `branch_id` (int): Filial ID'si
  - `date_begin` (String): Boshlanish sanasi (Y-m-d formatida)
  - `date_end` (String): Tugash sanasi (Y-m-d formatida)
- **Maqsadi:** Ochiq va aktiv klientlar bazasi (OKB/AKB), tashriflar soni, agentlar, guruhlar va mijozlar kesimida natijalarni olish.

---

## 4. Tablardagi Widgetlar Tahlili

### 4.1. TotalSalesTab (Savdo)
Ushbu bo'lim `SalesByCategoryController` da saqlanayotgan `salesData` ga asoslanib quriladi. Agar ma'lumot yuklanayotgan bo'lsa, `TotalSalesTabSkeleton` shimmer animasiyasi ko'rsatiladi.
- **TotalPieChart:** Jami savdoning kategoriyalar kesimida taqsimlanishini ko'rsatuvchi aylanma (pie) diagramma. Unga `SalesChartDetail` widgeti ulanadi va bo'lak ustiga bosilganda o'sha kategoriya detali panelda chiqadi.
- **PlanSection:** Savdo rejasining (Plan) qancha qismi bajarilganligi (Fact) hamda progress chizig'ini foiz (%) ko'rinishida ko'rsatadi.
- **AgentsSection:** Agentlarning qo'shgan ulushini (kengayuvchi ro'yxat) aks ettiradi.
- **CategoryBreakdown:** Har bir kategoriyaning ichida qanday mahsulotlar borligi, ularning hajmi hamda summasini ko'rsatadi.
- **SummaryReport:** Umumlashgan statistika (jami summa, jami miqdor, buyurtmalar, mijozlar va b.).

### 4.2. TotalAkbTab (AKB)
Ushbu bo'lim `ReportByClientController` da saqlanayotgan `reportData` ga asoslanadi. Bu yerda AKB va OKB tahlili beriladi.
- **TotalPieChart:** Bu tabda ham pie diagramma bor, lekin bu safar agentlarning vizitlari bo'yicha (Agentlar ulushi).
- **EfficiencySection:** Umumiy OKB, AKB, muvaffaqiyatli tashriflar hamda samaradorlik ko'rsatkichlari (%).
- **AgentsVisitSection:** 3 darajali daraxt (Tree) strukturasiga ega kengayuvchi (expandable) elementlar:
  1. **Agent darajasi**
  2. **Guruh darajasi (Agentga qarashli marshrutlar/guruhlar)**
  3. **Mijoz darajasi (Guruh ichidagi aniq mijozlarning vizit tafsilotlari, rasm va buyurtmalari)**

### 4.3. KPI (Hozircha ishlamaydi)
- **Widget:** `UnderConstructionWidget`
- **Holati:** Hali to'liq ishlab chiqilmagan.
- **Ko'rinishi:** O'rtada qurilish ikonkasi va "KPI bo'limi hozirda ishlab chiqish jarayonida." matni mavjud.

# TotalReportScreen Documentation

## Umumiy ma'lumot

**Sahifa nomi:** TotalReportScreen  
**Joylashuvi:** `lib/features/total_report/presentation/total_report_screen.dart`  
**Maqsadi:** Umumiy savdo va AKB (Agent-Klient-Buyurtma) hisobotlarini ko'rsatish

---

## Arxitektura va Design Tuzilishi

### 1. Asosiy Layout Tuzilishi

```
Scaffold
├── AppBar ("Umumiy hisobot" sarlavhasi bilan)
├── Column
│   ├── _buildDateRangeSelector() - Sana oralig'i tanlash
│   ├── TabBar (3 ta tab)
│   └── TabBarView (3 ta tab kontenti)
```

### 2. UI Elementlar Joylashuvi

#### AppBar
- **Background:** `AppColors.white`
- **Title:** "Umumiy hisobot" (18.sp, FontWeight.w700)
- **Divider:** Pastki chegara (1px, `AppColors.borderLight`)

#### Sana Oralig'i Tanlash (Date Range Selector)
- **Joylashuvi:** AppBar ostida
- **Background:** `AppColors.white`
- **Elementlar:**
  - "Dan" (Boshlanish sanasi) - chap tomonda
  - Arrow icon (o'rtada)
  - "Gacha" (Tugash sanasi) - o'ng tomonda
- **Date Picker:** CupertinoDatePicker modal bottom sheet orqali

#### TabBar
- **Background:** `AppColors.backgroundLight` (konteyner ichida)
- **Indicator:** `AppColors.primary` rangli, 10.r border radius
- **Tablar:**
  1. **Savdo** - `Icons.shopping_bag_outlined` + "Savdo" matni
  2. **AKB** - `Icons.groups_outlined` + "AKB" matni
  3. **KPI** - `Icons.assessment_outlined` + "KPI" matni

---

## Tablar Tarkibi

### 1. Savdo Tab (TotalSalesTab)

**Fayl:** `lib/features/total_report/presentation/widgets/total_sales_tab.dart`

#### Widgetlar Tarkibi:

| # | Widget | Tavsif |
|---|--------|--------|
| 1 | **TotalPieChart** | Kategoriyalar bo'yicha savdo diagrammasi |
| 2 | **PlanSection** | Reja bajarilishi progress bar va statistikasi |
| 3 | **AgentsSection** | Agentlar statistikasi (kengaytiriluvchi ro'yxat) |
| 4 | **CategoryBreakdown** | Kategoriyalar bo'yicha batafsil ma'lumot |
| 5 | **SummaryReport** | Umumiy hisobot jadvali |

#### PlanSection Tarkibi:
- Progress bar (80%+ yashil, 40-80% sariq, <40% qizil)
- 3 ta karta: Reja, Bajarildi, Foiz

#### AgentsSection Tarkibi:
- `_ExpandableAgentTile` - Har bir agent uchun kengaytiriluvchi karta
- Agent ismi, buyurtmalar soni, mijozlar soni

#### CategoryBreakdown Tarkibi:
- `_ExpandableCategoryTile` - Har bir kategoriya uchun
- Mahsulot rasmlari (CachedNetworkImage)
- Miqdor va summa foizlari

### 2. AKB Tab (TotalAkbTab)

**Fayl:** `lib/features/total_report/presentation/widgets/total_akb_tab.dart`

#### Widgetlar Tarkibi:

| # | Widget | Tavsif |
|---|--------|--------|
| 1 | **TotalPieChart** | Agentlar bo'yicha tashriflar diagrammasi |
| 2 | **AgentsVisitSection** | Agentlar tashriflari (3-darajali ierarxiya) |
| 3 | **EfficiencySection** | Umumiy samaradorlik ko'rsatkichlari |

#### AgentsVisitSection Ierarxiyasi:
```
Agent (Level 1)
├── Group (Level 2)
│   └── Client (Level 3)
```

- **Agent Tile:** Agent ismi, OKB/AKB, buyurtmalar, fotosuratlar
- **Group Tile:** Guruh nomi, tashriflar foizi
- **Client Tile:** Mijoz nomi, buyurtmalar, fotosuratlar, tashriflar

### 3. KPI Tab

**Fayl:** `lib/features/total_report/presentation/widgets/under_construction_widget.dart`

- **Status:** Ishlab chiqish jarayonida
- **Ko'rsatadi:** Construction icon + "KPI bo'limi hozirda ishlab chiqish jarayonida" xabari

---

## Widgetlar Dokumentatsiyasi

### 1. TotalPieChart

**Fayl:** `lib/features/total_report/presentation/widgets/total_pie_chart.dart`

**Vazifasi:** Interaktiv pie chart ko'rsatish

**Parametrlar:**
```dart
TotalPieChart({
  required String title,           // Diagramma sarlavhasi
  required List<PieChartItemData> items,  // Ma'lumotlar
  Widget Function(int, PieChartItemData, Color)? detailBuilder, // Detail builder
})
```

**Xususiyatlari:**
- Touch/Click bilan bo'laklarni tanlash
- Animatsiyali o'tishlar (300ms)
- Legend (izohlar) o'ng tomonda
- Detail panel (tanlangan bo'lak uchun)

**Ranglar:**
```dart
static const List<Color> _baseColors = [
  Color(0xFF342B6A),  // To'q ko'k
  Color(0xFF7C71B8),  // Och binafsha
  Color(0xFF10B981),  // Yashil
  Color(0xFFF59E0B),  // Sariq
  Color(0xFFEF4444),  // Qizil
  Color(0xFF3B82F6),  // Ko'k
  Color(0xFF8B5CF6),  // Binafsha
  Color(0xFFEC4899),  // Gulrang
  Color(0xFF14B8A6),  // Teal
  Color(0xFFF97316),  // To'q sariq
];
```

### 2. SalesChartDetail

**Fayl:** `lib/features/total_report/presentation/widgets/sales_chart_detail.dart`

**Vazifasi:** Pie chart tanlangan kategoriya uchun detail ma'lumot

**Ko'rsatadi:**
- Kategoriya nomi
- Summa, Miqdor, Mahsulotlar soni
- Summa % va Miqdor %

### 3. TotalSalesTabSkeleton

**Fayl:** `lib/features/total_report/presentation/widgets/total_sales_tab_skeleton.dart`

**Vazifasi:** Loading state uchun shimmer effekt

**Paket:** `shimmer: ^3.0.0`

**Skeleton qismlari:**
- Pie chart skeleton
- Plan section skeleton
- Agents section skeleton
- Category section skeleton
- Summary section skeleton

### 4. UnderConstructionWidget

**Fayl:** `lib/features/total_report/presentation/widgets/under_construction_widget.dart`

**Vazifasi:** Ishlab chiqilmayotgan bo'limlar uchun placeholder

---

## API Dokumentatsiyasi

### 1. SalesByCategoryApi

**Fayl:** `lib/features/total_report/data/remote/sales_by_category_api.dart`

**Endpoint:** `GET /supervisor/api/get_sales_by_category`

**Parametrlar:**
| Parametr | Turi | Tavsif |
|----------|------|--------|
| branch_id | int | Filial ID |
| date_begin | String | Boshlanish sanasi (YYYY-MM-DD) |
| date_end | String | Tugash sanasi (YYYY-MM-DD) |

**Javob:** `Map<String, dynamic>` → `SalesByCategoryResponse`

### 2. ReportByClientApi

**Fayl:** `lib/features/total_report/data/remote/report_by_client_api.dart`

**Endpoint:** `GET /supervisor/api/get_report_by_client`

**Parametrlar:**
| Parametr | Turi | Tavsif |
|----------|------|--------|
| branch_id | int | Filial ID |
| date_begin | String | Boshlanish sanasi (YYYY-MM-DD) |
| date_end | String | Tugash sanasi (YYYY-MM-DD) |

**Javob:** `Map<String, dynamic>` → `ReportByClientResponse`

---

## Data Modellar

### 1. SalesByCategoryResponse

**Fayl:** `lib/features/total_report/domain/models/sales_by_category.dart`

```dart
class SalesByCategoryResponse {
  final double totalQty;        // Jami miqdor
  final double totalSumma;      // Jami summa
  final int qtyOrder;           // Buyurtmalar soni
  final int qtyClients;         // Mijozlar soni
  final double average;         // O'rtacha
  final double returnedQty;     // Qaytarilgan miqdor
  final double returnedSumma;   // Qaytarilgan summa
  final double plan;            // Reja
  final double fact;            // Fakt
  final double result;          // Reja bajarilishi foizi
  final List<SalesAgent> agents;    // Agentlar ro'yxati
  final List<SalesCategory> sales; // Kategoriyalar ro'yxati
}
```

### 2. SalesCategory

```dart
class SalesCategory {
  final int categoryId;         // Kategoriya ID
  final String categoryName;    // Kategoriya nomi
  final double qty;             // Miqdor
  final double summa;           // Summa
  final double qtyPercent;      // Miqdor foizi
  final double summaPercent;    // Summa foizi
  final List<SalesProduct> products; // Mahsulotlar ro'yxati
}
```

### 3. SalesProduct

```dart
class SalesProduct {
  final String productPhotoUrl; // Mahsulot rasmi URL
  final int productId;          // Mahsulot ID
  final String productName;     // Mahsulot nomi
  final String unit;            // O'lchov birligi
  final double qty;             // Miqdor
  final double summa;           // Summa
  final double qtyPercent;      // Miqdor foizi
  final double summaPercent;    // Summa foizi
}
```

### 4. ReportByClientResponse

**Fayl:** `lib/features/total_report/domain/models/report_by_client.dart`

```dart
class ReportByClientResponse {
  final int okb;                // Ochiq klientlar bazasi
  final int akb;                // Aktiv klientlar bazasi
  final int qtyOrder;           // Buyurtmalar soni
  final int qtyPhoto;           // Fotosuratlar soni
  final int qtyRejected;        // Rad etilganlar soni
  final int qtyReturned;        // Qaytarilganlar soni
  final double result;          // Umumiy natija
  final List<ReportAgent> agents; // Agentlar ro'yxati
}
```

### 5. ReportAgent

```dart
class ReportAgent {
  final int agentId;            // Agent ID
  final String agentName;       // Agent ismi
  final int okb;                // Ochiq klientlar bazasi
  final int akb;                // Aktiv klientlar bazasi
  final double result;          // Natija foizi
  final double qty;             // Miqdor
  final double summa;           // Summa
  final double qtyPercent;      // Miqdor foizi
  final double summaPercent;    // Summa foizi
  final List<ReportGroup> groups; // Guruhlar ro'yxati
}
```

### 6. ReportGroup

```dart
class ReportGroup {
  final int groupId;            // Guruh ID
  final String groupName;       // Guruh nomi
  final int okb;                // Ochiq klientlar bazasi
  final int akb;                // Aktiv klientlar bazasi
  final double result;          // Natija foizi
  final double qty;             // Miqdor
  final double summa;           // Summa
  final double qtyPercent;      // Miqdor foizi
  final double summaPercent;    // Summa foizi
  final List<ReportClient> clients; // Mijozlar ro'yxati
}
```

### 7. ReportClient

```dart
class ReportClient {
  final int clientId;           // Mijoz ID
  final String clientName;      // Mijoz nomi
  final double qty;             // Miqdor
  final double summa;           // Summa
  final double qtyPercent;      // Miqdor foizi
  final double summaPercent;    // Summa foizi
  final int qtyVisit;           // Tashriflar soni
  final int qtyPayment;         // To'lovlar soni
  final int qtyOrder;           // Buyurtmalar soni
  final int qtyPhoto;           // Fotosuratlar soni
  final int qtyReturned;        // Qaytarilganlar soni
}
```

---

## State Management

**Ishlatilgan paket:** `get: ^4.6.6`

### Controllerlar:

1. **SalesByCategoryController**
   - `isLoading` - Yuklanish holati
   - `error` - Xatolik xabari
   - `salesData` - Savdo ma'lumotlari

2. **ReportByClientController**
   - `isLoading` - Yuklanish holati
   - `error` - Xatolik xabari
   - `reportData` - AKB hisobot ma'lumotlari

---

## UI/UX Xususiyatlari

### Responsive Design
- **Paket:** `flutter_screenutil: ^5.9.0`
- `.w` - width (kenglik)
- `.h` - height (balandlik)
- `.r` - radius (radius)
- `.sp` - font size (shrift o'lchami)

### Animatsiyalar
- Tab o'tishlari
- Pie chart bo'laklari tanlash
- Expandable tile ochilishi/yopilishi (AnimatedCrossFade)
- Progress bar animatsiyasi
- Loading shimmer effekti

### Ranglar
- **Primary:** `#342B6A` (Asosiy rang)
- **Success:** `#10B981` (Muvaffaqiyat)
- **Warning:** `#F59E0B` (Ogohlantirish)
- **Error:** `#EF4444` (Xatolik)
- **Background:** `#F8F9FA` (Fon)
- **White:** `#FFFFFF` (Oq)
- **Grey:** `#6B7280` (Kulrang)

---

## Foydalanilgan Paketlar

| Paket | Versiya | Maqsad |
|-------|---------|--------|
| flutter_screenutil | ^5.9.0 | Responsive UI |
| get | ^4.6.6 | State management |
| fl_chart | ^0.68.0 | Pie chart |
| shimmer | ^3.0.0 | Loading skeleton |
| cached_network_image | ^3.3.1 | Rasmlarni keshlash |
| dio | ^5.4.0 | HTTP client |

---

## Fayl Strukturasi

```
lib/features/total_report/
├── data/
│   ├── remote/
│   │   ├── sales_by_category_api.dart
│   │   └── report_by_client_api.dart
│   └── repositories/
│       ├── sales_by_category_repository_impl.dart
│       └── report_by_client_repository_impl.dart
├── domain/
│   ├── models/
│   │   ├── sales_by_category.dart
│   │   └── report_by_client.dart
│   └── repositories/
│       ├── sales_by_category_repository.dart
│       └── report_by_client_repository.dart
└── presentation/
    ├── total_report_screen.dart
    ├── controllers/
    │   ├── sales_by_category_controller.dart
    │   └── report_by_client_controller.dart
    └── widgets/
        ├── total_sales_tab.dart
        ├── total_akb_tab.dart
        ├── total_pie_chart.dart
        ├── sales_chart_detail.dart
        ├── total_sales_tab_skeleton.dart
        └── under_construction_widget.dart
```

---

## Xulosa

TotalReportScreen quyidagi imkoniyatlarni taqdim etadi:

1. **Savdo hisobotlari** - Kategoriyalar bo'yicha batafsil savdo statistikasi
2. **AKB hisobotlari** - Agentlar, guruhlar va mijozlar bo'yicha tashriflar
3. **Interaktiv diagrammalar** - Pie chart orqali vizual ma'lumotlar
4. **Responsive design** - Har qanday ekran o'lchamiga moslashuvchan
5. **Offline support** - Rasmlarni keshlash orqali tezkor yuklash
6. **Loading states** - Shimmer effektlar bilan yaxshi UX

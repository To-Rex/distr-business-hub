import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { createRootRoute, Outlet, Link, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect, createContext, useContext, useRef, useMemo } from "react";
import { Toaster as Toaster$1 } from "sonner";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Compass, Home, ArrowLeft, ChevronDown, Check, ChevronUp, RefreshCw, Calendar, ArrowRight, ClipboardList, TrendingUp, CheckCircle2, Users, AlertCircle, Search, SlidersHorizontal, LayoutGrid, Rows3, X, Package, XCircle, Truck, Clock, Wallet, ArrowUpDown } from "lucide-react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import * as SelectPrimitive from "@radix-ui/react-select";
const BASE_URL = "https://distr.mxsoft.uz/api";
const WS_BASE = BASE_URL.replace(/^https?/, "wss");
const proxied1C = (baseUrl, path) => `/proxy-1c?target=${encodeURIComponent(baseUrl)}&path=${encodeURIComponent(path)}`;
const API = {
  login: `${BASE_URL}/v1/authentication/login`,
  logout: `${BASE_URL}/v1/authentication/logout`,
  profile: `${BASE_URL}/v1/authentication/profile`,
  wsLocations: (token) => `${WS_BASE}/v1/locations/ws/admvs?token=${token}`,
  userHistory: (userId) => `${BASE_URL}/v1/locations/user-history/${userId}`,
  workingSession: (userId, role) => {
    const appRole = role ? role.toLowerCase() === "deliverer" ? "delivery" : role.toLowerCase() : "agent";
    return `${BASE_URL}/v1/working-sessions/user/${userId}?app=mx-${appRole}&is_testing=false`;
  },
  clientLocations: (baseUrl) => proxied1C(baseUrl, "/hs/manager/api/get_location_all"),
  clientInfo: (baseUrl, clientId) => proxied1C(baseUrl, `/hs/manager/api/get_client_info?client_id=${clientId}`),
  clientVisitData: (baseUrl, clientId) => proxied1C(baseUrl, `/hs/manager/api/get_visit_data_by_client?client_id=${clientId}`),
  clientsByGroup: (baseUrl) => proxied1C(baseUrl, "/hs/manager/api/GetClientsbyGroup"),
  productsByGroup: (baseUrl) => proxied1C(baseUrl, "/hs/manager/api/Getproductsbygroup"),
  employees: (baseUrl) => proxied1C(baseUrl, "/hs/manager/api/get_employees"),
  activationRequests: (baseUrl) => proxied1C(baseUrl, "/hs/manager/api/GetListQueryActivation"),
  activationDevice: (baseUrl) => proxied1C(baseUrl, "/hs/manager/api/ActivationDevice"),
  marksByGroup: (baseUrl) => proxied1C(baseUrl, "/hs/manager/api/Getmarksbygroup"),
  userManager: `${BASE_URL}/v1/user-manager`,
  userManagerStatus: (userId) => `${BASE_URL}/v1/user-manager/${userId}`,
  salesByCategory: (baseUrl, branchId, dateBegin, dateEnd) => proxied1C(
    baseUrl,
    `/hs/manager/api/get_sales_by_category?branch_id=${branchId}&date_begin=${dateBegin}&date_end=${dateEnd}`
  ),
  reportByClient: (baseUrl, branchId, dateBegin, dateEnd) => proxied1C(
    baseUrl,
    `/hs/manager/api/get_report_by_client?branch_id=${branchId}&date_begin=${dateBegin}&date_end=${dateEnd}`
  ),
  financeOrders: (baseUrl, dateBegin, dateEnd) => proxied1C(
    baseUrl,
    `/hs/manager/api/GetlistordersAll?date_begin=${dateBegin}&date_end=${dateEnd}`
  ),
  ordersAll: (baseUrl, dateBegin, dateEnd) => proxied1C(
    baseUrl,
    `/hs/manager/api/GetlistordersAll?date_begin=${dateBegin}&date_end=${dateEnd}`
  ),
  companyById: (id) => `${BASE_URL}/v1/companies/${id}`,
  companies: `${BASE_URL}/v1/companies/`,
  companySecurityKeys: (id) => `${BASE_URL}/v1/companies/${id}/security-keys`,
  securityKeyById: (id) => `${BASE_URL}/v1/companies/security-keys/${id}`,
  notifications: `${BASE_URL}/v1/notifications`,
  notificationsCreate: `${BASE_URL}/v1/notifications/create`,
  notificationById: (id) => `${BASE_URL}/v1/notifications/${id}`,
  notificationRead: (id) => `${BASE_URL}/v1/notifications/${id}/read`,
  notificationsReadMultiple: `${BASE_URL}/v1/notifications/read-multiple`,
  notificationsUnreadCount: `${BASE_URL}/v1/notifications/unread-count`,
  apps: `${BASE_URL}/v1/apps/`,
  appById: (id) => `${BASE_URL}/v1/apps/${id}`,
  appVersions: (id) => `${BASE_URL}/v1/apps/${id}/versions`,
  versionById: (id) => `${BASE_URL}/v1/apps/versions/${id}`,
  latestVersion: (appType) => `${BASE_URL}/v1/apps/latest-version?app_type=${appType}`,
  uploadApk: `${BASE_URL}/v1/apps/upload-apk`,
  devices: `${BASE_URL}/v1/devices/`,
  workingSessions: `${BASE_URL}/v1/working-sessions`,
  workingSessionsByUser: (userId) => `${BASE_URL}/v1/working-sessions/user/${userId}`,
  userManagerCreate: `${BASE_URL}/v1/user-manager/create`,
  userManagerById: (id) => `${BASE_URL}/v1/user-manager/${id}`,
  systemMonitor: `${BASE_URL}/v1/system-monitor/`,
  databaseInfo: `${BASE_URL}/v1/system-monitor/database`,
  alembicVersionList: `${BASE_URL}/v1/admin/alembic-version/list`,
  alembicVersionCreate: `${BASE_URL}/v1/admin/alembic-version/create`,
  alembicVersionDelete: (versionNum) => `${BASE_URL}/v1/admin/alembic-version/${versionNum}`,
  activity: (lang) => `${BASE_URL}/v1/activity?lang=${lang}`
};
const Ctx = createContext(null);
const KEY = "distr.auth";
function profileToUser(p) {
  return {
    ...p,
    name: `${p.first_name} ${p.last_name}`.trim() || p.username
  };
}
async function fetchProfile(token) {
  const res = await fetch(API.profile, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  const data = await res.json();
  return profileToUser(data);
}
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      setLoading(false);
      return;
    }
    try {
      const session = JSON.parse(raw);
      if (!session.access_token || new Date(session.expires_in) <= /* @__PURE__ */ new Date()) {
        window.localStorage.removeItem(KEY);
        setLoading(false);
        return;
      }
      setAccessToken(session.access_token);
      if (session.user?.id) {
        setUser(session.user);
        setLoading(false);
      }
      fetchProfile(session.access_token).then((u) => {
        const updated = { ...session, user: u };
        window.localStorage.setItem(KEY, JSON.stringify(updated));
        setUser(u);
      }).catch(() => {
      }).finally(() => setLoading(false));
    } catch {
      window.localStorage.removeItem(KEY);
      setLoading(false);
    }
  }, []);
  const login = async (email, password) => {
    const res = await fetch(API.login, {
      method: "POST",
      headers: { accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, device_id: "web", firebase_token: "" })
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Login failed (${res.status})`);
    }
    const data = await res.json();
    setAccessToken(data.access_token);
    const u = await fetchProfile(data.access_token);
    const session = {
      user: u,
      access_token: data.access_token,
      expires_in: data.expires_in,
      user_id: data.user_id
    };
    window.localStorage.setItem(KEY, JSON.stringify(session));
    setUser(u);
  };
  const logout = () => {
    window.localStorage.removeItem(KEY);
    setUser(null);
    setAccessToken(null);
  };
  return /* @__PURE__ */ jsx(Ctx.Provider, { value: { user, login, logout, accessToken, loading }, children });
}
function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
const dict = {
  uz: {
    appTagline: "Distributsiya biznesini boshqarishning yagona platformasi",
    welcomeBack: "Xush kelibsiz",
    signInSubtitle: "Distr ish maydoniga kiring",
    email: "Elektron pochta",
    password: "Parol",
    signIn: "Kirish",
    demoNote: "Demo rejim — istalgan ma'lumotlar ishlaydi.",
    search: "Qidirish…",
    logout: "Chiqish",
    // nav
    dashboard: "Boshqaruv paneli",
    clients: "Mijozlar",
    sales: "Sotuvlar",
    staff: "Xodimlar",
    warehouse: "Ombor",
    finance: "Moliya",
    production: "Ishlab chiqarish",
    liveMap: "Jonli xarita",
    reports: "Hisobotlar",
    calendar: "Kalendar",
    notifications: "Bildirishnomalar",
    settings: "Sozlamalar",
    profile: "Profil",
    // dashboard
    overview: "Biznesingizning umumiy ko'rinishi.",
    totalSales: "Jami sotuvlar",
    activeClients: "Faol mijozlar",
    revenue: "Daromad",
    orders: "Buyurtmalar",
    salesPerformance: "Sotuv samaradorligi",
    ordersByMonth: "Oylik buyurtmalar",
    recentActivity: "So'nggi faollik",
    topClients: "Eng yaxshi mijozlar",
    topStaff: "Eng yaxshi xodimlar",
    salesByCategory: "Kategoriya bo'yicha",
    generalReport: "Umumiy hisobot",
    plan: "Reja",
    fact: "Fakt",
    summaryReport: "Umumiy hisobot",
    agentsVisits: "Agentlar tashriflari",
    efficiency: "Samaradorlik",
    dan: "Dan",
    gacha: "Gacha",
    savdoTab: "Savdo",
    done: "Bajarildi",
    average: "O'rtacha",
    returnedQty: "Qaytgan miqdor",
    returnedSumma: "Qaytgan summa",
    agentStats: "Agentlar statistikasi",
    agentVisitDetails: "Agentlar tashriflari",
    categorySalesDetail: "Kategoriyalar tafsiloti",
    kpiSection: "KPI bo'limi",
    kpiComingSoon: "Hozirda ushbu sahifa ustida ish olib borilmoqda. Tez orada bu yerda samaradorlik ko'rsatkichlari (KPI) paydo bo'ladi.",
    noVisit: "Tashrif yo'q",
    noAgents: "Agentlar topilmadi",
    noGroups: "Guruhlar topilmadi",
    noProducts: "Mahsulotlar topilmadi",
    territories: "Hududlar",
    shareOfSumma: "Summa ulushi",
    shareOfQty: "Miqdor ulushi",
    piece: "dona",
    totalSummary: "Umumiy hisobot",
    underConstruction: "Ishlab chiqish jarayonida",
    openClientBase: "Ochiq klientlar bazasi",
    activeClientBase: "Aktiv klientlar bazasi",
    photos: "Fotosuratlar",
    rejected: "Rad etilgan",
    // common
    add: "Qo'shish",
    edit: "Tahrirlash",
    save: "Saqlash",
    cancel: "Bekor qilish",
    create: "Yaratish",
    filter: "Filter",
    name: "Ism",
    phone: "Telefon",
    location: "Manzil",
    status: "Holat",
    joined: "Qo'shilgan",
    all: "Hammasi",
    active: "Faol",
    inactive: "Faol emas",
    pending: "Kutilmoqda",
    delivered: "Yetkazildi",
    cancelled: "Bekor qilindi",
    inProgress: "Jarayonda",
    completed: "Tugallandi",
    delayed: "Kechikkan",
    shipped: "Yuborilgan",
    // pages
    ordersDesc: "Barcha buyurtmalarni kuzating va boshqaring.",
    ordersPage: "Buyurtmalar",
    orderNumber: "Buyurtma raqami",
    orderDate: "Buyurtma sanasi",
    orderStatus: "Holat",
    orderAgent: "Agent",
    orderItems: "Mahsulotlar soni",
    orderTotal: "Jami summa",
    orderWarehouse: "Ombor",
    noOrders: "Buyurtmalar topilmadi",
    clientsDesc: "Mijozlarni va ularning hisoblarini boshqaring.",
    addClient: "Mijoz qo'shish",
    editClient: "Mijozni tahrirlash",
    salesDesc: "Buyurtmalarni kuzating va oylik samaradorlikni ko'ring.",
    monthlySales: "Oylik sotuvlar",
    orderId: "Buyurtma ID",
    client: "Mijoz",
    date: "Sana",
    amount: "Summa",
    staffDesc: "Jamoa a'zolari, rollar va samaradorlik.",
    registered: "Ro'yxatdan o'tgan",
    block: "Bloklash",
    unblock: "Blokdan olish",
    role: "Rol",
    performance: "Samaradorlik",
    warehouseDesc: "Ombor mahsulotlari va zaxirasi.",
    sku: "SKU",
    product: "Mahsulot",
    category: "Kategoriya",
    stock: "Zaxira",
    threshold: "Minimum",
    lowStock: "Kam zaxira",
    inStock: "Mavjud",
    financeDesc: "Daromad, xarajatlar va oylik xulosa.",
    income: "Daromad",
    expense: "Xarajat",
    netProfit: "Sof foyda",
    monthlySummary: "Oylik xulosa",
    transactions: "Tranzaksiyalar",
    type: "Turi",
    party: "Tomon",
    productionDesc: "Faol ishlab chiqarish partiyalari.",
    batch: "Partiya",
    quantity: "Miqdor",
    start: "Boshlanish",
    due: "Muddati",
    liveMapDesc: "Agentlarini real vaqtda kuzatish.",
    activeAgents: "Faol Hodimlar",
    reportsDesc: "Tahliliy hisobotlar va biznes ko'rsatkichlari.",
    calendarDesc: "Rejalashtirilgan tadbirlar va vazifalar.",
    notificationsDesc: "Tizim bildirishnomalari va ogohlantirishlar.",
    settingsDesc: "Ish maydoni sozlamalari.",
    profileDesc: "Sizning profil ma'lumotlaringiz.",
    language: "Til",
    theme: "Mavzu",
    light: "Yorug'",
    dark: "Qorong'i",
    notFound: "Hech narsa topilmadi.",
    today: "Bugun",
    growth: "o'sish",
    new: "yangi",
    markRead: "O'qilgan deb belgilash",
    upcoming: "Yaqinlashayotgan tadbirlar",
    noEvents: "Bu kun uchun tadbirlar yo'q.",
    calendarDailyNotes: "Kunlik eslatmalar",
    calendarActiveDays: "faol kun",
    calendarNotesCount: "eslatma",
    calendarTitle: "Sarlavha",
    calendarWriteNote: "Eslatmani yozing...",
    calendarClearDay: "Kunni tozalash",
    calendarNoNotesForDay: "Bu kun uchun hali eslatma yo'q.",
    calendarDeleteNote: "Eslatmani o'chirish",
    calendarNotesInMonth: "shu oyda eslatma",
    calendarUntitledNote: "Nomsiz eslatma",
    online: "Online",
    offline: "Offline",
    supervisor: "Supervisor",
    deliverer: "Yetkazuvchi",
    allRoles: "Hammasi",
    agents: "Agentlar",
    supervisors: "Supervisorlar",
    deliverers: "Yetkazuvchilar",
    speed: "Tezlik",
    workStartTime: "Ish boshlash vaqti",
    distanceTraveled: "Yurgan masofa",
    kmh: "km/soat",
    km: "km",
    agentInfo: "Agent ma'lumotlari",
    notAvailable: "Mavjud emas",
    clientsOnMap: "Xaritadagi mijozlar",
    showClients: "Mijozlarni ko'rsatish",
    hideClients: "Mijozlarni yashirish",
    lastSale: "So'nggi sotuv",
    debt: "Qarz",
    agent: "Agent",
    filial: "Filial",
    devices: "Qurilmalar",
    devicesDesc: "Qurilmalarni boshqarish va kuzatish",
    noClients: "Mijozlar topilmadi",
    errorTitle: "Ulanishda xatolik",
    errorClientsLoad: "Mijozlar ro'yxatini yuklash mumkin emas. Iltimos, keyinroq qayta urinib ko'ring.",
    comingSoon: "Tez kunda",
    dateBegin: "Boshlanish sanasi",
    dateEnd: "Tugash sanasi",
    branchId: "Filial ID",
    searchCategoryOrProduct: "Kategoriya yoki mahsulot qidirish",
    totalSalesAmount: "Jami savdo (summa)",
    totalVolumeKg: "Jami hajm (kg)",
    ordersClients: "Buyurtmalar / mijozlar",
    planCompletion: "Reja bajarilishi",
    amountByCategoryChart: "Kategoriyalar bo'yicha summa (grafik)",
    categoryShare: "Kategoriya ulushi",
    salesByCategories: "Kategoriyalar bo'yicha savdo",
    qty: "Miqdor",
    qtyPercent: "Miqdor %",
    amountPercent: "Summa %",
    topProducts: "Top mahsulotlar",
    agentMetrics: "Agentlar bo'yicha ko'rsatkichlar",
    result: "Natija",
    planFact: "Reja / Fakt",
    orderClient: "Buyurtma / Mijoz",
    totalAmount: "Jami summa",
    ordersLower: "buyurtma",
    sortDateNewOld: "Sana: yangi-eski",
    sortDateOldNew: "Sana: eski-yangi",
    sortAmountHighLow: "Summa: katta-kichik",
    sortAmountLowHigh: "Summa: kichik-katta",
    sortQtyHighLow: "Miqdor: katta-kichik",
    sortQtyLowHigh: "Miqdor: kichik-katta",
    sortClientAZ: "Mijoz: A-Z",
    sortClientZA: "Mijoz: Z-A",
    cardsView: "Kartalar",
    tableView: "Jadval",
    totalProductsCount: "Umumiy mahsulotlar soni",
    totalVolumeQty: "Jami hajm (miqdor)",
    dailyIncomeExpenseTrend: "Kunlik daromad / xarajat dinamikasi",
    statusShare: "Statuslar ulushi",
    id: "ID",
    products: "Mahsulotlar",
    navMain: "Asosiy",
    navOperations: "Operatsiyalar",
    navInsights: "Tahlillar",
    navAccount: "Hisob",
    markirovka: "Markirovka",
    markirovkaDesc: "Mahsulotlarni markirovka qilish",
    markingBatch: "Partiya",
    markingGtin: "GTIN",
    markingStatus: "Holat",
    markingQuantity: "Soni",
    markingDate: "Sana",
    markingPending: "Kutilmoqda",
    markingApproved: "Tasdiqlangan",
    markingError: "Xato",
    expandSidebar: "Yon panelni kengaytirish",
    collapseSidebar: "Yon panelni yig'ish",
    user: "Foydalanuvchi",
    notificationTitle1: "Yangi buyurtma #ORD-3411",
    notificationDesc1: "Mega Retail LLC buyurtma joylashtirdi — $14,200",
    notificationTime1: "5 daq",
    notificationTitle2: "Kam zaxira ogohlantirishi",
    notificationDesc2: "Coffee 250g minimumdan past (38 qoldi)",
    notificationTime2: "1 soat",
    notificationTitle3: "Partiya tugallandi",
    notificationDesc3: "PRD-558 — Detergent 3kg (2,400 dona)",
    notificationTime3: "3 soat",
    notificationTitle4: "Yangi mijoz qo'shildi",
    notificationDesc4: "Tashkent Foods mijozlar ro'yxatiga qo'shildi",
    notificationTime4: "5 soat",
    notificationTitle5: "Eslatma",
    notificationDesc5: "Oylik hisobot topshirish muddati ertaga",
    notificationTime5: "1 kun",
    notificationTitle6: "Buyurtma yetkazildi",
    notificationDesc6: "#ORD-3407 — Khiva Wholesale",
    notificationTime6: "2 kun",
    sortAZ: "A-Z",
    sortZA: "Z-A",
    sortTypeAsc: "Rol: A-Z",
    sortTypeDesc: "Rol: Z-A",
    sortDebtHighLow: "Qarz: katta-kichik",
    sortDebtLowHigh: "Qarz: kichik-katta",
    sortLastSaleNewOld: "So'nggi savdo: yangi-eski",
    sortLastSaleOldNew: "So'nggi savdo: eski-yangi",
    sortNameAZ: "Nomi: A-Z",
    sortNameZA: "Nomi: Z-A",
    sortStockHighLow: "Qoldiq: katta-kichik",
    sortStockLowHigh: "Qoldiq: kichik-katta",
    sortPriceHighLow: "Narx: katta-kichik",
    sortPriceLowHigh: "Narx: kichik-katta",
    contact: "Aloqa",
    username: "Foydalanuvchi nomi",
    company: "Kompaniya",
    manager: "Menejer",
    oneCData: "1C ma'lumotlari",
    oneCId: "1C ID",
    oneCLogin: "1C login",
    topAgents: "Top agentlar",
    topGroups: "Top guruhlar",
    totalQty: "Jami miqdor",
    photo: "Foto",
    returned: "Qaytgan",
    clientOpenProfile: "Mijoz · Profilni ochish",
    visit: "Tashrif",
    comment: "Izoh",
    back: "Orqaga",
    clientProfile: "Mijoz profili",
    loading: "Yuklanmoqda...",
    photoReports: "Foto hisobotlar",
    rejectedPhotos: "Rad etilgan rasmlar",
    payments: "To'lovlar",
    locationLandmark: "Manzil orientir",
    activities: "Faoliyatlar",
    noData: "Ma'lumot yo'q",
    photoReport: "Foto hisobot",
    viewFull: "To'liq ko'rish",
    reasonNotSpecified: "Sabab ko'rsatilmagan",
    noComment: "Izoh yo'q",
    payment: "To'lov",
    cash: "Naqd",
    card: "Karta",
    adminDashboard: "Boshqaruv paneli",
    adminDashboardSubtitle: "Platforma statistikasi va tahlillar",
    adminUsers: "Foydalanuvchilar",
    adminUsersSubtitle: "Tizimga kirgan foydalanuvchilar ro'yxati",
    adminCompanies: "Companiyalar",
    adminCompaniesSubtitle: "Platformadagi kompaniyalar ro'yxati",
    adminMobileApps: "Mobil ilovalar",
    adminMobileAppsSubtitle: "Admin nazorati ostidagi ilovalar",
    adminDevices: "Qurilmalar",
    adminDevicesSubtitle: "Qurilmalarni tasdiqlash va boshqarish",
    adminDevicesAll: "Barchasi",
    adminDevicesPending: "Kutilmoqda",
    adminDevicesApproved: "Tasdiqlangan",
    adminDevicesRejected: "Rad etilgan",
    adminDevicesNotFound: "Qurilmalar topilmadi",
    deviceApproved: "Qurilma tasdiqlandi",
    deviceRejected: "Qurilma rad etildi",
    adminNotifications: "Xabarnomalar",
    adminNotificationsSubtitle: "Oxirgi tizim xabarnomalari (mock)",
    adminSettings: "Sozlamalar",
    adminSettingsSubtitle: "Admin panelning umumiy sozlamalari",
    adminWorkingSessions: "Ish sessiyalari",
    adminWorkingSessionsSubtitle: "Foydalanuvchilar bo'yicha ish sessiyalari",
    adminWorkingSessionsSearch: "Qidirish (foydalanuvchi, qurilma, ilova)...",
    allUsers: "Barcha foydalanuvchilar",
    allApps: "Barcha ilovalar",
    sessions: "sessiya",
    sessionTime: "Sessiya vaqti",
    device: "Qurilma",
    application: "Ilova",
    testing: "Test",
    sessionDetails: "Sessiya tafsilotlari",
    sessionDetailsDesc: "Ish sessiyasi haqida to'liq ma'lumot",
    noSessionsFound: "Hech qanday sessiya topilmadi",
    yes: "Ha",
    no: "Yo'q",
    total: "Jami",
    adminSearchPlaceholder: "Admin panel bo'yicha qidirish...",
    adminOwner: "Ega",
    adminPlan: "Tarif",
    adminPlatform: "Platforma",
    adminVersion: "Versiya",
    adminViewType: "Ko'rinish turi",
    adminViewTypeSubtitle: "Jadval yoki kartochka ko'rinishini tanlang",
    adminParameter: "Parametr",
    adminValue: "Qiymat",
    adminLoginTitle: "Admin Login",
    adminLoginSubtitle: "Admin panelga kirish uchun login qiling",
    adminLoginRequired: "Login yoki parol kiriting.",
    goToMainSite: "Asosiy saytga o'tish",
    adminPanel: "Admin Panel",
    // Admin settings new keys
    export: "Eksport",
    import: "Import",
    saveAll: "Barchasini saqlash",
    general: "Umumiy",
    securityKeys: "Xavfsizlik",
    database: "Ma'lumotlar bazasi",
    integrations: "Integratsiyalar",
    localization: "Lokalizatsiya",
    localizationDesc: "Platforma tili, vaqt zonasi va sana formati sozlamalari",
    platformName: "Platforma nomi",
    defaultLanguage: "Default til",
    timezone: "Vaqt zonasi",
    dateFormat: "Sana formati",
    pushNotifications: "Push bildirishnomalar",
    pushNotificationsDesc: "Brauzer push bildirishnomalarini yoqish",
    emailNotifications: "Email bildirishnomalar",
    emailNotificationsDesc: "Email orqali bildirishnomalarni yoqish",
    security: "Xavfsizlik",
    securityDesc: "Admin panel xavfsizlik sozlamalari",
    sessionTimeout: "Session vaqti",
    maxLoginAttempts: "Maksimal kirish urinishlari",
    apiKeys: "API kalitlar",
    apiKeysDesc: "Tashqi integratsiyalar uchun API kalitlarni boshqarish",
    addKey: "Kalit qo'shish",
    addNewKey: "Yangi API kalit qo'shish",
    addNewKeyDesc: "Yangi API kalit yaratish uchun nom kiriting",
    keyName: "Kalit nomi",
    apiKey: "API kalit",
    created: "Yaratilgan",
    lastUsed: "Oxirgi ishlatilgan",
    actions: "Amallar",
    regenerate: "Qayta yaratish",
    alembicVersions: "Alembic versiyalari",
    alembicVersionsDesc: "Ma'lumotlar bazasi migratsiya tarixi",
    currentVersion: "Joriy versiya",
    headRevision: "HEAD reviziyasi",
    version: "Versiya",
    description: "Tavsif",
    timestamp: "Vaqt",
    applied: "Qo'llanilgan",
    databaseInfo: "Ma'lumotlar bazasi ma'lumotlari",
    databaseInfoDesc: "Ma'lumotlar bazasi holati va statistikasi",
    dbSize: "Baza hajmi",
    tables: "Jadvallar",
    connections: "Ulanishlar",
    uptime: "Ish vaqti",
    webhooks: "Webhooklar",
    webhooksDesc: "Tashqi hodisalar uchun webhook sozlamalari",
    addWebhook: "Webhook qo'shish",
    addNewWebhook: "Yangi webhook qo'shish",
    addNewWebhookDesc: "Webhook URL manzilini kiriting",
    webhookUrl: "Webhook URL",
    url: "URL",
    events: "Hodisalar",
    copyUrl: "URL nusxalash",
    emailTemplates: "Email shablonlar",
    emailTemplatesDesc: "Avtomatlashtirilgan email xabarlari shablonlari",
    templateName: "Shablon nomi",
    subject: "Mavzu",
    paymentMethods: "To'lov usullari",
    paymentMethodsDesc: "Onlayn to'lov tizimlari integratsiyalari",
    connected: "Ulangan",
    // System Monitor
    systemMonitor: "Tizim monitori",
    systemMonitorError: "Tizim ma'lumotlarini yuklashda xatolik yuz berdi",
    refresh: "Yangilash",
    smSystemInfo: "Tizim ma'lumotlari",
    smHostname: "Xost nomi",
    smArch: "Arxitektura",
    smUptime: "Ish vaqti",
    smCpu: "Protsessor",
    smFrequency: "Chastota",
    smMemory: "Xotira",
    smAvailable: "Mavjud",
    smDisk: "Disk",
    smFree: "Bo'sh",
    smNetwork: "Tarmoq",
    smSent: "Yuborilgan",
    smReceived: "Qabul qilingan",
    smPacketsSent: "Yuborilgan paketlar",
    smPacketsRecv: "Qabul qilingan paketlar",
    smTopProcesses: "Yuqori jarayonlar",
    smProcessName: "Nomi",
    smMemUsage: "Xotira %",
    // dashboard new keys
    akbTab: "AKB",
    kpiTab: "KPI",
    noCategories: "Kategoriyalar topilmadi",
    agentVisitsBy: "Agentlar bo'yicha tashriflar",
    okb: "OKB",
    akbNoun: "AKB",
    unknown: "Noma'lum",
    noDataFound: "Ma'lumot topilmadi",
    noClientsInGroup: "Mijozlar topilmadi",
    planFactCompact: "Reja/Fakt",
    doneLowercase: "bajarildi",
    ordersPlural: "buyurtmalar",
    summaLabel: "Summa",
    qtyLabel: "Miqdor",
    ordersLabel: "Buyurtmalar",
    clientsLabel: "Mijozlar",
    averageLabel: "O'rtacha",
    returnedQtyLabel: "Qaytgan miqdor",
    returnedSummaLabel: "Qaytgan summa",
    returnLabel: "Qaytgan",
    territoriesLabel: "Hududlar"
  },
  ru: {
    appTagline: "Единая платформа для управления дистрибьюторским бизнесом",
    welcomeBack: "С возвращением",
    signInSubtitle: "Войдите в рабочее пространство Distr",
    email: "Эл. почта",
    password: "Пароль",
    signIn: "Войти",
    demoNote: "Демо-режим — подойдут любые данные.",
    search: "Поиск…",
    logout: "Выйти",
    dashboard: "Панель",
    clients: "Клиенты",
    sales: "Продажи",
    staff: "Сотрудники",
    warehouse: "Склад",
    finance: "Финансы",
    production: "Производство",
    liveMap: "Карта",
    reports: "Отчёты",
    calendar: "Календарь",
    notifications: "Уведомления",
    settings: "Настройки",
    profile: "Профиль",
    overview: "Обзор вашего бизнеса.",
    totalSales: "Всего продаж",
    activeClients: "Активные клиенты",
    revenue: "Выручка",
    orders: "Заказы",
    salesPerformance: "Динамика продаж",
    ordersByMonth: "Заказы по месяцам",
    recentActivity: "Недавние события",
    topClients: "Топ клиенты",
    topStaff: "Топ сотрудники",
    salesByCategory: "По категориям",
    dan: "От",
    gacha: "До",
    savdoTab: "Продажи",
    done: "Выполнено",
    average: "Среднее",
    returnedQty: "Возврат (кол-во)",
    returnedSumma: "Возврат (сумма)",
    agentStats: "Статистика агентов",
    agentVisitDetails: "Посещения агентов",
    categorySalesDetail: "Детали по категориям",
    kpiSection: "Раздел KPI",
    kpiComingSoon: "Данный раздел находится в разработке. Скоро здесь появятся показатели эффективности (KPI).",
    noVisit: "Нет визита",
    noAgents: "Агенты не найдены",
    noGroups: "Группы не найдены",
    noProducts: "Товары не найдены",
    territories: "Территории",
    shareOfSumma: "Доля по сумме",
    shareOfQty: "Доля по кол-ву",
    piece: "шт",
    totalSummary: "Общий отчёт",
    generalReport: "Общий отчет",
    plan: "План",
    fact: "Факт",
    summaryReport: "Сводный отчет",
    agentsVisits: "Визиты агентов",
    efficiency: "Эффективность",
    underConstruction: "В разработке",
    openClientBase: "Открытая база клиентов",
    activeClientBase: "Активная база клиентов",
    photos: "Фотографии",
    rejected: "Отклоненные",
    add: "Добавить",
    edit: "Изменить",
    save: "Сохранить",
    cancel: "Отмена",
    create: "Создать",
    filter: "Фильтр",
    name: "Имя",
    phone: "Телефон",
    location: "Локация",
    status: "Статус",
    joined: "Добавлен",
    all: "Все",
    active: "Активен",
    inactive: "Неактивен",
    pending: "В ожидании",
    delivered: "Доставлено",
    cancelled: "Отменено",
    inProgress: "В процессе",
    completed: "Завершено",
    delayed: "Задержано",
    shipped: "Отправлено",
    ordersDesc: "Отслеживайте и управляйте всеми заказами.",
    ordersPage: "Заказы",
    orderNumber: "Номер заказа",
    orderDate: "Дата заказа",
    orderStatus: "Статус",
    orderAgent: "Агент",
    orderItems: "Кол-во товаров",
    orderTotal: "Итоговая сумма",
    orderWarehouse: "Склад",
    noOrders: "Заказы не найдены",
    clientsDesc: "Управляйте клиентами и их аккаунтами.",
    addClient: "Добавить клиента",
    editClient: "Редактировать клиента",
    salesDesc: "Отслеживайте заказы и динамику продаж.",
    monthlySales: "Продажи по месяцам",
    orderId: "ID заказа",
    client: "Клиент",
    date: "Дата",
    amount: "Сумма",
    staffDesc: "Сотрудники, роли и эффективность.",
    registered: "Дата регистрации",
    block: "Заблокировать",
    unblock: "Разблокировать",
    role: "Роль",
    performance: "Эффективность",
    warehouseDesc: "Складские товары и остатки.",
    sku: "Артикул",
    product: "Товар",
    category: "Категория",
    stock: "Остаток",
    threshold: "Минимум",
    lowStock: "Мало остатка",
    inStock: "В наличии",
    financeDesc: "Доходы, расходы и месячная сводка.",
    income: "Доход",
    expense: "Расход",
    netProfit: "Чистая прибыль",
    monthlySummary: "Сводка за месяц",
    transactions: "Транзакции",
    type: "Тип",
    party: "Контрагент",
    productionDesc: "Активные производственные партии.",
    batch: "Партия",
    quantity: "Кол-во",
    start: "Начало",
    due: "Срок",
    liveMapDesc: "Отслеживание агентов в реальном времени.",
    activeAgents: "Активные агенты",
    reportsDesc: "Аналитические отчёты и показатели.",
    calendarDesc: "Запланированные события и задачи.",
    notificationsDesc: "Системные уведомления и оповещения.",
    settingsDesc: "Настройки рабочего пространства.",
    profileDesc: "Информация вашего профиля.",
    language: "Язык",
    theme: "Тема",
    light: "Светлая",
    dark: "Тёмная",
    notFound: "Ничего не найдено.",
    today: "Сегодня",
    growth: "рост",
    new: "новых",
    markRead: "Отметить прочитанным",
    upcoming: "Предстоящие события",
    noEvents: "На этот день событий нет.",
    calendarDailyNotes: "Ежедневные заметки",
    calendarActiveDays: "активных дней",
    calendarNotesCount: "заметок",
    calendarTitle: "Заголовок",
    calendarWriteNote: "Введите заметку...",
    calendarClearDay: "Очистить день",
    calendarNoNotesForDay: "На этот день пока нет заметок.",
    calendarDeleteNote: "Удалить заметку",
    calendarNotesInMonth: "заметок в этом месяце",
    calendarUntitledNote: "Заметка без названия",
    online: "Онлайн",
    offline: "Офлайн",
    supervisor: "Супервайзер",
    deliverer: "Доставщик",
    allRoles: "Все",
    agents: "Агенты",
    supervisors: "Супервайзеры",
    deliverers: "Доставщики",
    speed: "Скорость",
    workStartTime: "Начало работы",
    distanceTraveled: "Пройдено",
    kmh: "км/ч",
    km: "км",
    agentInfo: "Информация агента",
    notAvailable: "Недоступно",
    clientsOnMap: "Клиенты на карте",
    showClients: "Показать клиентов",
    hideClients: "Скрыть клиентов",
    lastSale: "Последняя продажа",
    debt: "Долг",
    agent: "Агент",
    filial: "Филиал",
    devices: "Устройства",
    devicesDesc: "Управление и отслеживание устройств",
    noClients: "Клиенты не найдены",
    errorTitle: "Ошибка подключения",
    errorClientsLoad: "Не удалось загрузить список клиентов. Пожалуйста, попробуйте позже.",
    comingSoon: "Скоро",
    dateBegin: "Дата начала",
    dateEnd: "Дата окончания",
    branchId: "ID филиала",
    searchCategoryOrProduct: "Поиск категории или товара",
    totalSalesAmount: "Общие продажи (сумма)",
    totalVolumeKg: "Общий объем (кг)",
    ordersClients: "Заказы / клиенты",
    planCompletion: "Выполнение плана",
    amountByCategoryChart: "Сумма по категориям (график)",
    categoryShare: "Доля категорий",
    salesByCategories: "Продажи по категориям",
    qty: "Кол-во",
    qtyPercent: "Кол-во %",
    amountPercent: "Сумма %",
    topProducts: "Топ товары",
    agentMetrics: "Показатели по агентам",
    result: "Результат",
    planFact: "План / Факт",
    orderClient: "Заказ / Клиент",
    totalAmount: "Общая сумма",
    ordersLower: "заказов",
    sortDateNewOld: "Дата: новые-старые",
    sortDateOldNew: "Дата: старые-новые",
    sortAmountHighLow: "Сумма: больше-меньше",
    sortAmountLowHigh: "Сумма: меньше-больше",
    sortQtyHighLow: "Кол-во: больше-меньше",
    sortQtyLowHigh: "Кол-во: меньше-больше",
    sortClientAZ: "Клиент: A-Z",
    sortClientZA: "Клиент: Z-A",
    cardsView: "Карточки",
    tableView: "Таблица",
    totalProductsCount: "Общее количество товаров",
    totalVolumeQty: "Общий объем (кол-во)",
    dailyIncomeExpenseTrend: "Динамика доходов/расходов по дням",
    statusShare: "Доля статусов",
    id: "ID",
    products: "Товары",
    navMain: "Главное",
    navOperations: "Операции",
    navInsights: "Аналитика",
    navAccount: "Аккаунт",
    markirovka: "Маркировка",
    markirovkaDesc: "Маркировка продукции",
    markingBatch: "Партия",
    markingGtin: "GTIN",
    markingStatus: "Статус",
    markingQuantity: "Количество",
    markingDate: "Дата",
    markingPending: "В ожидании",
    markingApproved: "Подтверждено",
    markingError: "Ошибка",
    expandSidebar: "Развернуть боковую панель",
    collapseSidebar: "Свернуть боковую панель",
    user: "Пользователь",
    notificationTitle1: "Новый заказ #ORD-3411",
    notificationDesc1: "Mega Retail LLC разместил заказ — $14,200",
    notificationTime1: "5 мин",
    notificationTitle2: "Предупреждение о низком остатке",
    notificationDesc2: "Coffee 250g ниже порога (осталось 38)",
    notificationTime2: "1 ч",
    notificationTitle3: "Партия завершена",
    notificationDesc3: "PRD-558 — Detergent 3kg (2,400 ед.)",
    notificationTime3: "3 ч",
    notificationTitle4: "Добавлен новый клиент",
    notificationDesc4: "Tashkent Foods добавлен в список клиентов",
    notificationTime4: "5 ч",
    notificationTitle5: "Напоминание",
    notificationDesc5: "Срок месячного отчета завтра",
    notificationTime5: "1 д",
    notificationTitle6: "Заказ доставлен",
    notificationDesc6: "#ORD-3407 — Khiva Wholesale",
    notificationTime6: "2 д",
    sortAZ: "A-Z",
    sortZA: "Z-A",
    sortTypeAsc: "Роль: A-Z",
    sortTypeDesc: "Роль: Z-A",
    sortDebtHighLow: "Долг: больше-меньше",
    sortDebtLowHigh: "Долг: меньше-больше",
    sortLastSaleNewOld: "Последняя продажа: новые-старые",
    sortLastSaleOldNew: "Последняя продажа: старые-новые",
    sortNameAZ: "Название: A-Z",
    sortNameZA: "Название: Z-A",
    sortStockHighLow: "Остаток: больше-меньше",
    sortStockLowHigh: "Остаток: меньше-больше",
    sortPriceHighLow: "Цена: больше-меньше",
    sortPriceLowHigh: "Цена: меньше-больше",
    contact: "Контакт",
    username: "Имя пользователя",
    company: "Компания",
    manager: "Менеджер",
    oneCData: "Данные 1C",
    oneCId: "1C ID",
    oneCLogin: "1C логин",
    topAgents: "Топ агенты",
    topGroups: "Топ группы",
    totalQty: "Общее кол-во",
    photo: "Фото",
    returned: "Возвраты",
    clientOpenProfile: "Клиент · Открыть профиль",
    visit: "Визит",
    comment: "Комментарий",
    back: "Назад",
    clientProfile: "Профиль клиента",
    loading: "Загрузка...",
    photoReports: "Фотоотчеты",
    rejectedPhotos: "Отклоненные фото",
    payments: "Платежи",
    locationLandmark: "Ориентир адреса",
    activities: "Активности",
    noData: "Нет данных",
    photoReport: "Фотоотчет",
    viewFull: "Открыть полностью",
    reasonNotSpecified: "Причина не указана",
    noComment: "Нет комментария",
    payment: "Платеж",
    cash: "Наличные",
    card: "Карта",
    adminDashboard: "Панель управления",
    adminDashboardSubtitle: "Статистика и аналитика платформы",
    adminUsers: "Пользователи",
    adminUsersSubtitle: "Список пользователей системы (mock)",
    adminCompanies: "Компании",
    adminCompaniesSubtitle: "Список компаний на платформе (mock)",
    adminMobileApps: "Мобильные приложения",
    adminMobileAppsSubtitle: "Приложения под контролем админа (mock)",
    adminDevices: "Устройства",
    adminDevicesSubtitle: "Подтверждение и управление устройствами",
    adminDevicesAll: "Все",
    adminDevicesPending: "В ожидании",
    adminDevicesApproved: "Подтверждено",
    adminDevicesRejected: "Отклонено",
    adminDevicesNotFound: "Устройства не найдены",
    deviceApproved: "Устройство подтверждено",
    deviceRejected: "Устройство отклонено",
    adminNotifications: "Уведомления",
    adminNotificationsSubtitle: "Последние системные уведомления (mock)",
    adminSettings: "Настройки",
    adminSettingsSubtitle: "Общие настройки админ-панели",
    adminWorkingSessions: "Рабочие сессии",
    adminWorkingSessionsSubtitle: "Рабочие сессии по пользователям",
    adminWorkingSessionsSearch: "Поиск (пользователь, устройство, приложение)...",
    allUsers: "Все пользователи",
    allApps: "Все приложения",
    sessions: "сессий",
    sessionTime: "Время сессии",
    device: "Устройство",
    application: "Приложение",
    testing: "Тест",
    sessionDetails: "Детали сессии",
    sessionDetailsDesc: "Подробная информация о рабочей сессии",
    noSessionsFound: "Сессии не найдены",
    yes: "Да",
    no: "Нет",
    total: "Всего",
    adminSearchPlaceholder: "Поиск по админ-панели...",
    adminOwner: "Владелец",
    adminPlan: "Тариф",
    adminPlatform: "Платформа",
    adminVersion: "Версия",
    adminViewType: "Тип отображения",
    adminViewTypeSubtitle: "Выберите табличный или карточный вид",
    adminParameter: "Параметр",
    adminValue: "Значение",
    adminLoginTitle: "Админ логин",
    adminLoginSubtitle: "Войдите для доступа к админ-панели",
    adminLoginRequired: "Введите логин или пароль.",
    goToMainSite: "Перейти на основной сайт",
    adminPanel: "Админ Панель",
    // Admin settings new keys
    export: "Экспорт",
    import: "Импорт",
    saveAll: "Сохранить все",
    general: "Общие",
    securityKeys: "Безопасность",
    database: "База данных",
    integrations: "Интеграции",
    localization: "Локализация",
    localizationDesc: "Настройки языка, часового пояса и формата даты",
    platformName: "Название платформы",
    defaultLanguage: "Язык по умолчанию",
    timezone: "Часовой пояс",
    dateFormat: "Формат даты",
    pushNotifications: "Push уведомления",
    pushNotificationsDesc: "Включить push уведомления браузера",
    emailNotifications: "Email уведомления",
    emailNotificationsDesc: "Включить уведомления по электронной почте",
    security: "Безопасность",
    securityDesc: "Настройки безопасности админ панели",
    sessionTimeout: "Время сессии",
    maxLoginAttempts: "Максимум попыток входа",
    apiKeys: "API ключи",
    apiKeysDesc: "Управление API ключами для внешних интеграций",
    addKey: "Добавить ключ",
    addNewKey: "Добавить новый API ключ",
    addNewKeyDesc: "Введите имя для создания нового API ключа",
    keyName: "Имя ключа",
    apiKey: "API ключ",
    created: "Создан",
    lastUsed: "Последнее использование",
    actions: "Действия",
    regenerate: "Пересоздать",
    alembicVersions: "Версии Alembic",
    alembicVersionsDesc: "История миграций базы данных",
    currentVersion: "Текущая версия",
    headRevision: "HEAD ревизия",
    version: "Версия",
    description: "Описание",
    timestamp: "Время",
    applied: "Применено",
    databaseInfo: "Информация о базе данных",
    databaseInfoDesc: "Состояние и статистика базы данных",
    dbSize: "Размер базы",
    tables: "Таблицы",
    connections: "Подключения",
    uptime: "Время работы",
    webhooks: "Webhook'и",
    webhooksDesc: "Настройки webhook для внешних событий",
    addWebhook: "Добавить webhook",
    addNewWebhook: "Добавить новый webhook",
    addNewWebhookDesc: "Введите URL адрес webhook",
    webhookUrl: "Webhook URL",
    url: "URL",
    events: "События",
    copyUrl: "Копировать URL",
    emailTemplates: "Email шаблоны",
    emailTemplatesDesc: "Шаблоны автоматических email сообщений",
    templateName: "Название шаблона",
    subject: "Тема",
    paymentMethods: "Способы оплаты",
    paymentMethodsDesc: "Интеграции с онлайн платежными системами",
    connected: "Подключено",
    // System Monitor
    systemMonitor: "Системный монитор",
    systemMonitorError: "Ошибка загрузки системных данных",
    refresh: "Обновить",
    smSystemInfo: "Информация о системе",
    smHostname: "Имя хоста",
    smArch: "Архитектура",
    smUptime: "Время работы",
    smCpu: "Процессор",
    smFrequency: "Частота",
    smMemory: "Память",
    smAvailable: "Доступно",
    smDisk: "Диск",
    smFree: "Свободно",
    smNetwork: "Сеть",
    smSent: "Отправлено",
    smReceived: "Получено",
    smPacketsSent: "Отправлено пакетов",
    smPacketsRecv: "Получено пакетов",
    smTopProcesses: "Топ процессов",
    smProcessName: "Имя",
    smMemUsage: "Память %",
    // dashboard new keys
    akbTab: "AKB",
    kpiTab: "КПЭ",
    noCategories: "Категории не найдены",
    agentVisitsBy: "Посещения по агентам",
    okb: "ОКБ",
    akbNoun: "АКБ",
    unknown: "Неизвестно",
    noDataFound: "Данные не найдены",
    noClientsInGroup: "Клиенты не найдены",
    planFactCompact: "План/Факт",
    doneLowercase: "выполнено",
    ordersPlural: "заказов",
    summaLabel: "Сумма",
    qtyLabel: "Кол-во",
    ordersLabel: "Заказы",
    clientsLabel: "Клиенты",
    averageLabel: "Среднее",
    returnedQtyLabel: "Возврат (кол-во)",
    returnedSummaLabel: "Возврат (сумма)",
    returnLabel: "Возврат",
    territoriesLabel: "Территории"
  },
  en: {
    appTagline: "One platform to run your entire distribution business",
    welcomeBack: "Welcome back",
    signInSubtitle: "Sign in to your Distr workspace",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    demoNote: "Demo mode — any credentials work.",
    search: "Search…",
    logout: "Logout",
    dashboard: "Dashboard",
    clients: "Clients",
    sales: "Sales",
    staff: "Staff",
    warehouse: "Warehouse",
    finance: "Finance",
    production: "Production",
    liveMap: "Live Map",
    reports: "Reports",
    calendar: "Calendar",
    notifications: "Notifications",
    settings: "Settings",
    profile: "Profile",
    overview: "Overview of your business.",
    totalSales: "Total Sales",
    activeClients: "Active Clients",
    revenue: "Revenue",
    orders: "Orders",
    salesPerformance: "Sales performance",
    ordersByMonth: "Orders by month",
    recentActivity: "Recent activity",
    topClients: "Top clients",
    topStaff: "Top staff",
    salesByCategory: "By category",
    dan: "From",
    gacha: "To",
    savdoTab: "Sales",
    done: "Done",
    average: "Average",
    returnedQty: "Returned qty",
    returnedSumma: "Returned amount",
    agentStats: "Agent statistics",
    agentVisitDetails: "Agent visits",
    categorySalesDetail: "Category details",
    kpiSection: "KPI Section",
    kpiComingSoon: "This section is currently under development. KPI indicators will appear here soon.",
    noVisit: "No visit",
    noAgents: "No agents found",
    noGroups: "No groups found",
    noProducts: "No products found",
    territories: "Territories",
    shareOfSumma: "Amount share",
    shareOfQty: "Qty share",
    piece: "pcs",
    totalSummary: "General summary",
    generalReport: "General Report",
    plan: "Plan",
    fact: "Fact",
    summaryReport: "Summary Report",
    agentsVisits: "Agent Visits",
    efficiency: "Efficiency",
    underConstruction: "Under Construction",
    openClientBase: "Open Client Base",
    activeClientBase: "Active Client Base",
    photos: "Photos",
    rejected: "Rejected",
    add: "Add",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    create: "Create",
    filter: "Filter",
    name: "Name",
    phone: "Phone",
    location: "Location",
    status: "Status",
    joined: "Joined",
    all: "All",
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    delivered: "Delivered",
    cancelled: "Cancelled",
    inProgress: "In progress",
    completed: "Completed",
    delayed: "Delayed",
    shipped: "Shipped",
    ordersDesc: "Track and manage all orders.",
    ordersPage: "Orders",
    orderNumber: "Order number",
    orderDate: "Order date",
    orderStatus: "Status",
    orderAgent: "Agent",
    orderItems: "Items count",
    orderTotal: "Total amount",
    orderWarehouse: "Warehouse",
    noOrders: "No orders found",
    clientsDesc: "Manage your customers and accounts.",
    addClient: "Add client",
    editClient: "Edit client",
    salesDesc: "Track orders and monthly performance.",
    monthlySales: "Monthly sales",
    orderId: "Order ID",
    client: "Client",
    date: "Date",
    amount: "Amount",
    staffDesc: "Team members, roles and performance.",
    registered: "Registered",
    block: "Block",
    unblock: "Unblock",
    role: "Role",
    performance: "Performance",
    warehouseDesc: "Warehouse products and inventory.",
    sku: "SKU",
    product: "Product",
    category: "Category",
    stock: "Stock",
    threshold: "Threshold",
    lowStock: "Low stock",
    inStock: "In stock",
    financeDesc: "Income, expenses and monthly summary.",
    income: "Income",
    expense: "Expense",
    netProfit: "Net profit",
    monthlySummary: "Monthly summary",
    transactions: "Transactions",
    type: "Type",
    party: "Party",
    productionDesc: "Active production batches.",
    batch: "Batch",
    quantity: "Quantity",
    start: "Start",
    due: "Due",
    liveMapDesc: "Real-time tracking of field agents.",
    activeAgents: "Active agents",
    reportsDesc: "Analytics reports and KPIs.",
    calendarDesc: "Scheduled events and tasks.",
    notificationsDesc: "System notifications and alerts.",
    settingsDesc: "Workspace settings.",
    profileDesc: "Your profile information.",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    notFound: "No results found.",
    today: "Today",
    growth: "growth",
    new: "new",
    markRead: "Mark as read",
    upcoming: "Upcoming events",
    noEvents: "No events for this day.",
    calendarDailyNotes: "Daily notes",
    calendarActiveDays: "active days",
    calendarNotesCount: "notes",
    calendarTitle: "Title",
    calendarWriteNote: "Write your note...",
    calendarClearDay: "Clear day",
    calendarNoNotesForDay: "No notes for this day yet.",
    calendarDeleteNote: "Delete note",
    calendarNotesInMonth: "notes in this month",
    calendarUntitledNote: "Untitled note",
    online: "Online",
    offline: "Offline",
    supervisor: "Supervisor",
    deliverer: "Deliverer",
    allRoles: "All",
    agents: "Agents",
    supervisors: "Supervisors",
    deliverers: "Deliverers",
    speed: "Speed",
    workStartTime: "Work start time",
    distanceTraveled: "Distance traveled",
    kmh: "km/h",
    km: "km",
    agentInfo: "Agent info",
    notAvailable: "Not available",
    clientsOnMap: "Clients on map",
    showClients: "Show clients",
    hideClients: "Hide clients",
    lastSale: "Last sale",
    debt: "Debt",
    agent: "Agent",
    filial: "Branch",
    devices: "Devices",
    devicesDesc: "Device management and tracking",
    noClients: "No clients found",
    errorTitle: "Connection error",
    errorClientsLoad: "Failed to load clients list. Please try again later.",
    comingSoon: "Coming soon",
    dateBegin: "Start date",
    dateEnd: "End date",
    branchId: "Branch ID",
    searchCategoryOrProduct: "Search category or product",
    totalSalesAmount: "Total sales (amount)",
    totalVolumeKg: "Total volume (kg)",
    ordersClients: "Orders / clients",
    planCompletion: "Plan completion",
    amountByCategoryChart: "Amount by category (chart)",
    categoryShare: "Category share",
    salesByCategories: "Sales by categories",
    qty: "Qty",
    qtyPercent: "Qty %",
    amountPercent: "Amount %",
    topProducts: "Top products",
    agentMetrics: "Metrics by agents",
    result: "Result",
    planFact: "Plan / Fact",
    orderClient: "Order / Client",
    totalAmount: "Total amount",
    ordersLower: "orders",
    sortDateNewOld: "Date: new-old",
    sortDateOldNew: "Date: old-new",
    sortAmountHighLow: "Amount: high-low",
    sortAmountLowHigh: "Amount: low-high",
    sortQtyHighLow: "Qty: high-low",
    sortQtyLowHigh: "Qty: low-high",
    sortClientAZ: "Client: A-Z",
    sortClientZA: "Client: Z-A",
    cardsView: "Cards",
    tableView: "Table",
    totalProductsCount: "Total products count",
    totalVolumeQty: "Total volume (qty)",
    dailyIncomeExpenseTrend: "Daily income / expense trend",
    statusShare: "Status share",
    id: "ID",
    products: "Products",
    navMain: "Main",
    navOperations: "Operations",
    navInsights: "Insights",
    navAccount: "Account",
    markirovka: "Marking",
    markirovkaDesc: "Product marking",
    markingBatch: "Batch",
    markingGtin: "GTIN",
    markingStatus: "Status",
    markingQuantity: "Quantity",
    markingDate: "Date",
    markingPending: "Pending",
    markingApproved: "Approved",
    markingError: "Error",
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
    user: "User",
    notificationTitle1: "New order #ORD-3411",
    notificationDesc1: "Mega Retail LLC placed an order — $14,200",
    notificationTime1: "5m",
    notificationTitle2: "Low stock alert",
    notificationDesc2: "Coffee 250g below threshold (38 left)",
    notificationTime2: "1h",
    notificationTitle3: "Batch completed",
    notificationDesc3: "PRD-558 — Detergent 3kg (2,400 units)",
    notificationTime3: "3h",
    notificationTitle4: "New client added",
    notificationDesc4: "Tashkent Foods joined your client list",
    notificationTime4: "5h",
    notificationTitle5: "Reminder",
    notificationDesc5: "Monthly report deadline tomorrow",
    notificationTime5: "1d",
    notificationTitle6: "Order delivered",
    notificationDesc6: "#ORD-3407 — Khiva Wholesale",
    notificationTime6: "2d",
    sortAZ: "A-Z",
    sortZA: "Z-A",
    sortTypeAsc: "Role: A-Z",
    sortTypeDesc: "Role: Z-A",
    sortDebtHighLow: "Debt: high-low",
    sortDebtLowHigh: "Debt: low-high",
    sortLastSaleNewOld: "Last sale: new-old",
    sortLastSaleOldNew: "Last sale: old-new",
    sortNameAZ: "Name: A-Z",
    sortNameZA: "Name: Z-A",
    sortStockHighLow: "Stock: high-low",
    sortStockLowHigh: "Stock: low-high",
    sortPriceHighLow: "Price: high-low",
    sortPriceLowHigh: "Price: low-high",
    contact: "Contact",
    username: "Username",
    company: "Company",
    manager: "Manager",
    oneCData: "1C data",
    oneCId: "1C ID",
    oneCLogin: "1C login",
    topAgents: "Top agents",
    topGroups: "Top groups",
    totalQty: "Total quantity",
    photo: "Photo",
    returned: "Returned",
    clientOpenProfile: "Client · Open profile",
    visit: "Visit",
    comment: "Comment",
    back: "Back",
    clientProfile: "Client profile",
    loading: "Loading...",
    photoReports: "Photo reports",
    rejectedPhotos: "Rejected photos",
    payments: "Payments",
    locationLandmark: "Address landmark",
    activities: "Activities",
    noData: "No data",
    photoReport: "Photo report",
    viewFull: "View full",
    reasonNotSpecified: "Reason not specified",
    noComment: "No comment",
    payment: "Payment",
    cash: "Cash",
    card: "Card",
    adminDashboard: "Dashboard",
    adminDashboardSubtitle: "Platform statistics and analytics",
    adminUsers: "Users",
    adminUsersSubtitle: "List of system users (mock)",
    adminCompanies: "Companies",
    adminCompaniesSubtitle: "List of companies on the platform (mock)",
    adminMobileApps: "Mobile Apps",
    adminMobileAppsSubtitle: "Apps managed from admin panel (mock)",
    adminDevices: "Devices",
    adminDevicesSubtitle: "Device approval and management",
    adminDevicesAll: "All",
    adminDevicesPending: "Pending",
    adminDevicesApproved: "Approved",
    adminDevicesRejected: "Rejected",
    adminDevicesNotFound: "No devices found",
    deviceApproved: "Device approved",
    deviceRejected: "Device rejected",
    adminNotifications: "Notifications",
    adminNotificationsSubtitle: "Latest system notifications (mock)",
    adminSettings: "Settings",
    adminSettingsSubtitle: "General admin panel settings",
    adminWorkingSessions: "Working Sessions",
    adminWorkingSessionsSubtitle: "User working sessions overview",
    adminWorkingSessionsSearch: "Search (user, device, app)...",
    allUsers: "All users",
    allApps: "All apps",
    sessions: "sessions",
    sessionTime: "Session time",
    device: "Device",
    application: "Application",
    testing: "Testing",
    sessionDetails: "Session details",
    sessionDetailsDesc: "Detailed information about the working session",
    noSessionsFound: "No sessions found",
    yes: "Yes",
    no: "No",
    total: "Total",
    adminSearchPlaceholder: "Search in admin panel...",
    adminOwner: "Owner",
    adminPlan: "Plan",
    adminPlatform: "Platform",
    adminVersion: "Version",
    adminViewType: "View type",
    adminViewTypeSubtitle: "Choose table or card layout",
    adminParameter: "Parameter",
    adminValue: "Value",
    adminLoginTitle: "Admin Login",
    adminLoginSubtitle: "Sign in to access admin panel",
    adminLoginRequired: "Enter login or password.",
    goToMainSite: "Go to main site",
    adminPanel: "Admin Panel",
    // Admin settings new keys
    export: "Export",
    import: "Import",
    saveAll: "Save All",
    general: "General",
    securityKeys: "Security",
    database: "Database",
    integrations: "Integrations",
    localization: "Localization",
    localizationDesc: "Language, timezone and date format settings",
    platformName: "Platform Name",
    defaultLanguage: "Default Language",
    timezone: "Timezone",
    dateFormat: "Date Format",
    pushNotifications: "Push Notifications",
    pushNotificationsDesc: "Enable browser push notifications",
    emailNotifications: "Email Notifications",
    emailNotificationsDesc: "Enable email notifications",
    security: "Security",
    securityDesc: "Admin panel security settings",
    sessionTimeout: "Session Timeout",
    maxLoginAttempts: "Max Login Attempts",
    apiKeys: "API Keys",
    apiKeysDesc: "Manage API keys for external integrations",
    addKey: "Add Key",
    addNewKey: "Add New API Key",
    addNewKeyDesc: "Enter a name to create a new API key",
    keyName: "Key Name",
    apiKey: "API Key",
    created: "Created",
    lastUsed: "Last Used",
    actions: "Actions",
    regenerate: "Regenerate",
    alembicVersions: "Alembic Versions",
    alembicVersionsDesc: "Database migration history",
    currentVersion: "Current Version",
    headRevision: "HEAD Revision",
    version: "Version",
    description: "Description",
    timestamp: "Timestamp",
    applied: "Applied",
    databaseInfo: "Database Info",
    databaseInfoDesc: "Database status and statistics",
    dbSize: "DB Size",
    tables: "Tables",
    connections: "Connections",
    uptime: "Uptime",
    webhooks: "Webhooks",
    webhooksDesc: "Webhook settings for external events",
    addWebhook: "Add Webhook",
    addNewWebhook: "Add New Webhook",
    addNewWebhookDesc: "Enter the webhook URL address",
    webhookUrl: "Webhook URL",
    url: "URL",
    events: "Events",
    copyUrl: "Copy URL",
    emailTemplates: "Email Templates",
    emailTemplatesDesc: "Automated email message templates",
    templateName: "Template Name",
    subject: "Subject",
    paymentMethods: "Payment Methods",
    paymentMethodsDesc: "Online payment system integrations",
    connected: "Connected",
    // System Monitor
    systemMonitor: "System Monitor",
    systemMonitorError: "Failed to load system data",
    refresh: "Refresh",
    smSystemInfo: "System Info",
    smHostname: "Hostname",
    smArch: "Architecture",
    smUptime: "Uptime",
    smCpu: "CPU",
    smFrequency: "Frequency",
    smMemory: "Memory",
    smAvailable: "Available",
    smDisk: "Disk",
    smFree: "Free",
    smNetwork: "Network",
    smSent: "Sent",
    smReceived: "Received",
    smPacketsSent: "Packets sent",
    smPacketsRecv: "Packets received",
    smTopProcesses: "Top Processes",
    smProcessName: "Name",
    smMemUsage: "Memory %",
    // dashboard new keys
    akbTab: "AKB",
    kpiTab: "KPI",
    noCategories: "No categories found",
    agentVisitsBy: "Visits by agents",
    okb: "OKB",
    akbNoun: "AKB",
    unknown: "Unknown",
    noDataFound: "No data found",
    noClientsInGroup: "No clients found",
    planFactCompact: "Plan/Fact",
    doneLowercase: "done",
    ordersPlural: "orders",
    summaLabel: "Amount",
    qtyLabel: "Qty",
    ordersLabel: "Orders",
    clientsLabel: "Clients",
    averageLabel: "Average",
    returnedQtyLabel: "Returned qty",
    returnedSummaLabel: "Returned amount",
    returnLabel: "Returned",
    territoriesLabel: "Territories"
  }
};
const C = createContext(null);
function AppSettingsProvider({ children }) {
  const [lang, setLangState] = useState("uz");
  const [theme, setThemeState] = useState("light");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const l = localStorage.getItem("distr.lang") || "uz";
    const th = localStorage.getItem("distr.theme") || "light";
    setLangState(l);
    setThemeState(th);
  }, []);
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  const setLang = (l) => {
    localStorage.setItem("distr.lang", l);
    setLangState(l);
  };
  const setTheme = (t2) => {
    localStorage.setItem("distr.theme", t2);
    setThemeState(t2);
  };
  const t = (k) => dict[lang][k] ?? dict.en[k] ?? k;
  return /* @__PURE__ */ jsx(C.Provider, { value: { lang, setLang, t, theme, setTheme }, children });
}
function useSettings() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useSettings must be used within AppSettingsProvider");
  return ctx;
}
const LANGS = [
  { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" }
];
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function getProxiedImageUrl(rawUrl) {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl);
    const path = `${parsed.pathname}${parsed.search}`;
    return `/proxy-1c?target=${encodeURIComponent(parsed.origin)}&path=${encodeURIComponent(path)}`;
  } catch {
    return rawUrl;
  }
}
function formatWithSpaces(value, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
    useGrouping: true
  }).format(value).replaceAll(" ", " ").replaceAll(",", " ");
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const appCss = "/assets/styles-zWQvTeE1.css";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1e3 * 60, retry: 1 }
  }
});
const Route$t = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Distr — Biznes Boshqaruv Tizimi" },
      { name: "description", content: "Distr — yagona biznes boshqaruv platformasi." }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/logo.png" }
    ]
  }),
  shellComponent: RootShell,
  component: () => /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(AppSettingsProvider, { children: /* @__PURE__ */ jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, {})
  ] }) }) }),
  notFoundComponent: NotFoundPage
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function FloatingOrb({ delay, duration, size, x, y }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "absolute rounded-full opacity-20 dark:opacity-10 blur-3xl",
      style: {
        width: size,
        height: size,
        left: x,
        top: y,
        background: "var(--color-primary)",
        animation: `float-orb ${duration}s ease-in-out ${delay}s infinite`
      }
    }
  );
}
function ParticleField() {
  const [particles] = useState(
    () => Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 3
    }))
  );
  return /* @__PURE__ */ jsx("div", { className: "absolute inset-0 overflow-hidden pointer-events-none", children: particles.map((p) => /* @__PURE__ */ jsx(
    "div",
    {
      className: "absolute rounded-full bg-primary/30",
      style: {
        width: p.size,
        height: p.size,
        left: `${p.x}%`,
        top: `${p.y}%`,
        animation: `particle-drift ${p.duration}s ease-in-out ${p.delay}s infinite`
      }
    },
    p.id
  )) });
}
function NotFoundPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "not-found-page min-h-screen flex items-center justify-center relative overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsx(FloatingOrb, { delay: 0, duration: 8, size: 400, x: "10%", y: "20%" }),
    /* @__PURE__ */ jsx(FloatingOrb, { delay: 2, duration: 10, size: 300, x: "60%", y: "10%" }),
    /* @__PURE__ */ jsx(FloatingOrb, { delay: 4, duration: 12, size: 350, x: "70%", y: "60%" }),
    /* @__PURE__ */ jsx(FloatingOrb, { delay: 1, duration: 9, size: 250, x: "20%", y: "70%" }),
    /* @__PURE__ */ jsx(FloatingOrb, { delay: 3, duration: 11, size: 200, x: "40%", y: "40%" }),
    /* @__PURE__ */ jsx(ParticleField, {}),
    /* @__PURE__ */ jsx("div", { className: "grid absolute inset-0 opacity-[0.03]", style: {
      backgroundImage: "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
      backgroundSize: "60px 60px"
    } }),
    /* @__PURE__ */ jsxs("div", { className: `relative z-10 text-center px-6 transition-all duration-1000 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "relative inline-block mb-8", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "text-[8rem] sm:text-[12rem] md:text-[16rem] font-black leading-none select-none",
            style: {
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 50%, var(--color-primary) 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradient-shift 4s ease-in-out infinite"
            },
            children: "404"
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 blur-3xl opacity-20", style: {
          background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
          animation: "gradient-shift 4s ease-in-out infinite",
          backgroundSize: "200% 200%"
        } })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `transition-all duration-700 delay-300 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`, children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsx(Compass, { className: "h-5 w-5 text-muted-foreground", style: { animation: "spin-slow 3s linear infinite" } }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium uppercase tracking-widest text-muted-foreground", children: "Sahifa topilmadi" })
        ] }),
        /* @__PURE__ */ jsx("h2", { className: "text-2xl sm:text-3xl font-bold mb-3", children: "Yo'l adashib qoldingizmi?" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground max-w-md mx-auto mb-10 text-base leading-relaxed", children: "Qidirgan sahifangiz mavjud emas yoki ko'chirilgan bo'lishi mumkin. Bosh sahifaga qaytib, kerakli bo'limni qayta topishingiz mumkin." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: `flex flex-col sm:flex-row items-center justify-center gap-3 transition-all duration-700 delay-500 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`, children: [
        /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", className: "gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow", children: /* @__PURE__ */ jsxs(Link, { to: "/dashboard", children: [
          /* @__PURE__ */ jsx(Home, { className: "h-4 w-4" }),
          "Bosh sahifa"
        ] }) }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "lg", className: "gap-2", onClick: () => window.history.back(), children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Orqaga"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `mt-16 transition-all duration-700 delay-700 ease-out ${mounted ? "opacity-100" : "opacity-0"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1.5", children: [
        /* @__PURE__ */ jsx("img", { src: "/logo.png", alt: "Distr", className: "h-5 w-5 rounded object-contain opacity-50" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground/50 font-medium", children: "Distr Business Hub" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(30px, -40px) scale(1.05); }
          50% { transform: translate(-20px, 20px) scale(0.95); }
          75% { transform: translate(15px, 35px) scale(1.02); }
        }
        @keyframes particle-drift {
          0%, 100% { opacity: 0; transform: translate(0, 0); }
          25% { opacity: 1; }
          50% { opacity: 0.5; transform: translate(20px, -30px); }
          75% { opacity: 0.8; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` })
  ] });
}
const $$splitComponentImporter$r = () => import("./login-aBhHgMTo.js");
const Route$s = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$r, "component")
});
const $$splitComponentImporter$q = () => import("./_app-WE-B2mhK.js");
const Route$r = createFileRoute("/_app")({
  component: lazyRouteComponent($$splitComponentImporter$q, "component")
});
const $$splitComponentImporter$p = () => import("./index-DMkpXnsV.js");
const Route$q = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$p, "component")
});
const $$splitComponentImporter$o = () => import("./index-qUU1J58w.js");
const Route$p = createFileRoute("/admin/")({
  component: lazyRouteComponent($$splitComponentImporter$o, "component")
});
const $$splitComponentImporter$n = () => import("./working-sessions-BlhKkuyZ.js");
const Route$o = createFileRoute("/admin/working-sessions")({
  component: lazyRouteComponent($$splitComponentImporter$n, "component")
});
const $$splitComponentImporter$m = () => import("./users-DYAzLR8I.js");
const Route$n = createFileRoute("/admin/users")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const $$splitComponentImporter$l = () => import("./settings-BwnYvsYy.js");
const Route$m = createFileRoute("/admin/settings")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./notifications-CKciGBTH.js");
const Route$l = createFileRoute("/admin/notifications")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./mobile-apps-GLxyMH55.js");
const Route$k = createFileRoute("/admin/mobile-apps")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./login-BxvTG63D.js");
const Route$j = createFileRoute("/admin/login")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./devices-Cg9muvea.js");
const Route$i = createFileRoute("/admin/devices")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./dashboard-DH1lcgLd.js");
const Route$h = createFileRoute("/admin/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./companies-CqbJpkQy.js");
const Route$g = createFileRoute("/admin/companies")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./warehouse-CXbBEbDb.js");
const Route$f = createFileRoute("/_app/warehouse")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./staff-D4sMoltL.js");
const Route$e = createFileRoute("/_app/staff")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./settings-9_oZMdXe.js");
const Route$d = createFileRoute("/_app/settings")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./sales-kY7txBbV.js");
const Route$c = createFileRoute("/_app/sales")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./reports-DtvOmksT.js");
const Route$b = createFileRoute("/_app/reports")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./profile-CarQYqEP.js");
const Route$a = createFileRoute("/_app/profile")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./production-BUe2du7O.js");
const Route$9 = createFileRoute("/_app/production")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
function PageHeader({ title, description, actions }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: title }),
      description && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: description })
    ] }),
    actions && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: actions })
  ] });
}
const Card = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
      ...props
    }
  )
);
Card.displayName = "Card";
const CardHeader = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("flex flex-col space-y-1.5 p-6", className), ...props })
);
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "div",
    {
      ref,
      className: cn("font-semibold leading-none tracking-tight", className),
      ...props
    }
  )
);
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("text-sm text-muted-foreground", className), ...props })
);
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("p-6 pt-0", className), ...props })
);
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props })
);
CardFooter.displayName = "CardFooter";
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("animate-pulse rounded-md bg-primary/10", className), ...props });
}
const Table = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx("div", { className: "relative w-full overflow-auto", children: /* @__PURE__ */ jsx("table", { ref, className: cn("w-full caption-bottom text-sm", className), ...props }) })
);
Table.displayName = "Table";
const TableHeader = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("thead", { ref, className: cn("[&_tr]:border-b", className), ...props }));
TableHeader.displayName = "TableHeader";
const TableBody = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("tbody", { ref, className: cn("[&_tr:last-child]:border-0", className), ...props }));
TableBody.displayName = "TableBody";
const TableFooter = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "tfoot",
  {
    ref,
    className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
    ...props
  }
));
TableFooter.displayName = "TableFooter";
const TableRow = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsx(
    "tr",
    {
      ref,
      className: cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        className
      ),
      ...props
    }
  )
);
TableRow.displayName = "TableRow";
const TableHead = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "th",
  {
    ref,
    className: cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableHead.displayName = "TableHead";
const TableCell = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  "td",
  {
    ref,
    className: cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    ),
    ...props
  }
));
TableCell.displayName = "TableCell";
const TableCaption = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx("caption", { ref, className: cn("mt-4 text-sm text-muted-foreground", className), ...props }));
TableCaption.displayName = "TableCaption";
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(void 0);
  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const Route$8 = createFileRoute("/_app/orders")({
  component: OrdersPage
});
function normalizeStatus(raw) {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("ship")) return "shipped";
  if (s.includes("deliver") || s.includes("yetkazil") || s.includes("completed") || s.includes("success"))
    return "delivered";
  if (s.includes("cancel") || s.includes("cencel") || s.includes("bekor") || s.includes("reject")) return "cancelled";
  if (s.includes("new") || s.includes("yangi")) return "new";
  if (s.includes("progress") || s.includes("process") || s.includes("jarayon")) return "inProgress";
  return "unknown";
}
const STATUS_CONFIG = {
  new: {
    color: "bg-primary/10 text-primary dark:text-primary",
    icon: AlertCircle,
    labelKey: "new"
  },
  pending: {
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    icon: Clock,
    labelKey: "pending"
  },
  inProgress: {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Truck,
    labelKey: "inProgress"
  },
  shipped: {
    color: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400",
    icon: Truck,
    labelKey: "shipped"
  },
  delivered: {
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    icon: CheckCircle2,
    labelKey: "delivered"
  },
  cancelled: {
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    icon: XCircle,
    labelKey: "cancelled"
  },
  unknown: {
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
    icon: AlertCircle,
    labelKey: "unknown"
  }
};
function toApiDate(iso) {
  return iso.replaceAll("-", "");
}
function todayIso() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
function monthStartIso() {
  const now = /* @__PURE__ */ new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}
function dateScore(docDate) {
  const [d, mo, y] = docDate.split(".");
  return Date.parse(`${y}-${mo}-${d}T00:00:00Z`) || 0;
}
const fmt = (n) => formatWithSpaces(n, 0);
function formatDisplayDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function OrdersPage() {
  const { t } = useSettings();
  const { user } = useAuth();
  const dateBeginRef = useRef(null);
  const dateEndRef = useRef(null);
  const [dateBegin, setDateBegin] = useState(monthStartIso());
  const [dateEnd, setDateEnd] = useState(todayIso());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [expandedId, setExpandedId] = useState(null);
  const [viewMode, setViewMode] = useState("table");
  const isMobile = useIsMobile();
  useEffect(() => {
    setViewMode(isMobile ? "cards" : "table");
  }, [isMobile]);
  const [agentFilter, setAgentFilter] = useState("all");
  const [skladFilter, setSkladFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortMode, setSortMode] = useState("none");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [minSumma, setMinSumma] = useState("");
  const [maxSumma, setMaxSumma] = useState("");
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchOrders = () => {
    if (!user?.company_rel?.base_url || !user?.user_1c_login || !user?.user_1c_password) {
      setLoading(false);
      setError(t("notAvailable"));
      return;
    }
    const baseUrl = user.company_rel.base_url;
    const basic = btoa(`${user.user_1c_login}:${user.user_1c_password}`);
    setLoading(true);
    setError(null);
    fetch(API.ordersAll(baseUrl, toApiDate(dateBegin), toApiDate(dateEnd)), {
      headers: {
        accept: "application/json",
        Authorization: `Basic ${basic}`
      }
    }).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }).then((data) => {
      setOrders(Array.isArray(data?.data) ? data.data : []);
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };
  useEffect(() => {
    fetchOrders();
  }, [dateBegin, dateEnd, user]);
  const stats = useMemo(() => {
    const total = orders.length;
    const totalAmount = orders.reduce((s, o) => s + (Number(o.summa) || 0), 0);
    const totalQty = orders.reduce((s, o) => s + (Number(o.qty) || 0), 0);
    const delivered = orders.filter((o) => normalizeStatus(o.status) === "delivered").length;
    const pending = orders.filter(
      (o) => normalizeStatus(o.status) === "pending" || normalizeStatus(o.status) === "inProgress"
    ).length;
    const uniqueClients = new Set(orders.map((o) => o.client_id)).size;
    return { total, totalAmount, totalQty, delivered, pending, uniqueClients };
  }, [orders]);
  const uniqueAgents = useMemo(
    () => Array.from(
      new Set(orders.map((o) => o.agent?.agent_name).filter(Boolean))
    ).sort(),
    [orders]
  );
  const uniqueSklads = useMemo(
    () => Array.from(new Set(orders.map((o) => o.sklad).filter(Boolean))).sort(),
    [orders]
  );
  const uniquePayments = useMemo(
    () => Array.from(new Set(orders.map((o) => o.type_payment).filter(Boolean))).sort(),
    [orders]
  );
  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== "all") {
      list = list.filter((o) => normalizeStatus(o.status) === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (o) => String(o.id_doc).includes(q) || (o.client_name ?? "").toLowerCase().includes(q) || (o.agent?.agent_name ?? "").toLowerCase().includes(q) || (o.local_id ?? "").toLowerCase().includes(q) || (o.sklad ?? "").toLowerCase().includes(q) || (o.products ?? []).some((p) => (p.product_name ?? "").toLowerCase().includes(q))
      );
    }
    if (agentFilter !== "all") {
      list = list.filter((o) => o.agent?.agent_name === agentFilter);
    }
    if (skladFilter !== "all") {
      list = list.filter((o) => o.sklad === skladFilter);
    }
    if (paymentFilter !== "all") {
      list = list.filter((o) => o.type_payment === paymentFilter);
    }
    if (minSumma !== "") {
      list = list.filter((o) => (o.summa ?? 0) >= Number(minSumma));
    }
    if (maxSumma !== "") {
      list = list.filter((o) => (o.summa ?? 0) <= Number(maxSumma));
    }
    if (minQty !== "") {
      list = list.filter((o) => (o.qty ?? 0) >= Number(minQty));
    }
    if (maxQty !== "") {
      list = list.filter((o) => (o.qty ?? 0) <= Number(maxQty));
    }
    if (sortMode !== "none") {
      list.sort((a, b) => {
        switch (sortMode) {
          case "date-desc":
            return dateScore(b.date_doc) - dateScore(a.date_doc);
          case "date-asc":
            return dateScore(a.date_doc) - dateScore(b.date_doc);
          case "amount-desc":
            return (b.summa ?? 0) - (a.summa ?? 0);
          case "amount-asc":
            return (a.summa ?? 0) - (b.summa ?? 0);
          case "id-desc":
            return (b.id_doc ?? 0) - (a.id_doc ?? 0);
          case "id-asc":
            return (a.id_doc ?? 0) - (b.id_doc ?? 0);
          case "client-asc":
            return (a.client_name ?? "").localeCompare(b.client_name ?? "");
          case "client-desc":
            return (b.client_name ?? "").localeCompare(a.client_name ?? "");
          default:
            return 0;
        }
      });
    }
    return list;
  }, [
    orders,
    search,
    statusFilter,
    agentFilter,
    skladFilter,
    paymentFilter,
    minSumma,
    maxSumma,
    minQty,
    maxQty,
    sortMode,
    sortKey,
    sortDir
  ]);
  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };
  const SortIcon = ({ k }) => {
    if (sortKey !== k) return /* @__PURE__ */ jsx(ArrowUpDown, { className: "ml-1 h-3 w-3 opacity-40" });
    return sortDir === "asc" ? /* @__PURE__ */ jsx(ChevronUp, { className: "ml-1 h-3 w-3" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "ml-1 h-3 w-3" });
  };
  const activeFiltersCount = [
    statusFilter !== "all",
    agentFilter !== "all",
    skladFilter !== "all",
    paymentFilter !== "all",
    minSumma !== "",
    maxSumma !== "",
    minQty !== "",
    maxQty !== ""
  ].filter(Boolean).length;
  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setAgentFilter("all");
    setSkladFilter("all");
    setPaymentFilter("all");
    setMinSumma("");
    setMaxSumma("");
    setMinQty("");
    setMaxQty("");
    setSortMode("none");
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageHeader,
      {
        title: t("ordersPage"),
        description: t("ordersDesc"),
        actions: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          !loading && !error && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs", children: [
            orders.length,
            " ",
            t("ordersLower")
          ] }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: fetchOrders,
              disabled: loading,
              className: "gap-1.5",
              children: [
                /* @__PURE__ */ jsx(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }),
                t("refresh")
              ]
            }
          )
        ] })
      }
    ),
    /* @__PURE__ */ jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-4 pb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: dateBeginRef,
          type: "date",
          value: dateBegin,
          onChange: (e) => setDateBegin(e.target.value),
          className: "sr-only"
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          ref: dateEndRef,
          type: "date",
          value: dateEnd,
          onChange: (e) => setDateEnd(e.target.value),
          className: "sr-only"
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => dateBeginRef.current?.showPicker(),
          className: "flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl cursor-pointer flex-1 max-w-[200px] border border-transparent hover:border-primary/20 transition-colors",
          children: [
            /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-primary shrink-0" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start min-w-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground leading-none", children: t("dateBegin") }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium leading-tight", children: formatDisplayDate(dateBegin) })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 text-muted-foreground shrink-0" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => dateEndRef.current?.showPicker(),
          className: "flex items-center gap-2 px-4 py-2.5 bg-muted rounded-xl cursor-pointer flex-1 max-w-[200px] border border-transparent hover:border-primary/20 transition-colors",
          children: [
            /* @__PURE__ */ jsx(Calendar, { className: "w-4 h-4 text-primary shrink-0" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-start min-w-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground leading-none", children: t("dateEnd") }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium leading-tight", children: formatDisplayDate(dateEnd) })
            ] })
          ]
        }
      )
    ] }) }) }),
    loading ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-6", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24 mb-2" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-8 w-16" })
    ] }) }, i)) }) : !error ? /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6", children: [
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("orders") }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: stats.total })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(ClipboardList, { className: "h-5 w-5 text-primary" }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("orderTotal") }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: fmt(stats.totalAmount) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(TrendingUp, { className: "h-5 w-5 text-emerald-600 dark:text-emerald-400" }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("delivered") }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: stats.delivered })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) })
      ] }) }) }),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: t("activeClients") }),
          /* @__PURE__ */ jsx("p", { className: "text-2xl font-bold mt-1", children: stats.uniqueClients })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center", children: /* @__PURE__ */ jsx(Users, { className: "h-5 w-5 text-blue-600 dark:text-blue-400" }) })
      ] }) }) })
    ] }) : null,
    error && /* @__PURE__ */ jsx(Card, { className: "mb-6 border-destructive/40 bg-destructive/5", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-destructive", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 shrink-0" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-medium", children: t("errorTitle") }),
        /* @__PURE__ */ jsx("p", { className: "text-sm opacity-80 mt-0.5", children: error })
      ] })
    ] }) }) }),
    !error && /* @__PURE__ */ jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsxs(CardContent, { className: "pt-4 pb-4 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-3 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative flex-1 min-w-[200px]", children: [
          /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: `${t("search")}...`,
              className: "pl-9",
              value: search,
              onChange: (e) => setSearch(e.target.value)
            }
          )
        ] }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: sortMode,
            onChange: (e) => setSortMode(e.target.value),
            className: "h-9 rounded-md border border-input bg-background px-3 text-sm shrink-0",
            children: [
              /* @__PURE__ */ jsxs("option", { value: "none", children: [
                t("all"),
                " (default)"
              ] }),
              /* @__PURE__ */ jsx("option", { value: "date-desc", children: t("sortDateNewOld") }),
              /* @__PURE__ */ jsx("option", { value: "date-asc", children: t("sortDateOldNew") }),
              /* @__PURE__ */ jsx("option", { value: "amount-desc", children: t("sortAmountHighLow") }),
              /* @__PURE__ */ jsx("option", { value: "amount-asc", children: t("sortAmountLowHigh") }),
              /* @__PURE__ */ jsx("option", { value: "id-desc", children: "ID ↓" }),
              /* @__PURE__ */ jsx("option", { value: "id-asc", children: "ID ↑" }),
              /* @__PURE__ */ jsx("option", { value: "client-asc", children: t("sortClientAZ") }),
              /* @__PURE__ */ jsx("option", { value: "client-desc", children: t("sortClientZA") })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: filtersOpen || activeFiltersCount > 0 ? "default" : "outline",
            size: "sm",
            onClick: () => setFiltersOpen((v) => !v),
            className: "gap-1.5 shrink-0",
            children: [
              /* @__PURE__ */ jsx(SlidersHorizontal, { className: "h-4 w-4" }),
              t("filter"),
              activeFiltersCount > 0 && /* @__PURE__ */ jsx("span", { className: "ml-0.5 h-4 w-4 rounded-full bg-white/20 text-[10px] font-bold flex items-center justify-center", children: activeFiltersCount })
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              variant: viewMode === "cards" ? "default" : "outline",
              size: "sm",
              onClick: () => setViewMode("cards"),
              className: "gap-1.5",
              children: [
                /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4" }),
                t("cardsView")
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              variant: viewMode === "table" ? "default" : "outline",
              size: "sm",
              onClick: () => setViewMode("table"),
              className: "gap-1.5",
              children: [
                /* @__PURE__ */ jsx(Rows3, { className: "h-4 w-4" }),
                t("tableView")
              ]
            }
          )
        ] })
      ] }),
      filtersOpen && /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: t("orderStatus") }),
            /* @__PURE__ */ jsxs(
              Select,
              {
                value: statusFilter,
                onValueChange: (v) => setStatusFilter(v),
                children: [
                  /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "all", children: t("all") }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "new", children: t("new") }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "pending", children: t("pending") }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "inProgress", children: t("inProgress") }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "shipped", children: t("shipped") }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "delivered", children: t("delivered") }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "cancelled", children: t("cancelled") }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "unknown", children: t("unknown") })
                  ] })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: t("orderAgent") }),
            /* @__PURE__ */ jsxs(Select, { value: agentFilter, onValueChange: setAgentFilter, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "all", children: t("all") }),
                uniqueAgents.map((a) => /* @__PURE__ */ jsx(SelectItem, { value: a, children: a }, a))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: t("orderWarehouse") }),
            /* @__PURE__ */ jsxs(Select, { value: skladFilter, onValueChange: setSkladFilter, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "all", children: t("all") }),
                uniqueSklads.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s, children: s }, s))
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: t("payment") }),
            /* @__PURE__ */ jsxs(Select, { value: paymentFilter, onValueChange: setPaymentFilter, children: [
              /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "all", children: t("all") }),
                uniquePayments.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, children: p }, p))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
              t("orderTotal"),
              " — min"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  min: 0,
                  placeholder: "0",
                  value: minSumma,
                  onChange: (e) => setMinSumma(e.target.value),
                  className: "h-9 pr-12"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none", children: "so'm" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
              t("orderTotal"),
              " — max"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  min: 0,
                  placeholder: "∞",
                  value: maxSumma,
                  onChange: (e) => setMaxSumma(e.target.value),
                  className: "h-9 pr-12"
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none", children: "so'm" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
              t("qty"),
              " — min"
            ] }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "number",
                min: 0,
                step: "0.01",
                placeholder: "0",
                value: minQty,
                onChange: (e) => setMinQty(e.target.value),
                className: "h-9"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxs("label", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide", children: [
              t("qty"),
              " — max"
            ] }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "number",
                min: 0,
                step: "0.01",
                placeholder: "∞",
                value: maxQty,
                onChange: (e) => setMaxQty(e.target.value),
                className: "h-9"
              }
            )
          ] })
        ] }),
        (activeFiltersCount > 0 || search.trim()) && /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            onClick: clearFilters,
            className: "gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10",
            children: [
              /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" }),
              "Filtrlarni tozalash"
            ]
          }
        ) })
      ] })
    ] }) }),
    !loading && !error && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3 px-0.5", children: [
      /* @__PURE__ */ jsx(Package, { className: "h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
        filtered.length,
        " ",
        t("ordersLower")
      ] })
    ] }),
    loading && viewMode === "cards" && /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-20" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-20 rounded-full" })
      ] }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-40" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-28" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-1", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-3 w-20" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-28" })
      ] })
    ] }) }, i)) }),
    loading && viewMode === "table" && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "divide-y", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 px-6 py-4", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-20" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-36 flex-1" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24 hidden md:block" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-20 hidden lg:block" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-24" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-28" }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-20 rounded-full" })
    ] }, i)) }) }) }),
    !loading && filtered.length === 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "py-16", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center text-muted-foreground gap-3", children: [
      /* @__PURE__ */ jsx(ClipboardList, { className: "h-10 w-10 opacity-30" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: t("noOrders") })
    ] }) }) }),
    !loading && filtered.length > 0 && viewMode === "cards" && /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: filtered.map((order) => {
      const norm = normalizeStatus(order.status);
      const cfg = STATUS_CONFIG[norm];
      const StatusIcon = cfg.icon;
      const isExpanded = expandedId === order.id_doc;
      return /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-start gap-4 px-4 py-4 cursor-pointer hover:bg-muted/30 transition-colors",
            onClick: () => setExpandedId(isExpanded ? null : order.id_doc),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "shrink-0 text-center w-12", children: [
                /* @__PURE__ */ jsxs("div", { className: "font-mono text-xs font-bold text-primary", children: [
                  "#",
                  order.id_doc
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: order.date_doc })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm leading-snug", children: order.client_name }),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1", children: [
                  order.agent?.agent_name && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Users, { className: "h-3 w-3" }),
                    order.agent.agent_name
                  ] }),
                  order.sklad && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Package, { className: "h-3 w-3" }),
                    order.sklad
                  ] }),
                  order.type_payment && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Wallet, { className: "h-3 w-3" }),
                    order.type_payment
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "shrink-0 flex flex-col items-end gap-1.5", children: [
                /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.color}`,
                    children: [
                      /* @__PURE__ */ jsx(StatusIcon, { className: "h-3 w-3" }),
                      t(cfg.labelKey)
                    ]
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "font-bold text-sm tabular-nums", children: [
                  fmt(order.summa),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] font-normal text-muted-foreground ml-1", children: order.cry })
                ] }),
                /* @__PURE__ */ jsx(
                  ChevronDown,
                  {
                    className: `h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`
                  }
                )
              ] })
            ]
          }
        ),
        isExpanded && /* @__PURE__ */ jsxs("div", { className: "border-t bg-muted/20 px-4 py-4 space-y-3", children: [
          (order.tip_sena || order.date_delivery && order.date_delivery !== order.date_doc || order.comment) && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
            order.tip_sena && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] bg-background border rounded-full px-2.5 py-0.5 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3 text-blue-500" }),
              order.tip_sena
            ] }),
            order.date_delivery && order.date_delivery !== order.date_doc && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] bg-background border rounded-full px-2.5 py-0.5 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Truck, { className: "h-3 w-3 text-orange-500" }),
              "→ ",
              order.date_delivery
            ] }),
            order.comment && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full px-2.5 py-0.5 text-amber-700 dark:text-amber-400", children: [
              "💬 ",
              order.comment
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-lg border overflow-hidden", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[2rem_1fr_repeat(3,6rem)] text-[10px] font-medium text-muted-foreground uppercase tracking-wide bg-muted/60 px-3 py-1.5", children: [
              /* @__PURE__ */ jsx("span", { children: "#" }),
              /* @__PURE__ */ jsx("span", { children: t("product") }),
              /* @__PURE__ */ jsx("span", { className: "text-right", children: t("amount") }),
              /* @__PURE__ */ jsx("span", { className: "text-right", children: t("qty") }),
              /* @__PURE__ */ jsx("span", { className: "text-right", children: t("totalAmount") })
            ] }),
            (order.products ?? []).map((p) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "grid grid-cols-[2rem_1fr_repeat(3,6rem)] items-center px-3 py-2 border-t text-xs hover:bg-background/60 transition-colors",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground tabular-nums", children: p.product_id }),
                  /* @__PURE__ */ jsx("span", { className: "font-medium truncate pr-2", children: p.product_name }),
                  /* @__PURE__ */ jsx("span", { className: "text-right tabular-nums text-muted-foreground", children: fmt(p.price) }),
                  /* @__PURE__ */ jsx("span", { className: "text-right tabular-nums text-muted-foreground", children: formatWithSpaces(p.qty, 2) }),
                  /* @__PURE__ */ jsx("span", { className: "text-right tabular-nums font-semibold", children: fmt(p.sum) })
                ]
              },
              p.product_id
            ))
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-lg bg-primary/5 border border-primary/10 px-3 py-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: t("total") }),
            /* @__PURE__ */ jsxs("span", { className: "text-sm font-bold text-primary", children: [
              fmt(order.summa),
              " ",
              order.cry
            ] })
          ] })
        ] })
      ] }, order.id_doc);
    }) }),
    !loading && filtered.length > 0 && viewMode === "table" && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { className: "w-8" }),
        /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "-ml-3 h-8 font-medium",
            onClick: () => toggleSort("id"),
            children: [
              t("id"),
              /* @__PURE__ */ jsx(SortIcon, { k: "id" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "-ml-3 h-8 font-medium",
            onClick: () => toggleSort("client"),
            children: [
              t("client"),
              /* @__PURE__ */ jsx(SortIcon, { k: "client" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(TableHead, { className: "hidden md:table-cell", children: t("orderAgent") }),
        /* @__PURE__ */ jsx(TableHead, { className: "hidden lg:table-cell", children: t("orderWarehouse") }),
        /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "-ml-3 h-8 font-medium",
            onClick: () => toggleSort("date"),
            children: [
              t("orderDate"),
              /* @__PURE__ */ jsx(SortIcon, { k: "date" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(TableHead, { children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "-ml-3 h-8 font-medium",
            onClick: () => toggleSort("amount"),
            children: [
              t("orderTotal"),
              /* @__PURE__ */ jsx(SortIcon, { k: "amount" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(TableHead, { children: t("orderStatus") })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: filtered.map((order) => {
        const norm = normalizeStatus(order.status);
        const cfg = STATUS_CONFIG[norm];
        const StatusIcon = cfg.icon;
        const isExpanded = expandedId === order.id_doc;
        return /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(
            TableRow,
            {
              className: "hover:bg-muted/50 cursor-pointer",
              onClick: () => setExpandedId(isExpanded ? null : order.id_doc),
              children: [
                /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsx(
                  ChevronDown,
                  {
                    className: `h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`
                  }
                ) }),
                /* @__PURE__ */ jsxs(TableCell, { className: "font-mono text-xs font-semibold text-primary", children: [
                  "#",
                  order.id_doc,
                  order.local_id && /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground font-normal mt-0.5", children: order.local_id })
                ] }),
                /* @__PURE__ */ jsxs(TableCell, { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-medium", children: order.client_name }),
                  order.type_payment && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5", children: [
                    /* @__PURE__ */ jsx(Wallet, { className: "h-3 w-3" }),
                    order.type_payment
                  ] })
                ] }),
                /* @__PURE__ */ jsx(TableCell, { className: "hidden md:table-cell text-muted-foreground text-sm", children: order.agent?.agent_name ?? "—" }),
                /* @__PURE__ */ jsx(TableCell, { className: "hidden lg:table-cell text-muted-foreground text-sm", children: order.sklad ?? "—" }),
                /* @__PURE__ */ jsxs(TableCell, { className: "text-sm text-muted-foreground whitespace-nowrap", children: [
                  /* @__PURE__ */ jsx("div", { children: order.date_doc }),
                  order.date_delivery && order.date_delivery !== order.date_doc && /* @__PURE__ */ jsxs("div", { className: "text-xs opacity-60", children: [
                    "→ ",
                    order.date_delivery
                  ] })
                ] }),
                /* @__PURE__ */ jsxs(TableCell, { className: "font-semibold whitespace-nowrap", children: [
                  fmt(order.summa),
                  " ",
                  order.cry
                ] }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(
                  "span",
                  {
                    className: `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`,
                    children: [
                      /* @__PURE__ */ jsx(StatusIcon, { className: "h-3 w-3" }),
                      t(cfg.labelKey)
                    ]
                  }
                ) })
              ]
            },
            order.id_doc
          ),
          isExpanded && /* @__PURE__ */ jsx(
            TableRow,
            {
              className: "bg-muted/20 hover:bg-muted/20",
              children: /* @__PURE__ */ jsx(TableCell, { colSpan: 8, className: "py-0", children: /* @__PURE__ */ jsxs("div", { className: "px-6 py-4 space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
                  order.sklad && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1 text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Package, { className: "h-3 w-3 text-primary" }),
                    order.sklad
                  ] }),
                  order.type_payment && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1 text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Wallet, { className: "h-3 w-3 text-emerald-500" }),
                    order.type_payment
                  ] }),
                  order.tip_sena && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1 text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(TrendingUp, { className: "h-3 w-3 text-blue-500" }),
                    order.tip_sena
                  ] }),
                  order.date_delivery && order.date_delivery !== order.date_doc && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1 text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Truck, { className: "h-3 w-3 text-orange-500" }),
                    t("orderDate"),
                    " → ",
                    order.date_delivery
                  ] }),
                  order.agent?.agent_name && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs bg-background border rounded-full px-3 py-1 text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Users, { className: "h-3 w-3 text-violet-500" }),
                    order.agent.agent_name
                  ] }),
                  order.comment && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full px-3 py-1 text-amber-700 dark:text-amber-400", children: [
                    "💬 ",
                    order.comment
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "h-5 w-5 rounded bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Package, { className: "h-3 w-3 text-primary" }) }),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: [
                      t("products"),
                      " · ",
                      order.products?.length ?? 0,
                      " ",
                      t("type")
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    t("totalVolumeQty"),
                    ":",
                    " ",
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground", children: formatWithSpaces(order.qty, 2) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "rounded-lg border overflow-hidden", children: [
                  /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[2rem_1fr_repeat(3,7rem)] text-[11px] font-medium text-muted-foreground uppercase tracking-wide bg-muted/50 px-3 py-2", children: [
                    /* @__PURE__ */ jsx("span", { children: "#" }),
                    /* @__PURE__ */ jsx("span", { children: t("product") }),
                    /* @__PURE__ */ jsx("span", { className: "text-right", children: t("amount") }),
                    /* @__PURE__ */ jsx("span", { className: "text-right", children: t("qty") }),
                    /* @__PURE__ */ jsx("span", { className: "text-right", children: t("totalAmount") })
                  ] }),
                  (order.products ?? []).map((p, idx) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "grid grid-cols-[2rem_1fr_repeat(3,7rem)] items-center px-3 py-2.5 border-t text-sm hover:bg-muted/30 transition-colors",
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground tabular-nums", children: p.product_id }),
                        /* @__PURE__ */ jsx("span", { className: "font-medium truncate pr-2", children: p.product_name }),
                        /* @__PURE__ */ jsx("span", { className: "text-right tabular-nums text-muted-foreground", children: fmt(p.price) }),
                        /* @__PURE__ */ jsx("span", { className: "text-right tabular-nums text-muted-foreground", children: formatWithSpaces(p.qty, 2) }),
                        /* @__PURE__ */ jsx("span", { className: "text-right tabular-nums font-semibold", children: fmt(p.sum) })
                      ]
                    },
                    p.product_id
                  ))
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between rounded-xl bg-primary/5 border border-primary/10 px-4 py-2.5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(ClipboardList, { className: "h-4 w-4 text-primary" }),
                    /* @__PURE__ */ jsx("span", { children: t("total") }),
                    /* @__PURE__ */ jsxs("span", { className: "text-foreground font-medium", children: [
                      order.products?.length ?? 0,
                      " ",
                      t("products").toLowerCase()
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground/50", children: "·" }),
                    /* @__PURE__ */ jsxs("span", { className: "font-medium text-foreground", children: [
                      formatWithSpaces(order.qty, 2),
                      " ",
                      t("qty").toLowerCase()
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold text-primary", children: [
                    fmt(order.summa),
                    " ",
                    order.cry
                  ] })
                ] })
              ] }) })
            },
            `${order.id_doc}-products`
          )
        ] });
      }) })
    ] }) }) }) })
  ] });
}
const $$splitComponentImporter$7 = () => import("./notifications-Dvke8UI4.js");
const Route$7 = createFileRoute("/_app/notifications")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./markirovka-tWAhRIEH.js");
const Route$6 = createFileRoute("/_app/markirovka")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./live-map-CT2PxIUF.js");
const Route$5 = createFileRoute("/_app/live-map")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./finance-BlH-mgUt.js");
const Route$4 = createFileRoute("/_app/finance")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./devices-Ct6l7ttJ.js");
const Route$3 = createFileRoute("/_app/devices")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./dashboard-C9YIuTVe.js");
const Route$2 = createFileRoute("/_app/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./clients-D2BlDWjh.js");
const Route$1 = createFileRoute("/_app/clients")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./calendar-DvTfH0b3.js");
const Route = createFileRoute("/_app/calendar")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const LoginRoute = Route$s.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$t
});
const AppRoute = Route$r.update({
  id: "/_app",
  getParentRoute: () => Route$t
});
const IndexRoute = Route$q.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$t
});
const AdminIndexRoute = Route$p.update({
  id: "/admin/",
  path: "/admin/",
  getParentRoute: () => Route$t
});
const AdminWorkingSessionsRoute = Route$o.update({
  id: "/admin/working-sessions",
  path: "/admin/working-sessions",
  getParentRoute: () => Route$t
});
const AdminUsersRoute = Route$n.update({
  id: "/admin/users",
  path: "/admin/users",
  getParentRoute: () => Route$t
});
const AdminSettingsRoute = Route$m.update({
  id: "/admin/settings",
  path: "/admin/settings",
  getParentRoute: () => Route$t
});
const AdminNotificationsRoute = Route$l.update({
  id: "/admin/notifications",
  path: "/admin/notifications",
  getParentRoute: () => Route$t
});
const AdminMobileAppsRoute = Route$k.update({
  id: "/admin/mobile-apps",
  path: "/admin/mobile-apps",
  getParentRoute: () => Route$t
});
const AdminLoginRoute = Route$j.update({
  id: "/admin/login",
  path: "/admin/login",
  getParentRoute: () => Route$t
});
const AdminDevicesRoute = Route$i.update({
  id: "/admin/devices",
  path: "/admin/devices",
  getParentRoute: () => Route$t
});
const AdminDashboardRoute = Route$h.update({
  id: "/admin/dashboard",
  path: "/admin/dashboard",
  getParentRoute: () => Route$t
});
const AdminCompaniesRoute = Route$g.update({
  id: "/admin/companies",
  path: "/admin/companies",
  getParentRoute: () => Route$t
});
const AppWarehouseRoute = Route$f.update({
  id: "/warehouse",
  path: "/warehouse",
  getParentRoute: () => AppRoute
});
const AppStaffRoute = Route$e.update({
  id: "/staff",
  path: "/staff",
  getParentRoute: () => AppRoute
});
const AppSettingsRoute = Route$d.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AppRoute
});
const AppSalesRoute = Route$c.update({
  id: "/sales",
  path: "/sales",
  getParentRoute: () => AppRoute
});
const AppReportsRoute = Route$b.update({
  id: "/reports",
  path: "/reports",
  getParentRoute: () => AppRoute
});
const AppProfileRoute = Route$a.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => AppRoute
});
const AppProductionRoute = Route$9.update({
  id: "/production",
  path: "/production",
  getParentRoute: () => AppRoute
});
const AppOrdersRoute = Route$8.update({
  id: "/orders",
  path: "/orders",
  getParentRoute: () => AppRoute
});
const AppNotificationsRoute = Route$7.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => AppRoute
});
const AppMarkirovkaRoute = Route$6.update({
  id: "/markirovka",
  path: "/markirovka",
  getParentRoute: () => AppRoute
});
const AppLiveMapRoute = Route$5.update({
  id: "/live-map",
  path: "/live-map",
  getParentRoute: () => AppRoute
});
const AppFinanceRoute = Route$4.update({
  id: "/finance",
  path: "/finance",
  getParentRoute: () => AppRoute
});
const AppDevicesRoute = Route$3.update({
  id: "/devices",
  path: "/devices",
  getParentRoute: () => AppRoute
});
const AppDashboardRoute = Route$2.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AppRoute
});
const AppClientsRoute = Route$1.update({
  id: "/clients",
  path: "/clients",
  getParentRoute: () => AppRoute
});
const AppCalendarRoute = Route.update({
  id: "/calendar",
  path: "/calendar",
  getParentRoute: () => AppRoute
});
const AppRouteChildren = {
  AppCalendarRoute,
  AppClientsRoute,
  AppDashboardRoute,
  AppDevicesRoute,
  AppFinanceRoute,
  AppLiveMapRoute,
  AppMarkirovkaRoute,
  AppNotificationsRoute,
  AppOrdersRoute,
  AppProductionRoute,
  AppProfileRoute,
  AppReportsRoute,
  AppSalesRoute,
  AppSettingsRoute,
  AppStaffRoute,
  AppWarehouseRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  LoginRoute,
  AdminCompaniesRoute,
  AdminDashboardRoute,
  AdminDevicesRoute,
  AdminLoginRoute,
  AdminMobileAppsRoute,
  AdminNotificationsRoute,
  AdminSettingsRoute,
  AdminUsersRoute,
  AdminWorkingSessionsRoute,
  AdminIndexRoute
};
const routeTree = Route$t._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({ error, reset }) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  API as A,
  Button as B,
  Card as C,
  Input as I,
  LANGS as L,
  PageHeader as P,
  Select as S,
  Table as T,
  useSettings as a,
  useIsMobile as b,
  SelectTrigger as c,
  SelectValue as d,
  SelectContent as e,
  SelectItem as f,
  CardContent as g,
  Badge as h,
  TableHeader as i,
  TableRow as j,
  TableHead as k,
  TableBody as l,
  TableCell as m,
  cn as n,
  CardHeader as o,
  CardTitle as p,
  CardDescription as q,
  buttonVariants as r,
  Skeleton as s,
  formatWithSpaces as t,
  useAuth as u,
  getProxiedImageUrl as v,
  router as w
};

export const adminUsers = [
  { id: 1, fullName: "Azizbek Karimov", role: "Super Admin", status: "Faol", email: "azizbek@distr.uz" },
  { id: 2, fullName: "Muhammadali Tursunov", role: "Manager", status: "Faol", email: "manager@distr.uz" },
  { id: 3, fullName: "Madina Qodirova", role: "Moderator", status: "Kutilmoqda", email: "madina@distr.uz" },
];

export const adminCompanies = [
  { id: 1, name: "Distr Savdo", inn: "305667890", owner: "Azizbek Karimov", plan: "Business" },
  { id: 2, name: "Hub Logistics", inn: "309112345", owner: "Zafar Abdullaev", plan: "Standard" },
  { id: 3, name: "Smart Retail Group", inn: "301991238", owner: "Madina Qodirova", plan: "Enterprise" },
];

export const adminMobileApps = [
  { id: 1, name: "Distr Driver", icon: "/logo.png", platform: "Android", version: "2.3.1", status: "Aktiv" },
  { id: 2, name: "Distr Seller", icon: "/logo.png", platform: "iOS", version: "1.9.7", status: "Aktiv" },
  { id: 3, name: "Distr Warehouse", icon: "/logo.png", platform: "Android", version: "1.4.0", status: "Beta" },
];

export const adminNotifications = [
  { id: 1, title: "Yangi kompaniya ro'yxatdan o'tdi", type: "System", date: "2026-05-06" },
  { id: 2, title: "Driver ilovasi uchun yangilanish mavjud", type: "Update", date: "2026-05-05" },
  { id: 3, title: "2 ta foydalanuvchi parolni tikladi", type: "Security", date: "2026-05-04" },
];

export const adminSettings = [
  { key: "Platforma nomi", value: "Distr Business Hub" },
  { key: "Default til", value: "Uzbek (UZ)" },
  { key: "Push xabarnomalar", value: "Yoqilgan" },
  { key: "Admin session time", value: "8 soat" },
];

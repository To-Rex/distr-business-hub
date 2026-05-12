export type UserRole = "Super Admin" | "Admin" | "Manager" | "Moderator" | "Agent" | "Viewer";
export type UserStatus = "Faol" | "Kutilmoqda" | "Blokirovka";

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  companyId: number | null;
  companyName: string | null;
  avatar?: string;
  lastLogin: string | null;
  createdAt: string;
  permissions: string[];
  twoFactorEnabled: boolean;
  department?: string;
  address?: string;
}

export const adminUsers: AdminUser[] = [
  {
    id: 1,
    fullName: "Azizbek Karimov",
    email: "azizbek@distr.uz",
    phone: "+998 90 123 45 67",
    role: "Super Admin",
    status: "Faol",
    companyId: null,
    companyName: null,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Azizbek",
    lastLogin: "2026-05-07 09:30",
    createdAt: "2025-01-15",
    permissions: ["all"],
    twoFactorEnabled: true,
    department: "IT",
    address: "Toshkent sh., Chilonzur tumani"
  },
  {
    id: 2,
    fullName: "Muhammadali Tursunov",
    email: "manager@distr.uz",
    phone: "+998 91 234 56 78",
    role: "Manager",
    status: "Faol",
    companyId: 1,
    companyName: "Distr Savdo",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Muhammadali",
    lastLogin: "2026-05-07 08:15",
    createdAt: "2025-02-20",
    permissions: ["users.read", "users.write", "reports.read"],
    twoFactorEnabled: false,
    department: "Sotuv",
    address: "Toshkent sh., Mirzo Ulug'bek tumani"
  },
  {
    id: 3,
    fullName: "Madina Qodirova",
    email: "madina@distr.uz",
    phone: "+998 93 345 67 89",
    role: "Moderator",
    status: "Kutilmoqda",
    companyId: 3,
    companyName: "Smart Retail Group",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Madina",
    lastLogin: null,
    createdAt: "2026-05-05",
    permissions: ["users.read", "reports.read"],
    twoFactorEnabled: false,
    department: "Mijozlarga xizmat ko'rsatish",
    address: "Toshkent sh., Yunusobod tumani"
  },
  {
    id: 4,
    fullName: "Zafar Abdullaev",
    email: "zafar@distr.uz",
    phone: "+998 97 456 78 90",
    role: "Admin",
    status: "Faol",
    companyId: 2,
    companyName: "Hub Logistics",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zafar",
    lastLogin: "2026-05-06 17:45",
    createdAt: "2025-03-10",
    permissions: ["users.read", "users.write", "companies.read", "companies.write"],
    twoFactorEnabled: true,
    department: "Logistika",
    address: "Toshkent sh., Shayxontohur tumani"
  },
  {
    id: 5,
    fullName: "Nargiza Aliyeva",
    email: "nargiza@distr.uz",
    phone: "+998 88 567 89 01",
    role: "Agent",
    status: "Faol",
    companyId: 1,
    companyName: "Distr Savdo",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nargiza",
    lastLogin: "2026-05-07 10:00",
    createdAt: "2025-06-01",
    permissions: ["sales.read", "sales.write", "clients.read"],
    twoFactorEnabled: false,
    department: "Sotuv",
    address: "Toshkent sh., Olmazor tumani"
  },
  {
    id: 6,
    fullName: "Rustam Hakimov",
    email: "rustam@distr.uz",
    phone: "+998 99 678 90 12",
    role: "Viewer",
    status: "Blokirovka",
    companyId: 2,
    companyName: "Hub Logistics",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rustam",
    lastLogin: "2026-04-20 14:30",
    createdAt: "2025-08-15",
    permissions: ["reports.read"],
    twoFactorEnabled: false,
    department: "Moliya",
    address: "Toshkent sh., Bektemir tumani"
  },
  {
    id: 7,
    fullName: "Dilnoza Rahimova",
    email: "dilnoza@distr.uz",
    phone: "+998 85 789 01 23",
    role: "Manager",
    status: "Faol",
    companyId: 3,
    companyName: "Smart Retail Group",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dilnoza",
    lastLogin: "2026-05-07 11:20",
    createdAt: "2025-04-22",
    permissions: ["users.read", "users.write", "reports.read", "analytics.read"],
    twoFactorEnabled: true,
    department: "Boshqaruv",
    address: "Toshkent sh., Yashnobod tumani"
  },
  {
    id: 8,
    fullName: "Jamshid Bekmurodov",
    email: "jamshid@distr.uz",
    phone: "+998 87 890 12 34",
    role: "Agent",
    status: "Faol",
    companyId: 1,
    companyName: "Distr Savdo",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamshid",
    lastLogin: "2026-05-06 16:00",
    createdAt: "2025-09-05",
    permissions: ["sales.read", "sales.write", "clients.read", "clients.write"],
    twoFactorEnabled: false,
    department: "Sotuv",
    address: "Toshkent sh., Uchtepa tumani"
  }
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

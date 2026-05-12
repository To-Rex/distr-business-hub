export const kpis = {
  totalSales: 184290,
  activeClients: 1284,
  revenue: 562340,
  orders: 3421,
};

export const salesTrend = [
  { month: "Jan", sales: 32000, revenue: 41000 },
  { month: "Feb", sales: 28000, revenue: 38000 },
  { month: "Mar", sales: 41000, revenue: 52000 },
  { month: "Apr", sales: 38000, revenue: 47000 },
  { month: "May", sales: 52000, revenue: 64000 },
  { month: "Jun", sales: 49000, revenue: 61000 },
  { month: "Jul", sales: 61000, revenue: 73000 },
  { month: "Aug", sales: 58000, revenue: 70000 },
  { month: "Sep", sales: 67000, revenue: 81000 },
  { month: "Oct", sales: 72000, revenue: 88000 },
  { month: "Nov", sales: 78000, revenue: 95000 },
  { month: "Dec", sales: 84000, revenue: 102000 },
];

export const recentActivity = [
  { id: 1, who: "Aziz Karimov", action: "closed deal with", target: "Mega Retail LLC", time: "2m ago" },
  { id: 2, who: "Dilshod Tursunov", action: "added new client", target: "Tashkent Foods", time: "14m ago" },
  { id: 3, who: "Madina Yusupova", action: "delivered order", target: "#ORD-3402", time: "32m ago" },
  { id: 4, who: "Bekzod Rahimov", action: "restocked", target: "Warehouse A — Beverages", time: "1h ago" },
  { id: 5, who: "Nodira Saidova", action: "created invoice", target: "#INV-9921", time: "2h ago" },
  { id: 6, who: "Jasur Olimov", action: "completed batch", target: "PRD-558", time: "3h ago" },
];

export type Client = {
  id: string;
  name: string;
  phone: string;
  location: string;
  status: "active" | "inactive";
  joined: string;
};

export const clients: Client[] = [
  { id: "C-1001", name: "Mega Retail LLC", phone: "+998 90 123 4567", location: "Tashkent", status: "active", joined: "2024-02-12" },
  { id: "C-1002", name: "Tashkent Foods", phone: "+998 91 222 8810", location: "Tashkent", status: "active", joined: "2024-03-04" },
  { id: "C-1003", name: "Samarkand Trade", phone: "+998 93 552 1190", location: "Samarkand", status: "inactive", joined: "2023-11-20" },
  { id: "C-1004", name: "Bukhara Market", phone: "+998 94 871 4421", location: "Bukhara", status: "active", joined: "2024-05-18" },
  { id: "C-1005", name: "Fergana Distrib.", phone: "+998 99 661 7732", location: "Fergana", status: "active", joined: "2024-06-02" },
  { id: "C-1006", name: "Andijan Goods", phone: "+998 90 778 5521", location: "Andijan", status: "inactive", joined: "2023-09-15" },
  { id: "C-1007", name: "Namangan Plus", phone: "+998 91 334 9087", location: "Namangan", status: "active", joined: "2024-07-23" },
  { id: "C-1008", name: "Khiva Wholesale", phone: "+998 95 220 1147", location: "Khiva", status: "active", joined: "2024-08-11" },
  { id: "C-1009", name: "Nukus Retail", phone: "+998 97 661 0029", location: "Nukus", status: "active", joined: "2024-04-09" },
  { id: "C-1010", name: "Qarshi Foods", phone: "+998 90 119 4456", location: "Qarshi", status: "inactive", joined: "2023-12-01" },
];

export type Sale = {
  id: string;
  client: string;
  amount: number;
  status: "pending" | "delivered" | "cancelled";
  date: string;
};

export const sales: Sale[] = [
  { id: "ORD-3401", client: "Mega Retail LLC", amount: 12400, status: "delivered", date: "2026-04-28" },
  { id: "ORD-3402", client: "Tashkent Foods", amount: 8230, status: "delivered", date: "2026-04-29" },
  { id: "ORD-3403", client: "Samarkand Trade", amount: 5410, status: "pending", date: "2026-04-30" },
  { id: "ORD-3404", client: "Bukhara Market", amount: 14920, status: "delivered", date: "2026-05-01" },
  { id: "ORD-3405", client: "Fergana Distrib.", amount: 3380, status: "cancelled", date: "2026-05-01" },
  { id: "ORD-3406", client: "Namangan Plus", amount: 9870, status: "pending", date: "2026-05-02" },
  { id: "ORD-3407", client: "Khiva Wholesale", amount: 21200, status: "delivered", date: "2026-05-03" },
  { id: "ORD-3408", client: "Nukus Retail", amount: 6720, status: "pending", date: "2026-05-04" },
  { id: "ORD-3409", client: "Andijan Goods", amount: 4450, status: "delivered", date: "2026-05-04" },
  { id: "ORD-3410", client: "Qarshi Foods", amount: 11300, status: "pending", date: "2026-05-05" },
];

export type Staff = {
  id: string;
  name: string;
  role: "agent" | "manager" | "warehouse";
  performance: number;
  status: "active" | "inactive";
};

export const staff: Staff[] = [
  { id: "S-01", name: "Aziz Karimov", role: "agent", performance: 92, status: "active" },
  { id: "S-02", name: "Dilshod Tursunov", role: "agent", performance: 78, status: "active" },
  { id: "S-03", name: "Madina Yusupova", role: "manager", performance: 88, status: "active" },
  { id: "S-04", name: "Bekzod Rahimov", role: "warehouse", performance: 65, status: "active" },
  { id: "S-05", name: "Nodira Saidova", role: "manager", performance: 95, status: "active" },
  { id: "S-06", name: "Jasur Olimov", role: "agent", performance: 54, status: "inactive" },
  { id: "S-07", name: "Lola Karimova", role: "warehouse", performance: 81, status: "active" },
  { id: "S-08", name: "Sherzod Aliyev", role: "agent", performance: 70, status: "active" },
];

export type Product = {
  id: string;
  name: string;
  category: string;
  stock: number;
  threshold: number;
};

export const products: Product[] = [
  { id: "P-101", name: "Mineral Water 1.5L", category: "Beverages", stock: 1240, threshold: 300 },
  { id: "P-102", name: "Cola 0.5L", category: "Beverages", stock: 84, threshold: 200 },
  { id: "P-103", name: "Sunflower Oil 5L", category: "Grocery", stock: 312, threshold: 150 },
  { id: "P-104", name: "Rice 25kg", category: "Grocery", stock: 47, threshold: 100 },
  { id: "P-105", name: "Detergent 3kg", category: "Household", stock: 220, threshold: 80 },
  { id: "P-106", name: "Toothpaste", category: "Personal Care", stock: 890, threshold: 200 },
  { id: "P-107", name: "Coffee 250g", category: "Grocery", stock: 38, threshold: 100 },
  { id: "P-108", name: "Snack Pack", category: "Snacks", stock: 1620, threshold: 400 },
  { id: "P-109", name: "Shampoo 400ml", category: "Personal Care", stock: 412, threshold: 150 },
  { id: "P-110", name: "Juice 1L", category: "Beverages", stock: 92, threshold: 250 },
];

export const finance = {
  income: 562340,
  expense: 318220,
  profit: 244120,
  monthly: salesTrend.map((m) => ({
    month: m.month,
    income: m.revenue,
    expense: Math.round(m.revenue * 0.58),
  })),
  transactions: [
    { id: "T-9001", type: "income" as const, party: "Mega Retail LLC", amount: 12400, date: "2026-05-01" },
    { id: "T-9002", type: "expense" as const, party: "Logistics Co.", amount: 2200, date: "2026-05-01" },
    { id: "T-9003", type: "income" as const, party: "Tashkent Foods", amount: 8230, date: "2026-05-02" },
    { id: "T-9004", type: "expense" as const, party: "Salaries", amount: 18500, date: "2026-05-03" },
    { id: "T-9005", type: "income" as const, party: "Bukhara Market", amount: 14920, date: "2026-05-03" },
    { id: "T-9006", type: "expense" as const, party: "Suppliers", amount: 9700, date: "2026-05-04" },
    { id: "T-9007", type: "income" as const, party: "Khiva Wholesale", amount: 21200, date: "2026-05-04" },
  ],
};

export type Batch = {
  id: string;
  product: string;
  quantity: number;
  status: "in_progress" | "completed" | "delayed";
  start: string;
  due: string;
};

export const batches: Batch[] = [
  { id: "PRD-554", product: "Mineral Water 1.5L", quantity: 5000, status: "completed", start: "2026-04-20", due: "2026-04-28" },
  { id: "PRD-555", product: "Cola 0.5L", quantity: 8000, status: "in_progress", start: "2026-04-25", due: "2026-05-08" },
  { id: "PRD-556", product: "Juice 1L", quantity: 3200, status: "delayed", start: "2026-04-22", due: "2026-05-02" },
  { id: "PRD-557", product: "Snack Pack", quantity: 12000, status: "in_progress", start: "2026-04-28", due: "2026-05-10" },
  { id: "PRD-558", product: "Detergent 3kg", quantity: 2400, status: "completed", start: "2026-04-15", due: "2026-04-26" },
  { id: "PRD-559", product: "Coffee 250g", quantity: 1800, status: "delayed", start: "2026-04-18", due: "2026-04-30" },
];

export const agents = [
  { id: "A-1", name: "Aziz K.", lat: 41.2995, lng: 69.2401, color: "var(--chart-1)" },
  { id: "A-2", name: "Dilshod T.", lat: 41.3115, lng: 69.2785, color: "var(--chart-2)" },
  { id: "A-3", name: "Madina Y.", lat: 39.6542, lng: 66.9597, color: "var(--chart-4)" },
  { id: "A-4", name: "Bekzod R.", lat: 40.1010, lng: 65.3800, color: "var(--chart-5)" },
  { id: "A-5", name: "Sherzod A.", lat: 40.5300, lng: 70.9500, color: "var(--chart-3)" },
];

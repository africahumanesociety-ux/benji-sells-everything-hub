import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, ShoppingBag, Users, DollarSign,
  Package, ArrowUpRight, ArrowDownRight, Lock, LayoutDashboard,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  product_name: string;
  category: string;
  amount: number;
  quantity: number;
  status: "completed" | "pending" | "cancelled" | "refunded";
  created_at: string;
}

// ─── Mock fallback data (shown when Supabase table does not yet exist) ────────
const MOCK_ORDERS: Order[] = [
  { id: "1",  order_number: "ORD-001", customer_name: "Emeka Okafor",    product_name: "Wireless Earbuds",    category: "electronics",  amount: 15000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 88 * 86400000).toISOString() },
  { id: "2",  order_number: "ORD-002", customer_name: "Ngozi Adeyemi",   product_name: "Smart Watch",         category: "electronics",  amount: 25000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 85 * 86400000).toISOString() },
  { id: "3",  order_number: "ORD-003", customer_name: "Chidi Nwosu",     product_name: "Bluetooth Speaker",  category: "electronics",  amount: 12000, quantity: 2, status: "completed", created_at: new Date(Date.now() - 82 * 86400000).toISOString() },
  { id: "4",  order_number: "ORD-004", customer_name: "Amaka Eze",       product_name: "Women's Handbag",    category: "fashion",      amount: 18000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 80 * 86400000).toISOString() },
  { id: "5",  order_number: "ORD-005", customer_name: "Tunde Balogun",   product_name: "Men's Polo Shirt",   category: "fashion",      amount: 8000,  quantity: 3, status: "completed", created_at: new Date(Date.now() - 78 * 86400000).toISOString() },
  { id: "6",  order_number: "ORD-006", customer_name: "Fatima Musa",     product_name: "LED Desk Lamp",      category: "home",         amount: 6500,  quantity: 1, status: "completed", created_at: new Date(Date.now() - 75 * 86400000).toISOString() },
  { id: "7",  order_number: "ORD-007", customer_name: "Kemi Adewale",    product_name: "Leather Wallet",     category: "accessories",  amount: 5000,  quantity: 2, status: "completed", created_at: new Date(Date.now() - 72 * 86400000).toISOString() },
  { id: "8",  order_number: "ORD-008", customer_name: "Seun Okonkwo",    product_name: "Phone Case",         category: "accessories",  amount: 3000,  quantity: 4, status: "completed", created_at: new Date(Date.now() - 70 * 86400000).toISOString() },
  { id: "9",  order_number: "ORD-009", customer_name: "Bola Fashola",    product_name: "Power Bank 20000mAh",category: "electronics",  amount: 14000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 68 * 86400000).toISOString() },
  { id: "10", order_number: "ORD-010", customer_name: "Adaobi Igwe",     product_name: "Sneakers",           category: "fashion",      amount: 22000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 65 * 86400000).toISOString() },
  { id: "11", order_number: "ORD-011", customer_name: "Yemi Adesanya",   product_name: "Gold Wristwatch",    category: "accessories",  amount: 45000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 62 * 86400000).toISOString() },
  { id: "12", order_number: "ORD-012", customer_name: "Ola Bankole",     product_name: "Laptop Backpack",    category: "accessories",  amount: 16000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 60 * 86400000).toISOString() },
  { id: "13", order_number: "ORD-013", customer_name: "Chisom Obi",      product_name: "Wireless Earbuds",   category: "electronics",  amount: 15000, quantity: 2, status: "completed", created_at: new Date(Date.now() - 58 * 86400000).toISOString() },
  { id: "14", order_number: "ORD-014", customer_name: "Dayo Adekunle",   product_name: "Ceramic Mug Set",    category: "home",         amount: 7000,  quantity: 1, status: "completed", created_at: new Date(Date.now() - 55 * 86400000).toISOString() },
  { id: "15", order_number: "ORD-015", customer_name: "Ife Adeyemi",     product_name: "Gaming Mouse RGB",   category: "electronics",  amount: 11000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 52 * 86400000).toISOString() },
  { id: "16", order_number: "ORD-016", customer_name: "Nkechi Uzo",      product_name: "Throw Pillows (set)",category: "home",         amount: 9000,  quantity: 2, status: "completed", created_at: new Date(Date.now() - 50 * 86400000).toISOString() },
  { id: "17", order_number: "ORD-017", customer_name: "Babatunde Okeke", product_name: "Sunglasses",         category: "accessories",  amount: 7500,  quantity: 1, status: "completed", created_at: new Date(Date.now() - 47 * 86400000).toISOString() },
  { id: "18", order_number: "ORD-018", customer_name: "Chiamaka Ibe",    product_name: "Premium Headphones", category: "electronics",  amount: 35000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 45 * 86400000).toISOString() },
  { id: "19", order_number: "ORD-019", customer_name: "Musa Ibrahim",    product_name: "Running Shoes",      category: "fashion",      amount: 19000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 42 * 86400000).toISOString() },
  { id: "20", order_number: "ORD-020", customer_name: "Sade Ogundimu",   product_name: "Wireless Charger",   category: "electronics",  amount: 8500,  quantity: 3, status: "completed", created_at: new Date(Date.now() - 40 * 86400000).toISOString() },
  { id: "21", order_number: "ORD-021", customer_name: "Emeka Okafor",    product_name: "Smart Watch",        category: "electronics",  amount: 25000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 38 * 86400000).toISOString() },
  { id: "22", order_number: "ORD-022", customer_name: "Zainab Yusuf",    product_name: "Scented Candle",     category: "home",         amount: 4500,  quantity: 4, status: "completed", created_at: new Date(Date.now() - 35 * 86400000).toISOString() },
  { id: "23", order_number: "ORD-023", customer_name: "Tope Abiodun",    product_name: "Women's Handbag",    category: "fashion",      amount: 18000, quantity: 1, status: "pending",   created_at: new Date(Date.now() - 33 * 86400000).toISOString() },
  { id: "24", order_number: "ORD-024", customer_name: "Ikenna Obi",      product_name: "Bluetooth Speaker",  category: "electronics",  amount: 12000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
  { id: "25", order_number: "ORD-025", customer_name: "Adaeze Nwofor",   product_name: "Laptop Backpack",    category: "accessories",  amount: 16000, quantity: 2, status: "completed", created_at: new Date(Date.now() - 28 * 86400000).toISOString() },
  { id: "26", order_number: "ORD-026", customer_name: "Bisi Olawale",    product_name: "LED Desk Lamp",      category: "home",         amount: 6500,  quantity: 2, status: "completed", created_at: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: "27", order_number: "ORD-027", customer_name: "Chukwu Amadi",    product_name: "Phone Case",         category: "accessories",  amount: 3000,  quantity: 5, status: "completed", created_at: new Date(Date.now() - 23 * 86400000).toISOString() },
  { id: "28", order_number: "ORD-028", customer_name: "Halima Sule",     product_name: "Gold Wristwatch",    category: "accessories",  amount: 45000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: "29", order_number: "ORD-029", customer_name: "Lanre Adewumi",   product_name: "Wireless Earbuds",   category: "electronics",  amount: 15000, quantity: 1, status: "cancelled", created_at: new Date(Date.now() - 18 * 86400000).toISOString() },
  { id: "30", order_number: "ORD-030", customer_name: "Ngozi Adeyemi",   product_name: "Premium Headphones", category: "electronics",  amount: 35000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: "31", order_number: "ORD-031", customer_name: "Funke Akindele",  product_name: "Ceramic Mug Set",    category: "home",         amount: 7000,  quantity: 3, status: "completed", created_at: new Date(Date.now() - 13 * 86400000).toISOString() },
  { id: "32", order_number: "ORD-032", customer_name: "Rotimi Adesola",  product_name: "Sneakers",           category: "fashion",      amount: 22000, quantity: 2, status: "completed", created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: "33", order_number: "ORD-033", customer_name: "Yetunde Badmus",  product_name: "Gaming Mouse RGB",   category: "electronics",  amount: 11000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: "34", order_number: "ORD-034", customer_name: "Kola Fashola",    product_name: "Power Bank 20000mAh",category: "electronics",  amount: 14000, quantity: 2, status: "completed", created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: "35", order_number: "ORD-035", customer_name: "Amina Garba",     product_name: "Wireless Charger",   category: "electronics",  amount: 8500,  quantity: 1, status: "completed", created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: "36", order_number: "ORD-036", customer_name: "Taiwo Oduola",    product_name: "Running Shoes",      category: "fashion",      amount: 19000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: "37", order_number: "ORD-037", customer_name: "Obiageli Nzeka",  product_name: "Leather Wallet",     category: "accessories",  amount: 5000,  quantity: 2, status: "pending",   created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: "38", order_number: "ORD-038", customer_name: "Emeka Okafor",    product_name: "Smart Watch",        category: "electronics",  amount: 25000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 12 * 3600000).toISOString() },
  { id: "39", order_number: "ORD-039", customer_name: "Ngozi Adeyemi",   product_name: "Women's Handbag",    category: "fashion",      amount: 18000, quantity: 1, status: "completed", created_at: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: "40", order_number: "ORD-040", customer_name: "Chidi Nwosu",     product_name: "Premium Headphones", category: "electronics",  amount: 35000, quantity: 1, status: "pending",   created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
];

const ADMIN_PASSWORD_KEY = "benji_admin_auth";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "benji2024";

const CATEGORY_COLORS: Record<string, string> = {
  electronics:  "hsl(218,92%,56%)",
  fashion:      "hsl(340,80%,58%)",
  home:         "hsl(142,70%,45%)",
  accessories:  "hsl(35,90%,55%)",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildWeeklyRevenue(orders: Order[]) {
  const now = Date.now();
  // Build 12 weekly buckets anchored to real timestamps
  const buckets: Array<{ label: string; anchorMs: number; revenue: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const anchorMs = now - i * 7 * 86400000;
    const label = new Date(anchorMs).toLocaleDateString("en-NG", { month: "short", day: "numeric" });
    buckets.push({ label, anchorMs, revenue: 0 });
  }
  for (const o of orders) {
    if (o.status === "cancelled" || o.status === "refunded") continue;
    const orderMs = new Date(o.created_at).getTime();
    // Find the bucket whose anchor is closest in time
    let closest = buckets[0];
    let minDiff = Infinity;
    for (const b of buckets) {
      const diff = Math.abs(b.anchorMs - orderMs);
      if (diff < minDiff) { minDiff = diff; closest = b; }
    }
    closest.revenue += o.amount * o.quantity;
  }
  return buckets.map(({ label, revenue }) => ({ week: label, revenue }));
}

function buildCategoryBreakdown(orders: Order[]) {
  const cats: Record<string, number> = {};
  for (const o of orders) {
    if (o.status === "cancelled" || o.status === "refunded") continue;
    cats[o.category] = (cats[o.category] ?? 0) + o.amount * o.quantity;
  }
  return Object.entries(cats).map(([name, value]) => ({ name, value }));
}

function buildTopProducts(orders: Order[]) {
  const prods: Record<string, number> = {};
  for (const o of orders) {
    if (o.status === "cancelled" || o.status === "refunded") continue;
    prods[o.product_name] = (prods[o.product_name] ?? 0) + o.amount * o.quantity;
  }
  return Object.entries(prods)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7);
}

const formatNaira = (n: number) => "₦" + n.toLocaleString("en-NG");

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending:   "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  refunded:  "bg-purple-100 text-purple-700",
};

// ─── Password gate ────────────────────────────────────────────────────────────
const PasswordGate = ({ onAuth }: { onAuth: () => void }) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_PASSWORD_KEY, "1");
      onAuth();
    } else {
      setError(true);
      setValue("");
    }
  };

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-soft"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Lock size={28} className="text-primary" />
            </div>
            <h1 className="font-heading text-3xl text-center">Seller Dashboard</h1>
            <p className="text-sm text-muted-foreground text-center mt-2">Enter your admin password to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(false); }}
              placeholder="Admin password"
              className={error ? "border-destructive" : ""}
              autoFocus
            />
            {error && <p className="text-xs text-destructive">Incorrect password.</p>}
            <Button type="submit" className="w-full gold-gradient text-primary-foreground">
              Enter Dashboard
            </Button>
          </form>
        </motion.div>
      </section>
    </Layout>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DashboardContent = ({ orders, onLogout }: { orders: Order[]; onLogout: () => void }) => {
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue    = completedOrders.reduce((s, o) => s + o.amount * o.quantity, 0);
  const totalOrders     = orders.length;
  const pendingCount    = orders.filter((o) => o.status === "pending").length;
  const uniqueCustomers = new Set(orders.map((o) => o.customer_name)).size;

  const weeklyRevenue  = buildWeeklyRevenue(orders);
  const categoryData   = buildCategoryBreakdown(orders);
  const topProducts    = buildTopProducts(orders);
  const recentOrders   = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);

  const stats = [
    { label: "Total Revenue",  value: formatNaira(totalRevenue), icon: DollarSign, change: "+18%", up: true },
    { label: "Total Orders",   value: totalOrders,               icon: ShoppingBag, change: "+12%", up: true },
    { label: "Customers",      value: uniqueCustomers,           icon: Users,       change: "+8%",  up: true },
    { label: "Pending Orders", value: pendingCount,              icon: Package,     change: `-${pendingCount}`, up: false },
  ];

  return (
    <Layout>
      <section className="pt-24 pb-16 px-4 md:px-8 bg-background min-h-screen">
        <div className="container mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="eyebrow mb-1">◍ Admin</p>
              <h1 className="font-heading text-[clamp(2rem,6vw,4rem)] leading-none flex items-center gap-3">
                <LayoutDashboard size={36} className="text-primary" />
                Sales Dashboard
              </h1>
            </motion.div>
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
              <LogOut size={14} /> Sign out
            </Button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon size={15} className="text-primary" />
                  </div>
                </div>
                <p className="font-heading text-3xl">{s.value}</p>
                <p className={`text-xs mt-1 flex items-center gap-1 ${s.up ? "text-green-600" : "text-muted-foreground"}`}>
                  {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {s.change} vs last month
                </p>
              </motion.div>
            ))}
          </div>

          {/* Revenue over time */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6 mb-6"
          >
            <h2 className="font-heading text-xl mb-6">Revenue (last 12 weeks)</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={weeklyRevenue} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
                <YAxis tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip formatter={(v: number) => [formatNaira(v), "Revenue"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary))" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category + Top products */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Category pie */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="font-heading text-xl mb-6">Revenue by Category</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatNaira(v)} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend formatter={(v) => <span style={{ fontSize: 12, color: "hsl(var(--foreground))" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Top products bar */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="font-heading text-xl mb-6">Top Products</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }} />
                  <Tooltip formatter={(v: number) => [formatNaira(v), "Revenue"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Recent orders table */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <h2 className="font-heading text-xl mb-6">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">Order</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">Customer</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">Product</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">Amount</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left py-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{o.order_number}</td>
                      <td className="py-3 pr-4 font-medium">{o.customer_name}</td>
                      <td className="py-3 pr-4 text-muted-foreground max-w-[160px] truncate">{o.product_name}</td>
                      <td className="py-3 pr-4 font-heading text-primary">{formatNaira(o.amount * o.quantity)}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${statusColors[o.status]}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {new Date(o.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

        </div>
      </section>
    </Layout>
  );
};

// ─── Root component ───────────────────────────────────────────────────────────
const Dashboard = () => {
  const [authed, setAuthed] = useState(() => localStorage.getItem(ADMIN_PASSWORD_KEY) === "1");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authed) { setLoading(false); return; }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data && data.length > 0) {
          setOrders(data as Order[]);
        } else {
          setOrders(MOCK_ORDERS);
        }
      } catch {
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authed]);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_PASSWORD_KEY);
    setAuthed(false);
  };

  if (!authed) return <PasswordGate onAuth={() => setAuthed(true)} />;
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return <DashboardContent orders={orders} onLogout={handleLogout} />;
};

export default Dashboard;

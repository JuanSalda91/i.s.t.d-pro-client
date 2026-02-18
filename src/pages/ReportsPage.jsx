import { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { reportsApi } from "../api/reportsApi";

// ── Color palette matching your app's style ──
const BLUE = "#3B5CD4";
const TEAL = "#3A96D4";
const GREEN = "#33B833";
const PIE_COLORS = ["#3B5CD4", "#3A96D4", "#33B833", "#f59e0b", "#ef4444"];

// ── Reusable stat card ────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4"
      style={{ border: "1px solid #e2e8f0" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(59,92,212,0.08)" }}
      >
        {icon}
      </div>
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "#94a3b8" }}
        >
          {label}
        </p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: "#1e293b" }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Custom tooltip shared by bar/line charts ──────────────────────────────────
function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{
        background: "#1e293b",
        color: "#f1f5f9",
        border: "1px solid #334155",
      }}
    >
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey}>
          {p.name}:{" "}
          <span style={{ color: "#93c5fd" }}>
            ${Number(p.value).toFixed(2)}
          </span>
        </p>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const [salesStats, setSalesStats] = useState(null);
  const [invoiceStats, setInvoiceStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = useCallback(async (yr) => {
    try {
      setError("");
      setLoading(true);

      const [sRes, iRes, mRes, tRes] = await Promise.all([
        reportsApi.getSalesStats(),
        reportsApi.getInvoiceStats(),
        reportsApi.getMonthlyRevenue(yr),
        reportsApi.getTopProducts(5),
      ]);

      setSalesStats(sRes.data.stats);
      setInvoiceStats(iRes.data.stats);

      const MONTH_NAMES = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const raw = mRes.data.months || [];
      setMonthlyData(
        raw.map((m) => ({
          name: MONTH_NAMES[(m.month ?? m._id) - 1] ?? `Month ${m.month}`,
          revenue: m.revenue ?? m.totalRevenue ?? 0,
        })),
      );

      const tp = tRes.data.products || [];
      setTopProducts(
        tp.map((p) => ({
          name: p.productName ?? p.name ?? "Unknown",
          qty: p.totalQuantity ?? p.quantity ?? 0,
          revenue: p.totalRevenue ?? p.revenue ?? 0,
        })),
      );
    } catch (err) {
      console.error("Error loading reports:", err);
      setError(err.response?.data?.message || "Failed to load report data.");
    } finally {
      setLoading(false);
    }
  }, []); // empty deps — fetchAll doesn't depend on any state directly

  useEffect(() => {
    fetchAll(year);
  }, [year, fetchAll]); // fetchAll is now stable, safe to include
  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f1f5f9" }}
      >
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 animate-spin"
            style={{ color: "#3B5CD4" }}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <span className="text-sm font-medium" style={{ color: "#64748b" }}>
            Loading reports…
          </span>
        </div>
      </div>
    );
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmt = (n) =>
    `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtN = (n) => Number(n || 0).toLocaleString();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="flex-1 p-8 overflow-auto">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1e293b" }}>
            Reports
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            Sales & invoice analytics
          </p>
        </div>

        {/* Year picker */}
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-xl px-4 py-2 text-sm font-medium focus:outline-none appearance-none"
          style={{
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#475569",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 10px center",
            backgroundSize: "14px",
            paddingRight: "32px",
          }}
        >
          {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div
          className="mb-6 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          }}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </div>
      )}

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 gap-4 mb-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        <StatCard
          label="Total Revenue"
          value={fmt(salesStats?.totalRevenue)}
          sub={`${fmtN(salesStats?.totalSales)} sales`}
          icon={
            <svg
              className="w-5 h-5"
              style={{ color: BLUE }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />

        <StatCard
          label="Avg Sale Value"
          value={fmt(salesStats?.averageSaleValue)}
          sub={`Max: ${fmt(salesStats?.maxSaleValue)}`}
          icon={
            <svg
              className="w-5 h-5"
              style={{ color: TEAL }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
        />

        <StatCard
          label="Total Invoices"
          value={fmtN(invoiceStats?.totalInvoices)}
          sub={`Paid: ${fmtN(invoiceStats?.paidInvoices)}`}
          icon={
            <svg
              className="w-5 h-5"
              style={{ color: GREEN }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />

        <StatCard
          label="Invoice Revenue"
          value={fmt(invoiceStats?.totalRevenue ?? invoiceStats?.totalAmount)}
          sub={`Overdue: ${fmtN(invoiceStats?.overdueInvoices)}`}
          icon={
            <svg
              className="w-5 h-5"
              style={{ color: "#f59e0b" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          }
        />
      </div>

      {/* ── Monthly Revenue Chart ─────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl p-6 shadow-sm mb-6"
        style={{ border: "1px solid #e2e8f0" }}
      >
        <h2
          className="text-base font-semibold mb-1"
          style={{ color: "#1e293b" }}
        >
          Monthly Revenue — {year}
        </h2>
        <p className="text-xs mb-5" style={{ color: "#94a3b8" }}>
          Total revenue generated per month
        </p>

        {monthlyData.length === 0 ? (
          <div
            className="py-12 text-center text-sm"
            style={{ color: "#94a3b8" }}
          >
            No monthly data for {year}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={monthlyData}
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
                }
              />
              <Tooltip
                content={<RevenueTooltip />}
                cursor={{ fill: "rgba(59,92,212,0.05)" }}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill={BLUE}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Bottom row: Line chart + Pie chart ───────────────────────────── */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}
      >
        {/* Revenue Trend (Line) */}
        <div
          className="bg-white rounded-2xl p-6 shadow-sm"
          style={{ border: "1px solid #e2e8f0" }}
        >
          <h2
            className="text-base font-semibold mb-1"
            style={{ color: "#1e293b" }}
          >
            Revenue Trend
          </h2>
          <p className="text-xs mb-5" style={{ color: "#94a3b8" }}>
            Month-over-month revenue line
          </p>

          {monthlyData.length === 0 ? (
            <div
              className="py-12 text-center text-sm"
              style={{ color: "#94a3b8" }}
            >
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={monthlyData}
                margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`
                  }
                />
                <Tooltip content={<RevenueTooltip />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke={TEAL}
                  strokeWidth={2.5}
                  dot={{ fill: TEAL, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products (Pie) */}
        <div
          className="bg-white rounded-2xl p-6 shadow-sm"
          style={{ border: "1px solid #e2e8f0" }}
        >
          <h2
            className="text-base font-semibold mb-1"
            style={{ color: "#1e293b" }}
          >
            Top Products
          </h2>
          <p className="text-xs mb-5" style={{ color: "#94a3b8" }}>
            By quantity sold (top 5)
          </p>

          {topProducts.length === 0 ? (
            <div
              className="py-12 text-center text-sm"
              style={{ color: "#94a3b8" }}
            >
              No product data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={topProducts}
                  dataKey="qty"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} units`, name]}
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    color: "#1e293b",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  itemStyle={{ color: "#475569" }}
                  labelStyle={{ color: "#1e293b", fontWeight: 600 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span style={{ color: "#64748b", fontSize: "12px" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </main>
  );
}

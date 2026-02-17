import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { dashboardApi } from "../api/dashboardApi.js";
import { Link } from "react-router-dom";

/**
 * Dashboard
 *
 * Shows:
 * - Logged-in user email and Logout button
 * - Summary cards:
 * - Revenue this year (current month)
 * - Total invoices (and paid count)
 * - Low stock products count
 */
export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    pendingAmount: 0,
    averageInvoiceAmount: 0,
    lowStockCount: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError("");
        setLoading(true);

        const currentYear = new Date().getFullYear();

        // Call all endpoints in parallel
        const [revenueRes, invoiceStatsRes, lowStockRes] = await Promise.all([
          dashboardApi.getMonthlyRevenue(currentYear),
          dashboardApi.getInvoiceStats(),
          dashboardApi.getLowStock(5),
        ]);

        // ----- Monthly revenue -----
        // We take the last month entry (highest month) for the current year.
        const months = revenueRes.data.months || [];
        let monthlyRevenue = 0;
        if (months.length > 0) {
          const lastMonth = months[months.length - 1];
          monthlyRevenue = lastMonth.totalRevenue || 0;
        }

        // ----- Invoice stats -----
        const invoiceStats = invoiceStatsRes.data?.stats || {};

        const totalInvoices = invoiceStats.totalInvoices || 0;
        const paidInvoices = invoiceStats.paidInvoices || 0;
        const unpaidInvoices = invoiceStats.unpaidInvoices || 0;
        const pendingAmount = invoiceStats.pendingAmount || 0;
        const averageInvoiceAmount = invoiceStats.averageInvoiceAmount || 0;

        // ----- Low stock -----
        const lowStockCount = lowStockRes.data?.count || 0;

        setStats((prev) => ({
          ...prev,
          monthlyRevenue,
          totalInvoices,
          paidInvoices,
          unpaidInvoices,
          pendingAmount,
          averageInvoiceAmount,
          lowStockCount,
        }));
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        const message =
          err.response?.data?.message || "Failed to load dashboard data.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-sm">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">
          I.S.T.D PRO Dashboard
        </h1>
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="px-3 py-1 text-xs rounded bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200"
          >
            View products
          </Link>
          <Link
            to="/products/new"
            className="px-3 py-1 text-xs rounded bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200"
          >
            New product
          </Link>
          <span className="text-sm text-slate-600">{user?.email}</span>
          <button
            onClick={logout}
            className="px-3 py-1 text-xs rounded bg-slate-800 text-white hover:bg-slate-900"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="mb-4 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Revenue card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-medium text-slate-500 mb-1">
            Revenue (this year – latest month)
          </h2>
          <p className="text-2xl font-semibold text-slate-800">
            ${stats.monthlyRevenue.toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Based on completed sales.
          </p>
        </div>

        {/* Invoices card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-medium text-slate-500 mb-1">Invoices</h2>
          <p className="text-2xl font-semibold text-slate-800">
            {stats.totalInvoices}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Paid: {stats.paidInvoices} • Unpaid:{stats.unpaidInvoices}
            {stats.totalInvoices - stats.paidInvoices}
          </p>
        </div>

        {/* Low stock card */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-medium text-slate-500 mb-1">
            Low stock products
          </h2>
          <p className="text-2xl font-semibold text-slate-800">
            {stats.lowStockCount}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            At or below threshold of 5.
          </p>
        </div>
      </section>
    </div>
  );
}

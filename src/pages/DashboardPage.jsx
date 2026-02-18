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
  const { user } = useAuth();

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
    <div className="min-h-screen flex" style={{ background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 p-8 overflow-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1e293b' }}>Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
              Welcome back, {user?.email?.split('@')[0]}
            </p>
          </div>
          <Link to="/sales/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #3B5CD4, #3A96D4)', boxShadow: '0 2px 12px rgba(59,92,212,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,92,212,0.45)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(59,92,212,0.3)'}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Sale
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* ── STAT CARDS ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* Revenue */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                Monthly Revenue
              </p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(59,92,212,0.1)' }}>
                <svg className="w-4 h-4" style={{ color: '#3B5CD4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#1e293b' }}>
              ${stats.monthlyRevenue.toFixed(2)}
            </p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Based on completed sales this month</p>
          </div>

          {/* Invoices */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                Invoices
              </p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(58,150,212,0.1)' }}>
                <svg className="w-4 h-4" style={{ color: '#3A96D4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#1e293b' }}>{stats.totalInvoices}</p>
            <div className="flex items-center gap-3 text-xs" style={{ color: '#94a3b8' }}>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#33B833' }} />
                Paid: {stats.paidInvoices}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: '#f59e0b' }} />
                Unpaid: {stats.unpaidInvoices}
              </span>
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
                Low Stock
              </p>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: stats.lowStockCount > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(51,184,51,0.1)' }}>
                <svg className="w-4 h-4"
                  style={{ color: stats.lowStockCount > 0 ? '#ef4444' : '#33B833' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1"
              style={{ color: stats.lowStockCount > 0 ? '#ef4444' : '#1e293b' }}>
              {stats.lowStockCount}
            </p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              {stats.lowStockCount > 0
                ? 'Products at or below threshold of 5'
                : 'All products sufficiently stocked'}
            </p>
          </div>
        </section>

        {/* ── QUICK ACTIONS ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { to: '/sales', label: 'View Sales', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: '#3B5CD4', bg: 'rgba(59,92,212,0.08)' },
              { to: '/invoices', label: 'View Invoices', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: '#3A96D4', bg: 'rgba(58,150,212,0.08)' },
              { to: '/products', label: 'View Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: '#33B833', bg: 'rgba(51,184,51,0.08)' },
              { to: '/products/new', label: 'New Product', icon: 'M12 4v16m8-8H4', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
            ].map(({ to, label, icon, color, bg }) => (
              <Link key={to} to={to}
                className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3 text-center transition-all duration-150"
                style={{ border: '1px solid #e2e8f0' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 4px 16px ${color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = ''; }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                  <svg className="w-5 h-5" style={{ color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                  </svg>
                </div>
                <p className="text-sm font-semibold" style={{ color: '#334155' }}>{label}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

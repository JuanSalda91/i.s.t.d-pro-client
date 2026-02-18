import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { salesApi } from "../api/salesApi.js";
import { invoiceApi } from "../api/invoiceApi.js";

/**
 * SalesListPage
 *
 * - Show a table of sales
 * - Filter by status (pending/completed/cancelled)
 * - create invoice from a sale using POST /api/invoices
 */
export default function SalesListPage() {
  //data front backend
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState({
    totalSales: 0,
    currentPage: 1,
    totalPages: 1,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [creatingInvoiceId, setCreatingInvoiceId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingStatus, setEditingStatus] = useState({});
  const [savingStatusId, setSavingStatusId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch sales from API //
  const fetchSales = async (page = 1) => {
    try {
      setError("");
      setLoading(true);

      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const res = await salesApi.getSales(params);

      const list = res.data.sales || [];
      setSales(list);
      setPagination(res.data.pagination || pagination);

      //init editingStatus
      const initialStatus = {};
      list.forEach((sale) => {
        initialStatus[sale._id] = sale.status;
      });
      setEditingStatus(initialStatus);
    } catch (err) {
      console.error("Error fetching sales:", err);
      const msg = err.response?.data?.message || "Failed to load sales";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  //load on mount + when status filter changes
  useEffect(() => {
    fetchSales(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Handlers //
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSaleStatusChange = (saleId, newStatus) => {
    setEditingStatus((prev) => ({
      ...prev,
      [saleId]: newStatus,
    }));
  };

  const handleSaveSaleStatus = async (sale) => {
    const newStatus = editingStatus[sale._id];
    if (!newStatus || newStatus === sale.status) return;

    try {
      setError("");
      setSuccessMessage("");
      setSavingStatusId(sale._id);

      await salesApi.updateSale(sale._id, { status: newStatus });

      // Refresh list
      await fetchSales(pagination.currentPage);
      setSuccessMessage("Sale status updated.");
    } catch (err) {
      console.error("Error updating sale status:", err);
      const msg =
        err.response?.data?.message || "Failed to update sale status.";
      setError(msg);
    } finally {
      setSavingStatusId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (pagination.totalPages || 1)) return;
    fetchSales(newPage);
  };

  const handleDeleteSale = async (sale) => {
    const confirmed = window.confirm(
      `Delete sale for ${sale.customerName} (${sale.customerEmail})? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");
      setDeletingId(sale._id);

      await salesApi.deleteSale(sale._id);

      // Refresh current page
      await fetchSales(pagination.currentPage);
      setSuccessMessage("Sale deleted successfully.");
    } catch (err) {
      console.error("Error deleting sale:", err);
      const msg = err.response?.data?.message || "Failed to delete sale.";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Create invoice from a sale
   *
   * -send POST /api/invoices with {saleId}
   * backend:
   *    -validate sale
   *    - creates invoice with status 'draft'
   * - on success: show success message
   */
  const handleCreateInvoice = async (saleId) => {
    try {
      setError("");
      setSuccessMessage("");
      setCreatingInvoiceId(saleId);

      // For now we only send saleId; taxPercentage/notes optional
      await invoiceApi.createInvoiceFromSale({ saleId });

      setSuccessMessage("Invoice created successfully from sale.");
    } catch (err) {
      console.error("Error creating invoice from sale:", err);
      const msg =
        err.response?.data?.message || "Failed to create invoice from sale.";
      setError(msg);
    } finally {
      setCreatingInvoiceId(null);
    }
  };

  // RENDER //
  if (loading && sales.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-sm">Loading sales...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#f1f5f9", fontFamily: "system-ui, sans-serif" }}
    >
      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1e293b" }}>
              Sales
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
              {sales.length} sale{sales.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <Link
            to="/sales/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150"
            style={{
              background: "linear-gradient(135deg, #3B5CD4, #3A96D4)",
              boxShadow: "0 2px 12px rgba(59,92,212,0.3)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(59,92,212,0.45)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.boxShadow =
                "0 2px 12px rgba(59,92,212,0.3)")
            }
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Sale
          </Link>
        </div>

        {/* Alerts */}
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
        {successMessage && (
          <div
            className="mb-6 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#16a34a",
            }}
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {successMessage}
          </div>
        )}

        {/* ── FILTERS ─────────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl px-5 py-4 mb-5 flex items-center gap-4 shadow-sm"
          style={{ border: "1px solid #e2e8f0" }}
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#94a3b8" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#94a3b8" }}
          >
            Filter
          </span>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-150 appearance-none pr-8"
            style={{
              border: "1px solid #e2e8f0",
              background: "#f8fafc",
              color: "#475569",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
              backgroundSize: "14px",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid #3B5CD4";
              e.target.style.background = "#fff";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid #e2e8f0";
              e.target.style.background = "#f8fafc";
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Active filter pill */}
          {statusFilter && (
            <span
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
              style={{
                background:
                  statusFilter === "completed"
                    ? "rgba(51,184,51,0.1)"
                    : statusFilter === "cancelled"
                      ? "rgba(239,68,68,0.1)"
                      : "rgba(245,158,11,0.1)",
                color:
                  statusFilter === "completed"
                    ? "#16a34a"
                    : statusFilter === "cancelled"
                      ? "#dc2626"
                      : "#b45309",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:
                    statusFilter === "completed"
                      ? "#33B833"
                      : statusFilter === "cancelled"
                        ? "#ef4444"
                        : "#f59e0b",
                }}
              />
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </span>
          )}
        </div>

        {/* ── TABLE ───────────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ border: "1px solid #e2e8f0" }}
        >
          {sales.length === 0 ? (
            <div className="py-16 text-center">
              <svg
                className="w-10 h-10 mx-auto mb-3"
                style={{ color: "#cbd5e1" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
                No sales found
              </p>
              <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>
                Try adjusting the filter or create a new sale
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#94a3b8" }}
                  >
                    Date
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#94a3b8" }}
                  >
                    Customer
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#94a3b8" }}
                  >
                    Email
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#94a3b8" }}
                  >
                    Total
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#94a3b8" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#94a3b8" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => {
                  const date = sale.createdAt ? new Date(sale.createdAt) : null;
                  const formattedDate = date ? date.toLocaleDateString() : "—";

                  // Status badge styles
                  const statusStyles = {
                    completed: {
                      bg: "rgba(51,184,51,0.1)",
                      color: "#16a34a",
                      dot: "#33B833",
                    },
                    cancelled: {
                      bg: "rgba(239,68,68,0.1)",
                      color: "#dc2626",
                      dot: "#ef4444",
                    },
                    pending: {
                      bg: "rgba(245,158,11,0.1)",
                      color: "#b45309",
                      dot: "#f59e0b",
                    },
                  };
                  const badge =
                    statusStyles[sale.status] || statusStyles.pending;

                  return (
                    <tr
                      key={sale._id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafbff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Date */}
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: "#64748b" }}
                      >
                        {formattedDate}
                      </td>

                      {/* Customer name */}
                      <td
                        className="px-4 py-4 text-sm font-medium"
                        style={{ color: "#1e293b" }}
                      >
                        {sale.customerName}
                      </td>

                      {/* Email */}
                      <td
                        className="px-4 py-4 text-sm"
                        style={{ color: "#64748b" }}
                      >
                        {sale.customerEmail}
                      </td>

                      {/* Total */}
                      <td
                        className="px-4 py-4 text-sm font-semibold text-right"
                        style={{ color: "#1e293b" }}
                      >
                        ${Number(sale.totalAmount || 0).toFixed(2)}
                      </td>

                      {/* Status badge + inline editor */}
                      <td className="px-4 py-4">
                        {/* Badge */}
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: badge.dot }}
                          />
                          {sale.status.charAt(0).toUpperCase() +
                            sale.status.slice(1)}
                        </span>
                        {/* Inline editor */}
                        <div className="flex items-center gap-1.5">
                          <select
                            value={editingStatus[sale._id] || sale.status}
                            onChange={(e) =>
                              handleSaleStatusChange(sale._id, e.target.value)
                            }
                            className="rounded-lg px-2 py-1 text-xs focus:outline-none transition-all duration-150 appearance-none"
                            style={{
                              border: "1px solid #e2e8f0",
                              background: "#f8fafc",
                              color: "#475569",
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "right 6px center",
                              backgroundSize: "12px",
                              paddingRight: "22px",
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleSaveSaleStatus(sale)}
                            disabled={savingStatusId === sale._id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-all duration-150"
                            style={{
                              background:
                                savingStatusId === sale._id
                                  ? "#93c5fd"
                                  : "#3B5CD4",
                            }}
                            onMouseEnter={(e) => {
                              if (savingStatusId !== sale._id)
                                e.currentTarget.style.background = "#2d4ab0";
                            }}
                            onMouseLeave={(e) => {
                              if (savingStatusId !== sale._id)
                                e.currentTarget.style.background = "#3B5CD4";
                            }}
                          >
                            {savingStatusId === sale._id ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </td>

                      {/* Create invoice */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleCreateInvoice(sale._id)}
                          disabled={creatingInvoiceId === sale._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                          style={{
                            background:
                              creatingInvoiceId === sale._id
                                ? "rgba(58,150,212,0.1)"
                                : "rgba(58,150,212,0.12)",
                            color: "#3A96D4",
                            border: "1px solid rgba(58,150,212,0.25)",
                          }}
                          onMouseEnter={(e) => {
                            if (creatingInvoiceId !== sale._id) {
                              e.currentTarget.style.background =
                                "rgba(58,150,212,0.22)";
                              e.currentTarget.style.borderColor =
                                "rgba(58,150,212,0.5)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (creatingInvoiceId !== sale._id) {
                              e.currentTarget.style.background =
                                "rgba(58,150,212,0.12)";
                              e.currentTarget.style.borderColor =
                                "rgba(58,150,212,0.25)";
                            }
                          }}
                        >
                          {creatingInvoiceId === sale._id ? (
                            <>
                              <svg
                                className="w-3 h-3 animate-spin"
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
                              Creating…
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3 h-3"
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
                              Create Invoice
                            </>
                          )}
                        </button>
                        {/* Delete sale button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteSale(sale)}
                          disabled={deletingId === sale._id}
                          className="inline-flex items-center ml-2 gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                          style={{
                            background:
                              deletingId === sale._id
                                ? "rgba(239,68,68,0.07)"
                                : "rgba(239,68,68,0.08)",
                            color: "#dc2626",
                            border: "1px solid rgba(239,68,68,0.3)",
                          }}
                          onMouseEnter={(e) => {
                            if (deletingId !== sale._id) {
                              e.currentTarget.style.background =
                                "rgba(239,68,68,0.18)";
                              e.currentTarget.style.borderColor =
                                "rgba(239,68,68,0.6)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (deletingId !== sale._id) {
                              e.currentTarget.style.background =
                                "rgba(239,68,68,0.08)";
                              e.currentTarget.style.borderColor =
                                "rgba(239,68,68,0.3)";
                            }
                          }}
                        >
                          {deletingId === sale._id ? (
                            <>
                              <svg
                                className="w-3 h-3 animate-spin"
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
                              Deleting…
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-3h4m-7 3h10"
                                />
                              </svg>
                              Delete
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── PAGINATION ──────────────────────────────────────────────────── */}
        {pagination.totalPages > 1 && (
          <div className="mt-5 flex justify-between items-center">
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                }}
                onMouseEnter={(e) => {
                  if (pagination.currentPage > 1) {
                    e.currentTarget.style.borderColor = "#3B5CD4";
                    e.currentTarget.style.color = "#3B5CD4";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "#475569";
                }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Prev
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150"
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                }}
                onMouseEnter={(e) => {
                  if (pagination.currentPage < pagination.totalPages) {
                    e.currentTarget.style.borderColor = "#3B5CD4";
                    e.currentTarget.style.color = "#3B5CD4";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "#475569";
                }}
              >
                Next
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

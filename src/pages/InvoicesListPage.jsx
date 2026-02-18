import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { invoiceApi } from "../api/invoiceApi";

/**
 * InvoicesListPage
 *
 * PURPOSE:
 * - Show list of invoices (admin)
 * - Filter by status (draft/sent/paid/overdue/cancelled)
 * - Download invoice PDF
 */
export default function InvoicesListPage() {
  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({
    totalInvoices: 0,
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // '' = All
  const [downloadingId, setDownloadingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingStatus, setEditingStatus] = useState({});
  const [savingStatusId, setSavingStatusId] = useState();
  const [editingPaymentMethod, setEditingPaymentMethod] = useState({});
  const [deletingId, setDeletingId] = useState(null);

  //fetch invoices from API
  const fetchInvoices = async (page = 1) => {
    try {
      setError("");
      setLoading(true);

      const params = { page, limit: 10 };
      // backend getInvoices doesn't use status yet, so we won't pass it here

      const res = await invoiceApi.getInvoices(params);
      // expected: { invoices, pagination: { totalInvoices, currentPage, totalPages } }
      const data = res.data;

      const list = data.invoices || [];
      setInvoices(list);
      setPagination(
        data.pagination || {
          totalInvoices: 0,
          currentPage: 1,
          totalPages: 1,
        },
      );

      // init editingStatus & payment method
      const initialStatus = {};
      const initialPaymentMethod = {};
      list.forEach((inv) => {
        initialStatus[inv._id] = inv.status;
        initialPaymentMethod[inv._id] = inv.editingPaymentMethod;
      });
      setEditingStatus(initialStatus);
      setEditingPaymentMethod(initialPaymentMethod);
    } catch (err) {
      console.error("Error fetching invoices:", err);
      const msg = err.response?.data?.message || "Failed to load invoices";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
  }, []);

  // Handlers //
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleStatusSelectChange = (invoiceId, newStatus) => {
    setEditingStatus((prev) => ({
      ...prev,
      [invoiceId]: newStatus,
    }));
  };

  const handlePaymentMethodChange = (invoiceId, method) => {
    setEditingPaymentMethod((prev) => ({
      ...prev,
      [invoiceId]: method,
    }));
  };

  const handleSaveStatus = async (invoice) => {
    const newStatus = editingStatus[invoice._id];
    if (!newStatus || newStatus === invoice.status) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      setSavingStatusId(invoice._id);

      const payload = { status: newStatus };

      // If marking as paid, also send paymentDate + paymentMethod
      if (newStatus === "paid") {
        const method =
          editingPaymentMethod[invoice._id] || invoice.paymentMethod || "cash";
        payload.paymentMethod = method;
        payload.paymentDate = new Date().toISOString();
      }

      await invoiceApi.updateInvoice(invoice._id, payload);

      // Backend returns only { message }, so refetch invoices to be safe
      await fetchInvoices(pagination.currentPage);
      setSuccessMessage("Invoice status updated.");
    } catch (err) {
      console.error("Error updating invoice status:", err);
      const msg =
        err.response?.data?.message || "Failed to update invoice status.";
      setError(msg);
    } finally {
      setSavingStatusId(null);
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    const confirmed = window.confirm(
      `Delete invoice ${invoice.invoiceNumber}? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");
      setDeletingId(invoice._id);

      await invoiceApi.deleteInvoice(invoice._id);

      // Refresh list on current page
      await fetchInvoices(pagination.currentPage);
      setSuccessMessage("Invoice deleted successfully.");
    } catch (err) {
      console.error("Error deleting invoice:", err);
      const msg = err.response?.data?.message || "Failed to delete invoice.";
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > (pagination.totalPages || 1)) return;
    fetchInvoices(newPage);
  };

  const handleDownloadPdf = async (invoice) => {
    try {
      setError("");
      setSuccessMessage("");
      setDownloadingId(invoice._id);

      const response = await invoiceApi.downloadInvoicePdf(invoice._id);

      // Create a blob from the PDF stream
      const blob = new Blob([response.data], {
        type: "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary <a> element to trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download =
        (invoice.invoiceNumber || `invoice-${invoice._id}`) + ".pdf";
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage("Invoice PDF download started.");
    } catch (err) {
      console.error("Error downloading invoice PDF:", err);
      const msg =
        err.response?.data?.message || "Failed to download invoice PDF.";
      setError(msg);
    } finally {
      setDownloadingId(null);
    }
  };

  //filter invoices //
  const visibleInvoices = statusFilter
    ? invoices.filter((inv) => inv.status === statusFilter)
    : invoices;

  // Render //
  if (loading && invoices.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-sm">Loading invoices...</div>
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
              Invoices
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
              {visibleInvoices.length} invoice
              {visibleInvoices.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <Link
            to="/sales"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              color: "#475569",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3B5CD4";
              e.currentTarget.style.color = "#3B5CD4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.color = "#475569";
            }}
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
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            View Sales
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
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Active filter pill */}
          {statusFilter &&
            (() => {
              const filterStyles = {
                paid: {
                  bg: "rgba(51,184,51,0.1)",
                  color: "#16a34a",
                  dot: "#33B833",
                },
                cancelled: {
                  bg: "rgba(239,68,68,0.1)",
                  color: "#dc2626",
                  dot: "#ef4444",
                },
                overdue: {
                  bg: "rgba(234,88,12,0.1)",
                  color: "#c2410c",
                  dot: "#f97316",
                },
                sent: {
                  bg: "rgba(59,92,212,0.1)",
                  color: "#3B5CD4",
                  dot: "#3B5CD4",
                },
                draft: {
                  bg: "rgba(100,116,139,0.1)",
                  color: "#475569",
                  dot: "#94a3b8",
                },
              };
              const s = filterStyles[statusFilter] || filterStyles.draft;
              return (
                <span
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                  style={{ background: s.bg, color: s.color }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: s.dot }}
                  />
                  {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                </span>
              );
            })()}
        </div>

        {/* ── TABLE ───────────────────────────────────────────────────────── */}
        <div
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          style={{ border: "1px solid #e2e8f0" }}
        >
          {visibleInvoices.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm font-medium" style={{ color: "#94a3b8" }}>
                No invoices found
              </p>
              <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>
                Try adjusting the filter or create an invoice from a completed
                sale
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
                    Invoice #
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
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#94a3b8" }}
                  >
                    Created
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
                {visibleInvoices.map((inv) => {
                  const date = inv.createdAt ? new Date(inv.createdAt) : null;
                  const formattedDate = date ? date.toLocaleDateString() : "—";

                  // 5-status badge map
                  const statusStyles = {
                    paid: {
                      bg: "rgba(51,184,51,0.1)",
                      color: "#16a34a",
                      dot: "#33B833",
                    },
                    cancelled: {
                      bg: "rgba(239,68,68,0.1)",
                      color: "#dc2626",
                      dot: "#ef4444",
                    },
                    overdue: {
                      bg: "rgba(234,88,12,0.1)",
                      color: "#c2410c",
                      dot: "#f97316",
                    },
                    sent: {
                      bg: "rgba(59,92,212,0.1)",
                      color: "#3B5CD4",
                      dot: "#3B5CD4",
                    },
                    draft: {
                      bg: "rgba(100,116,139,0.1)",
                      color: "#475569",
                      dot: "#94a3b8",
                    },
                  };
                  const badge = statusStyles[inv.status] || statusStyles.draft;

                  return (
                    <tr
                      key={inv._id}
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafbff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Invoice number */}
                      <td
                        className="px-6 py-4 text-sm font-mono font-medium"
                        style={{ color: "#3B5CD4" }}
                      >
                        {inv.invoiceNumber}
                      </td>

                      {/* Customer */}
                      <td
                        className="px-4 py-4 text-sm font-medium"
                        style={{ color: "#1e293b" }}
                      >
                        {inv.customerName}
                      </td>

                      {/* Email */}
                      <td
                        className="px-4 py-4 text-sm"
                        style={{ color: "#64748b" }}
                      >
                        {inv.customerEmail}
                      </td>

                      {/* Total */}
                      <td
                        className="px-4 py-4 text-sm font-semibold text-right"
                        style={{ color: "#1e293b" }}
                      >
                        ${Number(inv.totalAmount || 0).toFixed(2)}
                      </td>

                      {/* Status badge + editor */}
                      <td className="px-4 py-4" style={{ minWidth: "200px" }}>
                        {/* Badge */}
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: badge.dot }}
                          />
                          {inv.status.charAt(0).toUpperCase() +
                            inv.status.slice(1)}
                        </span>

                        {/* Status editor */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <select
                            value={editingStatus[inv._id] || inv.status}
                            onChange={(e) =>
                              handleStatusSelectChange(inv._id, e.target.value)
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
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleSaveStatus(inv)}
                            disabled={savingStatusId === inv._id}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-white transition-all duration-150"
                            style={{
                              background:
                                savingStatusId === inv._id
                                  ? "#93c5fd"
                                  : "#3B5CD4",
                            }}
                            onMouseEnter={(e) => {
                              if (savingStatusId !== inv._id)
                                e.currentTarget.style.background = "#2d4ab0";
                            }}
                            onMouseLeave={(e) => {
                              if (savingStatusId !== inv._id)
                                e.currentTarget.style.background = "#3B5CD4";
                            }}
                          >
                            {savingStatusId === inv._id ? "Saving…" : "Save"}
                          </button>
                        </div>

                        {/* Payment method — only when status is 'paid' */}
                        {(editingStatus[inv._id] || inv.status) === "paid" && (
                          <div
                            className="flex items-center gap-2 mt-1.5 pt-1.5"
                            style={{ borderTop: "1px dashed #e2e8f0" }}
                          >
                            <span
                              className="text-xs"
                              style={{ color: "#94a3b8" }}
                            >
                              Payment:
                            </span>
                            <select
                              value={editingPaymentMethod[inv._id] || ""}
                              onChange={(e) =>
                                handlePaymentMethodChange(
                                  inv._id,
                                  e.target.value,
                                )
                              }
                              className="rounded-lg px-2 py-1 text-xs focus:outline-none transition-all duration-150 appearance-none"
                              style={{
                                border: "1px solid #bbf7d0",
                                background: "#f0fdf4",
                                color: "#16a34a",
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2316a34a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 6px center",
                                backgroundSize: "12px",
                                paddingRight: "22px",
                              }}
                            >
                              <option value="">Select…</option>
                              <option value="cash">Cash</option>
                              <option value="credit_card">Credit Card</option>
                              <option value="bank_transfer">
                                Bank Transfer
                              </option>
                              <option value="check">Check</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        )}

                        {/* Existing payment info */}
                        {inv.paymentDate && (
                          <p
                            className="mt-1.5 text-xs flex items-center gap-1"
                            style={{ color: "#94a3b8" }}
                          >
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Paid{" "}
                            {new Date(inv.paymentDate).toLocaleDateString()} ·{" "}
                            {inv.paymentMethod || "unknown"}
                          </p>
                        )}
                      </td>

                      {/* Created date */}
                      <td
                        className="px-4 py-4 text-sm"
                        style={{ color: "#64748b" }}
                      >
                        {formattedDate}
                      </td>

                      {/* Download PDF */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(inv)}
                          disabled={downloadingId === inv._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                          style={{
                            background:
                              downloadingId === inv._id
                                ? "rgba(51,184,51,0.07)"
                                : "rgba(51,184,51,0.1)",
                            color: "#16a34a",
                            border: "1px solid rgba(51,184,51,0.25)",
                          }}
                          onMouseEnter={(e) => {
                            if (downloadingId !== inv._id) {
                              e.currentTarget.style.background =
                                "rgba(51,184,51,0.2)";
                              e.currentTarget.style.borderColor =
                                "rgba(51,184,51,0.45)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (downloadingId !== inv._id) {
                              e.currentTarget.style.background =
                                "rgba(51,184,51,0.1)";
                              e.currentTarget.style.borderColor =
                                "rgba(51,184,51,0.25)";
                            }
                          }}
                        >
                          {downloadingId === inv._id ? (
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
                              Downloading…
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
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                              </svg>
                              Download PDF
                            </>
                          )}
                        </button>
                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteInvoice(inv)}
                          disabled={deletingId === inv._id}
                          className="inline-flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                          style={{
                            background:
                              deletingId === inv._id
                                ? "rgba(239,68,68,0.07)"
                                : "rgba(239,68,68,0.08)",
                            color: "#dc2626",
                            border: "1px solid rgba(239,68,68,0.3)",
                          }}
                          onMouseEnter={(e) => {
                            if (deletingId !== inv._id) {
                              e.currentTarget.style.background =
                                "rgba(239,68,68,0.18)";
                              e.currentTarget.style.borderColor =
                                "rgba(239,68,68,0.6)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (deletingId !== inv._id) {
                              e.currentTarget.style.background =
                                "rgba(239,68,68,0.08)";
                              e.currentTarget.style.borderColor =
                                "rgba(239,68,68,0.3)";
                            }
                          }}
                        >
                          {deletingId === inv._id ? (
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

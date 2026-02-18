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
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Invoices</h1>
        <div className="flex gap-3">
          <Link
            to="/sales"
            className="px-3 py-1 text-xs rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
          >
            Sales
          </Link>
          <Link
            to="/"
            className="px-3 py-1 text-xs rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Alerts */}
      {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
      {successMessage && (
        <div className="mb-3 text-sm text-green-600">{successMessage}</div>
      )}

      {/* Filters */}
      <section className="mb-4 flex gap-3 items-center">
        <label className="text-xs text-slate-500">Status</label>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="border border-slate-300 rounded px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </section>

      {/* Invoices table */}
      <section className="bg-white rounded-lg shadow overflow-hidden">
        {visibleInvoices.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No invoices found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-700">
                  Invoice #
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">
                  Customer
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">
                  Email
                </th>
                <th className="text-right px-4 py-3 font-medium text-slate-700">
                  Total
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-700">
                  Created
                </th>
                <th className="text-center px-4 py-3 font-medium text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleInvoices.map((inv) => {
                const date = inv.createdAt ? new Date(inv.createdAt) : null;
                const formattedDate = date ? date.toLocaleDateString() : "-";

                return (
                  <tr key={inv._id} className="border-b">
                    <td className="px-4 py-3 text-slate-800">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {inv.customerName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {inv.customerEmail}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-800">
                      ${Number(inv.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {/* Badge */}
                      <div className="mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            inv.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : inv.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : inv.status === "overdue"
                                  ? "bg-orange-100 text-orange-700"
                                  : inv.status === "sent"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>

                      {/* Editor */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <select
                            value={editingStatus[inv._id] || inv.status}
                            onChange={(e) =>
                              handleStatusSelectChange(inv._id, e.target.value)
                            }
                            className="border border-slate-300 rounded px-1 py-0.5 text-[11px]"
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
                            className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50"
                          >
                            {savingStatusId === inv._id ? "Saving…" : "Save"}
                          </button>
                        </div>

                        {/* Show payment method selector only when new status is 'paid' */}
                        {(editingStatus[inv._id] || inv.status) === "paid" && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">
                              Payment method:
                            </span>
                            <select
                              value={editingPaymentMethod[inv._id] || ""}
                              onChange={(e) =>
                                handlePaymentMethodChange(
                                  inv._id,
                                  e.target.value,
                                )
                              }
                              className="border border-slate-300 rounded px-1 py-0.5 text-[11px]"
                            >
                              <option value="">Select</option>
                              <option value="cash">Cash</option>
                              <option value="credit_card">Credit card</option>
                              <option value="bank_transfer">
                                Bank transfer
                              </option>
                              <option value="check">Check</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        )}

                        {/* Optional: show existing payment info */}
                        {inv.paymentDate && (
                          <div className="text-[10px] text-slate-500">
                            Paid on{" "}
                            {new Date(inv.paymentDate).toLocaleDateString()} by{" "}
                            {inv.paymentMethod || "unknown"}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formattedDate}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(inv)}
                        disabled={downloadingId === inv._id}
                        className="text-xs px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50"
                      >
                        {downloadingId === inv._id
                          ? "Downloading..."
                          : "Download PDF"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Optional: pagination controls if backend supports it */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-end items-center gap-3 text-xs text-slate-600">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

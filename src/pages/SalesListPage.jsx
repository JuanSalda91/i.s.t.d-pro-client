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
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-800">Sales</h1>
        <div className="flex gap-3">
          <Link
            to="/sales/new"
            className="px-3 py-1 text-xs rounded bg-slate-800 text-white hover:bg-slate-900"
          >
            New sale
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
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </section>

      {/* Sales table */}
      <section className="bg-white rounded-lg shadow overflow-hidden">
        {sales.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">
            No sales found.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-700">
                  Date
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
                <th className="text-center px-4 py-3 font-medium text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const date = sale.createdAt ? new Date(sale.createdAt) : null;
                const formattedDate = date ? date.toLocaleDateString() : "-";

                return (
                  <tr key={sale._id} className="border-b">
                    <td className="px-4 py-3 text-slate-800">
                      {formattedDate}
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      {sale.customerName}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {sale.customerEmail}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-800">
                      ${Number(sale.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {/* Badge */}
                      <div className="mb-1">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            sale.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : sale.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700" // pending
                          }`}
                        >
                          {sale.status}
                        </span>
                      </div>

                      {/* Editor */}
                      <div className="flex items-center gap-1">
                        <select
                          value={editingStatus[sale._id] || sale.status}
                          onChange={(e) =>
                            handleSaleStatusChange(sale._id, e.target.value)
                          }
                          className="border border-slate-300 rounded px-1 py-0.5 text-[11px]"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleSaveSaleStatus(sale)}
                          disabled={savingStatusId === sale._id}
                          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50"
                        >
                          {savingStatusId === sale._id ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleCreateInvoice(sale._id)}
                        disabled={creatingInvoiceId === sale._id}
                        className="text-xs px-2 py-1 rounded bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50"
                      >
                        {creatingInvoiceId === sale._id
                          ? "Creating..."
                          : "Create invoice"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Simple pagination controls (optional) */}
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

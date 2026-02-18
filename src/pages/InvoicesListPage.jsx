import { useEffec, useState } from 'react';
import { Link } from 'react-router-dom';
import { invoiceApi } from '../api/invoiceApi';

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
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState(''); // '' = All
    const [downloadingId, setDownloadingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    //fetch invoices from API
    const fetchInvoices = async (page = 1) => {
        try {
          setError('');
          setLoading(true);
    
          const params = { page, limit: 10 };
          // backend getInvoices doesn't use status yet, so we won't pass it here
    
          const res = await invoiceApi.getInvoices(params);
          // expected: { invoices, pagination: { totalInvoices, currentPage, totalPages } }
          const data = res.data;
    
          setInvoices(data.invoices || []);
          setPagination(
            data.pagination || {
              totalInvoices: 0,
              currentPage: 1,
              totalPages: 1,
            }
          );
        } catch (err) {
          console.error('Error fetching invoices:', err);
          const msg =
            err.response?.data?.message || 'Failed to load invoices';
          setError(msg);
        } finally {
          setLoading(false);
        }
      };
    
      useEffect(() => {
        fetchInvoices(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

      // Handlers //
      const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
      };
    
      const handlePageChange = (newPage) => {
        if (
          newPage < 1 ||
          newPage > (pagination.totalPages || 1)
        )
          return;
        fetchInvoices(newPage);
      };
    
      const handleDownloadPdf = async (invoice) => {
        try {
          setError('');
          setSuccessMessage('');
          setDownloadingId(invoice._id);
    
          const response = await invoiceApi.downloadInvoicePdf(
            invoice._id
          );
    
          // Create a blob from the PDF stream
          const blob = new Blob([response.data], {
            type: 'application/pdf',
          });
          const url = window.URL.createObjectURL(blob);
    
          // Create a temporary <a> element to trigger download
          const link = document.createElement('a');
          link.href = url;
          link.download =
            (invoice.invoiceNumber || `invoice-${invoice._id}`) +
            '.pdf';
          document.body.appendChild(link);
          link.click();
    
          // Cleanup
          link.remove();
          window.URL.revokeObjectURL(url);
    
          setSuccessMessage('Invoice PDF download started.');
        } catch (err) {
          console.error('Error downloading invoice PDF:', err);
          const msg =
            err.response?.data?.message ||
            'Failed to download invoice PDF.';
          setError(msg);
        } finally {
          setDownloadingId(null);
        }
      };

      //filter invoices //
      const visibleInvoices = statusFilter
      ? invoices.filter((inv) => inv.status === statusFilter)
      : invoices;
  
    // ==========================
    // Render
    // ==========================
    if (loading && invoices.length === 0) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-slate-600 text-sm">
            Loading invoices...
          </div>
        </div>
      );
    }
};
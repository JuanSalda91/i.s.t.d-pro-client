import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { salesApi } from '../api/salesApi.js';
import { invoiceApi } from '../api/invoiceApi.js';

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
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [creatingInvoiceId, setCreatingInvoiceId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // Fetch sales from API //
    const fetchSales = async (page = 1) => {
        try {
            setError('');
            setLoading(true);

            const params = { page, limit: 10 };
            if (statusFilter) params.status = statusFilter;

            const res = await salesApi.getSales(params);
            //backend: { sales, pagination: { totalSales, currentPage, totalPages } }
            setSales(res.data.sales || []);
            setPagination(res.data.pagination || pagination);
        } catch (err) {
            console.error('Error fetching sales:', err);
            const msg = 
            err.response?.data?message || 'Failed to load sales';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    //load on mount + when status filter changes
    useEffect(() => {
        fetchSales(1);
    }, [statusFilter]);

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
          setError('');
          setSuccessMessage('');
          setCreatingInvoiceId(saleId);
    
          // For now we only send saleId; taxPercentage/notes optional
          await invoiceApi.createInvoiceFromSale({ saleId });
    
          setSuccessMessage('Invoice created successfully from sale.');
        } catch (err) {
          console.error('Error creating invoice from sale:', err);
          const msg =
            err.response?.data?.message ||
            'Failed to create invoice from sale.';
          setError(msg);
        } finally {
          setCreatingInvoiceId(null);
        }
      };
};
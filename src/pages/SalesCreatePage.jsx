import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { salesApi } from '../api/salesApi.js';
import { productApi } from '../api/productApi.js';

/**
 * SalesCreatePage
 * 
 * - Create new sale document in backend
 * - let user pick products, quantities, tax
 * - backend will:
 *  -validate items
 *  - deduct stock
 *  - calculate subtotal/tax/total via pre-save hook
 */
export default function SalesCreatePage() {
    const navigate = useNavigate();

    //customer + tax fields
    const [customer, setCustomer] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        taxPercentage: 0,
    });

    // items: each item = { productId, quantity, unitPrice }
    const [items, setItems] = useState([
        { productId: '', quantity: 1, unitPrice: 0 },
    ]);

    //products list for dropdown
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    //ui/validation state
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Load Products //
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setError('');
                setLoadingProducts(true);

                //reuse getProducts without filter
                const res = await productApi.getProducts({});
                setProducts(res.data.data || []);
            } catch (err) {
                console.error('Error fetching products for sale', err);
                const msg =
                err.response?.data?.message || 'Failed to load products';
                setError(msg);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);
};
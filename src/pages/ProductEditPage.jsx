import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productApi } from '../api/productApi';

/**
 * ProductEditPage
 * 
 * Edit an existing product
 * - fetch product by ID from backend
 * - pre-fill form with exisiting values
 * - allow user to update and save changes
 */
export default function ProductEditPage() {
    const { id } = useParams(); //product id from URL
    const navigate = useNavigate();

    const [form, setForm] = useState({
        sku: '',
        name: '',
        description: '',
        category: '',
        price: '',
        cost: '',
        stock: '',
        minStock: '',
        supplier: '',
    });

    const [loading, setLoading] = useState(true); //loading product
    const [saving, setSaving] = useState(false); //saving changes
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [errors, setErrors] = useState({});

    //fetch products
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setError('');
                setLoading(true);
                const res = await productApi.getProductById(id);
                const p = res.data.data; //{ succes, data: product }

                setForm({
                    sku: p.sku || '',
                    name: p.name || '',
                    description: p.description || '',
                    category: p.category || '',
                    price: p.price || '',
                    cost: p.cost || '',
                    stock: p.stock || '',
                    minStock: p.minStock || '',
                    supplier: p.supplier || '',
                });
            } catch (err) {
                console.error('Error fetching product:', err);
                const msg =
                err.response?.data?.message || 'Failer to load product';
                setError(msg);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

};
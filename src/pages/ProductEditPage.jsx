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

    //Handlers
    const handleChange = (e) => {
        const { name, value } = e.targer;
        setForm((prev) => ({ ...prev, [name]: value}));
    };

    const validate = () => {
        const newErrors = {};

        if (!form.sku.trim()) newErrors.sku = 'SKU is required';
        if (!form.name.trim()) newErrors.name = 'Name is required';

        if (form.price === '' || isNaN(Number(form.price))) {
            newErrors.price = 'Price is required';
        } else if (Number(form.price) < 0) {
            newErrors.price = 'Price cannot be negative';
        }

        if (form.cost === '' || isNaN(Number(form.cost))) {
            newErrors.cost = 'Cost is required';
        } else if (Number(form.cost) < 0) {
            newErrors.cost = 'Cost cannot be negative';
        }

        if (form.stock === '' || isNaN(Number(form.stock))) {
            newErrors.stock = 'Stock is required';
        } else if (Number(form.stock) < 0) {
            newErrors.stock = 'Stock cannot be negative';
        }

        if (form.minStock !== '' && Number(form.minStock) < 0) {
            newErrors.minStock = 'Min stock cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    

};
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi.js';

/**
 * ProductListPage
 * 
 * Display all product in a searchable, filtrable table
 * 
 * Features:
 * - Search by product name or SKU
 * - Filter by category
 * - Highlight low-stock products
 * - Links to create-edit products
 */
export default function ProductsListPage() {
    const navigate = useNavigate();

    // State
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    //fetch products from the backend
    const fetchProducts = async () => {
        try {
            setError('');
            setLoading(true);

            const params = {};
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (categoryFilter) params.category = categoryFilter;

            const res = await productApi.getProducts(params);

            setProducts(res.data.data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            const msg = err.response?.data?.message || 'Failed to load products';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };
};
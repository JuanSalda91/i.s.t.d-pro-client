import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    const [deleting, setDeleting] = useState(false);

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
        const { name, value } = e.target;
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!validate()) return;

        setSaving(true);
        try {
            const payload = {
                sku: form.sku.toUpperCase(),
                name: form.name.trim(),
                description: form.description || '',
                category: form.category || 'Others',
                price: Number(form.price),
                cost: Number(form.cost),
                stock: Number(form.stock),
                minStock: form.minStock === '' ? 10 : Number(form.minStock),
                supplier: form.supplier || '',
            };

            await productApi.updateProduct(id, payload);

            setSuccess('Product updated successfully');
            setErrors({});
            setTimeout(() => navigate('/products'), 800);
        } catch (err) {
            const backendMessage = err.response?.data?.message;

            if ( backendMessage && backendMessage.toLowerCase().includes('sku') ) {
                setErrors((prev) => ({ ...prev, sku: backendMessage }));
            } else {
                setError(backendMessage || 'Failed to update product');
            }
        } finally {
            setSaving(false);
        }
    };

const handleDelete = async () => {
  const confirmed = window.confirm(
    `Are you sure you want to delete "${form.name}"? This action cannot be undone.`
  );
  if (!confirmed) return;

  setDeleting(true);
  setError('');
  try {
    await productApi.deleteProduct(id);
    navigate('/products');
  } catch (err) {
    console.error('Error deleting product:', err);
    setError(err.response?.data?.message || 'Failed to delete product');
    setDeleting(false);
  }
};
    

    // Loading state
    if (loading) {
        return (
          <div className="min-h-screen flex items-center justify-center" style={{ background: '#f1f5f9' }}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 animate-spin" style={{ color: '#3B5CD4' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: '#64748b' }}>Loading products…</span>
            </div>
          </div>
        );
      }

return (
    <div className="min-h-screen flex" style={{ background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 p-8 overflow-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1e293b' }}>Edit Product</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
              Update the details for <span className="font-semibold" style={{ color: '#3B5CD4' }}>{form.name || 'this product'}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B5CD4'; e.currentTarget.style.color = '#3B5CD4'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 max-w-3xl">

            {/* ── PRODUCT IDENTITY ──────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
              <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: '#f1f5f9', background: '#fafbff' }}>
                <svg className="w-4 h-4" style={{ color: '#3B5CD4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h2 className="text-sm font-semibold" style={{ color: '#1e293b' }}>Product Identity</h2>
              </div>
              <div className="p-6 grid gap-5 md:grid-cols-2">

                {/* SKU */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                    SKU <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="e.g. PROD-001"
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-mono transition-all duration-150 focus:outline-none"
                    style={{
                      border: errors.sku ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                      background: errors.sku ? '#fef2f2' : '#f8fafc',
                      color: '#1e293b',
                    }}
                    onFocus={e => { if (!errors.sku) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                    onBlur={e => { if (!errors.sku) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                  />
                  {errors.sku && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.sku}
                    </p>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                    Product Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Wireless Keyboard"
                    className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-150 focus:outline-none"
                    style={{
                      border: errors.name ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                      background: errors.name ? '#fef2f2' : '#f8fafc',
                      color: '#1e293b',
                    }}
                    onFocus={e => { if (!errors.name) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                    onBlur={e => { if (!errors.name) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-150 focus:outline-none appearance-none"
                    style={{
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: form.category ? '#1e293b' : '#94a3b8',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center',
                      backgroundSize: '14px',
                      paddingRight: '36px',
                    }}
                    onFocus={e => { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; }}>
                    <option value="">Select category</option>
                    <option>Electronics</option>
                    <option>Clothing</option>
                    <option>Food</option>
                    <option>Home</option>
                    <option>Others</option>
                  </select>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                    Supplier <span style={{ color: '#cbd5e1', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-150 focus:outline-none"
                    style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
                    onFocus={e => { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; }}
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                    Description <span style={{ color: '#cbd5e1', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Brief product description…"
                    rows={3}
                    className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-150 focus:outline-none resize-none"
                    style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
                    onFocus={e => { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; }}
                    onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; }}
                  />
                </div>
              </div>
            </div>

            {/* ── PRICING ───────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
              <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: '#f1f5f9', background: '#fafbff' }}>
                <svg className="w-4 h-4" style={{ color: '#3B5CD4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-sm font-semibold" style={{ color: '#1e293b' }}>Pricing</h2>
              </div>
              <div className="p-6 grid gap-5 md:grid-cols-2">

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                    Sale Price ($) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#94a3b8' }}>$</span>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full rounded-xl pl-8 pr-4 py-2.5 text-sm transition-all duration-150 focus:outline-none"
                      style={{
                        border: errors.price ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                        background: errors.price ? '#fef2f2' : '#f8fafc',
                        color: '#1e293b',
                      }}
                      onFocus={e => { if (!errors.price) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                      onBlur={e => { if (!errors.price) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.price}
                    </p>
                  )}
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                    Cost Price ($) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: '#94a3b8' }}>$</span>
                    <input
                      name="cost"
                      type="number"
                      step="0.01"
                      value={form.cost}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full rounded-xl pl-8 pr-4 py-2.5 text-sm transition-all duration-150 focus:outline-none"
                      style={{
                        border: errors.cost ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                        background: errors.cost ? '#fef2f2' : '#f8fafc',
                        color: '#1e293b',
                      }}
                      onFocus={e => { if (!errors.cost) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                      onBlur={e => { if (!errors.cost) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                    />
                  </div>
                  {errors.cost && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.cost}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── STOCK ─────────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
              <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: '#f1f5f9', background: '#fafbff' }}>
                <svg className="w-4 h-4" style={{ color: '#3B5CD4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h2 className="text-sm font-semibold" style={{ color: '#1e293b' }}>Stock Levels</h2>
              </div>
              <div className="p-6 grid gap-5 md:grid-cols-2">

                {/* Stock */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                    Current Stock <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    name="stock"
                    type="number"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-150 focus:outline-none"
                    style={{
                      border: errors.stock ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                      background: errors.stock ? '#fef2f2' : '#f8fafc',
                      color: '#1e293b',
                    }}
                    onFocus={e => { if (!errors.stock) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                    onBlur={e => { if (!errors.stock) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                  />
                  {errors.stock && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.stock}
                    </p>
                  )}
                </div>

                {/* Min stock */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                    Minimum Stock <span style={{ color: '#cbd5e1', fontWeight: 400 }}>(low stock alert)</span>
                  </label>
                  <input
                    name="minStock"
                    type="number"
                    value={form.minStock}
                    onChange={handleChange}
                    placeholder="5"
                    className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-150 focus:outline-none"
                    style={{
                      border: errors.minStock ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                      background: errors.minStock ? '#fef2f2' : '#f8fafc',
                      color: '#1e293b',
                    }}
                    onFocus={e => { if (!errors.minStock) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                    onBlur={e => { if (!errors.minStock) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                  />
                  {errors.minStock && (
                    <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      {errors.minStock}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── SUBMIT ROW ────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between pt-1">

              {/* Danger zone — delete */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                style={{
                  background: 'rgba(239,68,68,0.07)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#ef4444',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Product
              </button>

              {/* Save changes */}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150"
                style={{
                  background: saving ? 'rgba(59,92,212,0.5)' : 'linear-gradient(135deg, #3B5CD4, #3A96D4)',
                  boxShadow: saving ? 'none' : '0 2px 12px rgba(59,92,212,0.3)',
                }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,92,212,0.45)'; }}
                onMouseLeave={e => { if (!saving) e.currentTarget.style.boxShadow = '0 2px 12px rgba(59,92,212,0.3)'; }}>
                {saving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </main>
    </div>
  );
};

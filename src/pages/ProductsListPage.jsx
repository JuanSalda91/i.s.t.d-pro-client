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
    const [searchInput, setSearchInput] = useState('');
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

    //Effects
    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery, categoryFilter]);

    //Event Handlers
    const handleSearchInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(searchInput.trim());
    };

    const handleCategoryChange = (e) => {
        setCategoryFilter(e.target.value)
    };

    const handleEdit = (productId) => {
        navigate(`/products/edit/${productId}`);
    };

    const handleDelete = async (productId) => {
        const confirmed = window.confirm(
          'Are you sure you want to delete this product?'
        );
        if (!confirmed) return;
      
        try {
          await productApi.deleteProduct(productId);
          // After successful delete, refetch products
          await fetchProducts();
        } catch (err) {
          console.error('Error deleting product:', err);
          const msg =
            err.response?.data?.message || 'Failed to delete product';
          setError(msg);
        }
      };

    //Render
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
                  <h1 className="text-2xl font-bold" style={{ color: '#1e293b' }}>Products</h1>
                  <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
                    {products.length} product{products.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <Link
                  to="/products/new"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150"
                  style={{ background: 'linear-gradient(135deg, #3B5CD4, #3A96D4)', boxShadow: '0 2px 12px rgba(59,92,212,0.3)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,92,212,0.45)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(59,92,212,0.3)'}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Product
                </Link>
              </div>
      
              {/* Error */}
              {error && (
                <div className="mb-6 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
      
              {/* ── FILTERS ─────────────────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl px-5 py-4 mb-5 flex flex-wrap items-center gap-3 shadow-sm"
                style={{ border: '1px solid #e2e8f0' }}>
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#94a3b8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Filter</span>
      
                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <div className="relative">
                    <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94a3b8' }}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={searchInput}
                      onChange={handleSearchInputChange}
                      placeholder="Search by name or SKU…"
                      className="rounded-l-xl pl-9 pr-4 py-2 text-sm focus:outline-none transition-all duration-150"
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRight: 'none',
                        background: '#f8fafc',
                        color: '#1e293b',
                        width: '220px',
                      }}
                      onFocus={e => { e.target.style.border = '1px solid #3B5CD4'; e.target.style.borderRight = 'none'; e.target.style.background = '#fff'; }}
                      onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.borderRight = 'none'; e.target.style.background = '#f8fafc'; }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-r-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150"
                    style={{ background: '#3B5CD4', border: '1px solid #3B5CD4' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#2d4ab0'}
                    onMouseLeave={e => e.currentTarget.style.background = '#3B5CD4'}>
                    Search
                  </button>
                </form>
      
                {/* Category select */}
                <select
                  value={categoryFilter}
                  onChange={handleCategoryChange}
                  className="rounded-xl px-3 py-2 text-sm focus:outline-none transition-all duration-150 appearance-none"
                  style={{
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#475569',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                    backgroundSize: '14px',
                    paddingRight: '32px',
                  }}
                  onFocus={e => { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; }}>
                  <option value="">All categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Food">Food</option>
                  <option value="Home">Home</option>
                  <option value="Others">Others</option>
                </select>
      
                {/* Active category pill */}
                {categoryFilter && (
                  <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
                    style={{ background: 'rgba(59,92,212,0.08)', color: '#3B5CD4' }}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {categoryFilter}
                  </span>
                )}
              </div>
      
              {/* ── TABLE ───────────────────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
                {products.length === 0 ? (
                  <div className="py-16 text-center">
                    <svg className="w-10 h-10 mx-auto mb-3" style={{ color: '#cbd5e1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>No products found</p>
                    <p className="text-xs mt-1" style={{ color: '#cbd5e1' }}>Try adjusting your search or filters</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Category</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Price</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Stock</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const isLowStock = product.stock <= product.minStock;
      
                        return (
                          <tr key={product._id}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              background: isLowStock ? '#fff8f8' : 'transparent',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = isLowStock ? '#fff0f0' : '#fafbff'}
                            onMouseLeave={e => e.currentTarget.style.background = isLowStock ? '#fff8f8' : 'transparent'}>
      
                            {/* SKU */}
                            <td className="px-6 py-4 text-sm font-mono font-medium" style={{ color: '#3B5CD4' }}>
                              {product.sku}
                            </td>
      
                            {/* Name + low stock badge */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium" style={{ color: '#1e293b' }}>{product.name}</span>
                                {isLowStock && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
                                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Low Stock
                                  </span>
                                )}
                              </div>
                            </td>
      
                            {/* Category */}
                            <td className="px-4 py-4">
                              {product.category ? (
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                                  style={{ background: 'rgba(59,92,212,0.07)', color: '#3B5CD4' }}>
                                  {product.category}
                                </span>
                              ) : (
                                <span style={{ color: '#cbd5e1' }}>—</span>
                              )}
                            </td>
      
                            {/* Price */}
                            <td className="px-4 py-4 text-sm font-semibold text-right" style={{ color: '#1e293b' }}>
                              ${product.price.toFixed(2)}
                            </td>
      
                            {/* Stock */}
                            <td className="px-4 py-4 text-right">
                              <span className="text-sm font-semibold"
                                style={{ color: isLowStock ? '#dc2626' : '#1e293b' }}>
                                {product.stock}
                              </span>
                              {isLowStock && (
                                <span className="block text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                                  min. {product.minStock}
                                </span>
                              )}
                            </td>
      
                            {/* Actions */}
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleEdit(product._id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                                  style={{ background: 'rgba(59,92,212,0.08)', color: '#3B5CD4', border: '1px solid rgba(59,92,212,0.15)' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,92,212,0.18)'; e.currentTarget.style.borderColor = 'rgba(59,92,212,0.35)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,92,212,0.08)'; e.currentTarget.style.borderColor = 'rgba(59,92,212,0.15)'; }}>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(product._id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                                  style={{ background: 'rgba(239,68,68,0.07)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}
                                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'; }}>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </main>
          </div>
        );
      };
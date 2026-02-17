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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="text-slate-600 text-sm">Loading products...</div>
            </div>
          );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-slate-800">Products</h1>
            <div className="flex gap-3">
              <Link
                to="/products/new"
                className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                New product
              </Link>
              <Link
                to="/"
                className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Dashboard
              </Link>
            </div>
          </header>
    
          {/* Error message */}
          {error && (
            <div className="mb-4 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}
    
          {/* Filters */}
          <section className="mb-4 flex gap-3">
            {/* Search box */}
            <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Search by name or SKU..."
              className="border border-slate-300 rounded px-3 py-2 text-sm w-64"
            />
            <button type="submit"
            className="border border-slate-300 border-l-0 rounded-r px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
                Search
            </button>
            </form>
    
            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={handleCategoryChange}
              className="border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Food">Food</option>
              <option value="Home">Home</option>
              <option value="Others">Others</option>
            </select>
          </section>
    
          {/* Products table */}
          <section className="bg-white rounded-lg shadow overflow-hidden">
            {products.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No products found. Try adjusting your search or filters.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">
                      SKU
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-slate-700">
                      Category
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-slate-700">
                      Price
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-slate-700">
                      Stock
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    /**
                     * isLowStock: highlight row if stock <= minStock
                     * This warns user that product needs reordering
                     */
                    const isLowStock = product.stock <= product.minStock;
    
                    return (
                      <tr
                        key={product._id}
                        className={`border-b hover:bg-slate-50 ${
                          isLowStock ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-800">
                          {product.sku}
                        </td>
                        <td className="px-4 py-3 text-slate-800">
                          {product.name}
                          {isLowStock && (
                            <span className="ml-2 text-xs text-red-600 font-medium">
                              LOW STOCK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {product.category}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-800">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-800">
                          {product.stock}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleEdit(product._id)}
                            className="text-blue-600 hover:underline mr-3 text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-600 hover:underline text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>
      );
};
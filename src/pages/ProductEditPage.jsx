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

    if (loading) {
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-slate-600 text-sm">Loading product...</div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-slate-50 p-6">
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-slate-800">
              Edit Product
            </h1>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-3 py-1 text-xs rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
              >
                Back to products
              </button>
            </div>
          </header>
    
          {error && (
            <div className="mb-3 text-sm text-red-600">{error}</div>
          )}
          {success && (
            <div className="mb-3 text-sm text-green-600">{success}</div>
          )}
    
          <form
            onSubmit={handleSubmit}
            className="space-y-3 max-w-md bg-white p-4 rounded shadow"
          >
            {/* The fields are almost identical to ProductCreatePage, just using form state */}
            {/* SKU */}
            <div>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="SKU"
                className={`border p-2 w-full text-sm ${
                  errors.sku ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.sku && (
                <p className="mt-1 text-xs text-red-600">{errors.sku}</p>
              )}
            </div>
    
            {/* Name */}
            <div>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className={`border p-2 w-full text-sm ${
                  errors.name ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name}</p>
              )}
            </div>
    
            {/* Description */}
            <div>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="border border-slate-300 p-2 w-full text-sm"
              />
            </div>
    
            {/* Category */}
            <div>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="border border-slate-300 p-2 w-full text-sm"
              >
                <option value="">Select category</option>
                <option>Electronics</option>
                <option>Clothing</option>
                <option>Food</option>
                <option>Home</option>
                <option>Others</option>
              </select>
            </div>
    
            {/* Price */}
            <div>
              <input
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                className={`border p-2 w-full text-sm ${
                  errors.price ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-600">{errors.price}</p>
              )}
            </div>
    
            {/* Cost */}
            <div>
              <input
                name="cost"
                type="number"
                step="0.01"
                value={form.cost}
                onChange={handleChange}
                placeholder="Cost"
                className={`border p-2 w-full text-sm ${
                  errors.cost ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.cost && (
                <p className="mt-1 text-xs text-red-600">{errors.cost}</p>
              )}
            </div>
    
            {/* Stock */}
            <div>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                placeholder="Stock"
                className={`border p-2 w-full text-sm ${
                  errors.stock ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-red-600">{errors.stock}</p>
              )}
            </div>
    
            {/* Min stock */}
            <div>
              <input
                name="minStock"
                type="number"
                value={form.minStock}
                onChange={handleChange}
                placeholder="Min stock"
                className={`border p-2 w-full text-sm ${
                  errors.minStock ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.minStock && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.minStock}
                </p>
              )}
            </div>
    
            {/* Supplier */}
            <div>
              <input
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                placeholder="Supplier"
                className="border border-slate-300 p-2 w-full text-sm"
              />
            </div>
    
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-900 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      );
};
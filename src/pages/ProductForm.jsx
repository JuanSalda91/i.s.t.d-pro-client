import { useState } from 'react';
import { productApi } from '../api/productApi';
import { useNavigate } from 'react-router-dom';

export default function ProductCreatePage() {
  const navigate = useNavigate();

  const initialForm = {
    sku: '',
    name: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    supplier: '',
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    setLoading(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        cost: Number(form.cost),
        stock: Number(form.stock),
        minStock: Number(form.minStock),
      };

      await productApi.createProduct(payload);

      setSuccess('Product created successfully');
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      const backendMessage = err.response?.data?.message;

      // duplicate SKU or other SKU-specific backend error
      if (backendMessage && backendMessage.toLowerCase().includes('sku')) {
        setErrors((prev) => ({
          ...prev,
          sku: backendMessage,
        }));
      } else {
        // generic top-level error
        const msg = backendMessage || 'Failed to create product';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/'); //dashboard route
  };

  return (
    <div className="p-6">
      <h1 className="text-lg font-semibold mb-4">Create Product</h1>

      {error && (
        <div className="mb-2 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-2 text-sm text-green-600">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
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
            required
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
            required
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
            required
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
            required
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
            required
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
            <p className="mt-1 text-xs text-red-600">{errors.minStock}</p>
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

        {/* Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 mr-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Create product'}
          </button>
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="px-4 py-2 ml-40 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Back to dashboard
          </button>
        </div>
      </form>
    </div>
  );
}

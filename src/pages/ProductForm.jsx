import { useState } from 'react';
import { productApi } from '../api/productApi';

export default function ProductCreatePage() {
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'Electronics',
    price: '',
    cost: '',
    stock: '',
    minStock: 10,
    supplier: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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
      // optional: reset form
      // setForm({ ...initialValues });
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to create product';
      setError(msg);
    } finally {
      setLoading(false);
    }
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
        <input
          name="sku"
          value={form.sku}
          onChange={handleChange}
          placeholder="SKU"
          className="border p-2 w-full text-sm"
          required
        />
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="border p-2 w-full text-sm"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="border p-2 w-full text-sm"
        />
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border p-2 w-full text-sm"
        >
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Food</option>
          <option>Home</option>
          <option>Others</option>
        </select>
        <input
          name="price"
          type="number"
          step="0.01"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="border p-2 w-full text-sm"
          required
        />
        <input
          name="cost"
          type="number"
          step="0.01"
          value={form.cost}
          onChange={handleChange}
          placeholder="Cost"
          className="border p-2 w-full text-sm"
          required
        />
        <input
          name="stock"
          type="number"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock"
          className="border p-2 w-full text-sm"
          required
        />
        <input
          name="minStock"
          type="number"
          value={form.minStock}
          onChange={handleChange}
          placeholder="Min stock"
          className="border p-2 w-full text-sm"
        />
        <input
          name="supplier"
          value={form.supplier}
          onChange={handleChange}
          placeholder="Supplier"
          className="border p-2 w-full text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-900 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Create product'}
        </button>
      </form>
    </div>
  );
}

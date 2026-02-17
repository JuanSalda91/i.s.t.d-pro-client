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

    //Helpers: total //
    const computeSubtotal = () => {
        return items.reduce((sum, item) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            return sum + qty * price;
        }, 0);
    };

    const subtotal = computeSubtotal();
    const taxPercentage = Number(customer.taxPercentage) || 0;
    const taxAmount = (subtotal * taxPercentage) / 100;
    const totalAmount = subtotal + taxAmount;

    // Handlers //
    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setCustomer((prev) => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        setItems((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value};
            return updated;
        });
    };

    const addItemRow = () => {
        setItems((prev) => [ ...prev, { productId: '', quantity: 1, unitPrice: 0 },]);
    };

    const removeItemRow = (index) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    // Validation //
    const validate = () => {
        const errors = {};

        if (!customer.customerName.trim()) {
            errors.customerName = 'Customer name is required';
        }

        if (!customer.customerEmail.trim()) {
            error.customerEmail = 'Customer email is required';
        } else if (!/.+@.+\..+/.test(customer.customerEmail.trim())) {
            error.customerEmail = 'Please enter a valid email';
        }

        if (taxPercentage < 0 || taxPercentage > 100) {
            error.taxPercentage = 'Tax must be between 0 and 100';
        }

        // validate itmes: at least on valid item
        if (!items || items.length === 0) {
            errors.items = 'Add at least one item';
        } else {
            const itemErrors = [];
            items.forEach((item, index) => {
                const ie = {};
                if (!item.productId) {
                    ie.productId = 'Select a product';
                }
                if (!item.quantity || Number(item.quantity) <= 0) {
                    ie.quantity = 'Quantity must be at least 1';
                }
                if (item.unitPrice === '' || Number(item.unitPrice) < 0) {
                    ie.unitPrice = 'Unit price must be 0 or more';
                }
                itemErrors[index] = ie;
            });

            //Only add itemErrors if there is at least one error
            if (itemErrors.some((ie) => Object.keys(ie || {}).length > 0)) {
                errors.itemErrors = itemErrors;
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Submit Handler //
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validate()) return;

        setSaving(true);
        try {
            //Build items payload matching createsale expectations
            const payloadItems = items.map((item) => ({
                productId: item.productId,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
            }));

            const payload = {
                customerName: customer.customerName.trim(),
                customerEmail: customer.customerEmail.trim(),
                customerPhoe: customer.customerPhone.trim(),
                taxPercentage: taxPercentage,
                items: payloadItems,
            };

            const res = await salesApi.createSale(payload);

            setSuccess('Sale created successfully');
            setFieldErrors({});

            //reset form for next sale
            setCustomer({
                customerName: '',
                customerEmail: '',
                customerPhone: '',
                taxPercentage: 0,
            });
            setItems([{ productId: '', quantity: 1, unitPrice: 0 }]);
            //navigate to a sales list page
            //setTimeout(() => navigate('/sales'), 800);
        } catch (err) {
            console.error('Error creating sale:', err);
            const backendMessage = err.response?.data?.message;

            setError(
                backendMessage || 'Failed to creaete sale. please try again.'
            );
        } finally {
            setSaving(false);
        }
    };

    // RENDER //
    if (loadingProducts) {
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-slate-600 text-sm">
              Loading products for sale...
            </div>
          </div>
        );
      }
    
      const itemErrors = fieldErrors.itemErrors || [];
    
      return (
        <div className="min-h-screen bg-slate-50 p-6">
          {/* Header */}
          <header className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-slate-800">
              New Sale
            </h1>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-3 py-1 text-xs rounded bg-slate-200 text-slate-800 hover:bg-slate-300"
              >
                Dashboard
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
            className="space-y-4 max-w-3xl bg-white p-4 rounded shadow"
          >
            {/* Customer section */}
            <section className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="block text-xs text-slate-500 mb-1">
                  Customer name
                </label>
                <input
                  name="customerName"
                  value={customer.customerName}
                  onChange={handleCustomerChange}
                  className={`border p-2 w-full text-sm ${
                    fieldErrors.customerName
                      ? 'border-red-500'
                      : 'border-slate-300'
                  }`}
                />
                {fieldErrors.customerName && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.customerName}
                  </p>
                )}
              </div>
    
              <div className="md:col-span-1">
                <label className="block text-xs text-slate-500 mb-1">
                  Customer email
                </label>
                <input
                  name="customerEmail"
                  type="email"
                  value={customer.customerEmail}
                  onChange={handleCustomerChange}
                  className={`border p-2 w-full text-sm ${
                    fieldErrors.customerEmail
                      ? 'border-red-500'
                      : 'border-slate-300'
                  }`}
                />
                {fieldErrors.customerEmail && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.customerEmail}
                  </p>
                )}
              </div>
    
              <div className="md:col-span-1">
                <label className="block text-xs text-slate-500 mb-1">
                  Customer phone
                </label>
                <input
                  name="customerPhone"
                  value={customer.customerPhone}
                  onChange={handleCustomerChange}
                  className="border border-slate-300 p-2 w-full text-sm"
                />
              </div>
            </section>
    
            {/* Tax */}
            <section className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-1">
                <label className="block text-xs text-slate-500 mb-1">
                  Tax percentage (%)
                </label>
                <input
                  name="taxPercentage"
                  type="number"
                  value={customer.taxPercentage}
                  onChange={handleCustomerChange}
                  className={`border p-2 w-full text-sm ${
                    fieldErrors.taxPercentage
                      ? 'border-red-500'
                      : 'border-slate-300'
                  }`}
                />
                {fieldErrors.taxPercentage && (
                  <p className="mt-1 text-xs text-red-600">
                    {fieldErrors.taxPercentage}
                  </p>
                )}
              </div>
            </section>
    
            {/* Items table */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-slate-700">
                  Items
                </h2>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="px-2 py-1 text-xs rounded bg-slate-800 text-white hover:bg-slate-900"
                >
                  Add item
                </button>
              </div>
    
              {fieldErrors.items && (
                <p className="mb-2 text-xs text-red-600">
                  {fieldErrors.items}
                </p>
              )}
    
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-2 py-2 text-left">Product</th>
                      <th className="px-2 py-2 text-right">Qty</th>
                      <th className="px-2 py-2 text-right">Unit price</th>
                      <th className="px-2 py-2 text-right">Total</th>
                      <th className="px-2 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const rowErrors = itemErrors[index] || {};
                      const qty = Number(item.quantity) || 0;
                      const price = Number(item.unitPrice) || 0;
                      const lineTotal = qty * price;
    
                      return (
                        <tr key={index} className="border-t">
                          <td className="px-2 py-1">
                            <select
                              value={item.productId}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  'productId',
                                  e.target.value
                                )
                              }
                              className={`border p-1 w-full text-xs md:text-sm ${
                                rowErrors.productId
                                  ? 'border-red-500'
                                  : 'border-slate-300'
                              }`}
                            >
                              <option value="">Select product</option>
                              {products.map((p) => (
                                <option key={p._id} value={p._id}>
                                  {p.sku} — {p.name}
                                </option>
                              ))}
                            </select>
                            {rowErrors.productId && (
                              <p className="mt-1 text-[10px] text-red-600">
                                {rowErrors.productId}
                              </p>
                            )}
                          </td>
                          <td className="px-2 py-1 text-right">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  'quantity',
                                  e.target.value
                                )
                              }
                              className={`border p-1 w-16 text-right text-xs md:text-sm ${
                                rowErrors.quantity
                                  ? 'border-red-500'
                                  : 'border-slate-300'
                              }`}
                            />
                            {rowErrors.quantity && (
                              <p className="mt-1 text-[10px] text-red-600">
                                {rowErrors.quantity}
                              </p>
                            )}
                          </td>
                          <td className="px-2 py-1 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  'unitPrice',
                                  e.target.value
                                )
                              }
                              className={`border p-1 w-20 text-right text-xs md:text-sm ${
                                rowErrors.unitPrice
                                  ? 'border-red-500'
                                  : 'border-slate-300'
                              }`}
                            />
                            {rowErrors.unitPrice && (
                              <p className="mt-1 text-[10px] text-red-600">
                                {rowErrors.unitPrice}
                              </p>
                            )}
                          </td>
                          <td className="px-2 py-1 text-right">
                            ${lineTotal.toFixed(2)}
                          </td>
                          <td className="px-2 py-1 text-center">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItemRow(index)}
                                className="text-red-600 hover:underline text-xs"
                              >
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
    
            {/* Summary + submit */}
            <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-2 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Subtotal, tax, and total are previewed here for the user,
                but backend will **recalculate** them using the SaleSchema
                pre-save hook for accuracy.
              </div>
              <div className="text-sm text-right">
                <div>Subtotal: ${subtotal.toFixed(2)}</div>
                <div>Tax: ${taxAmount.toFixed(2)}</div>
                <div className="font-semibold">
                  Total: ${totalAmount.toFixed(2)}
                </div>
              </div>
            </section>
    
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-slate-800 text-white text-sm rounded hover:bg-slate-900 disabled:opacity-50"
            >
              {saving ? 'Saving sale…' : 'Create sale'}
            </button>
          </form>
        </div>
      );
    }
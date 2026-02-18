import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { salesApi } from "../api/salesApi.js";
import { productApi } from "../api/productApi.js";

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
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    taxPercentage: 0,
  });

  // items: each item = { productId, quantity, unitPrice }
  const [items, setItems] = useState([
    { productId: "", quantity: 1, unitPrice: 0 },
  ]);

  //products list for dropdown
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  //ui/validation state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Load Products //
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError("");
        setLoadingProducts(true);

        //reuse getProducts without filter
        const res = await productApi.getProducts({});
        setProducts(res.data.data || []);
      } catch (err) {
        console.error("Error fetching products for sale", err);
        const msg = err.response?.data?.message || "Failed to load products";
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
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { productId: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItemRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation //
  const validate = () => {
    const errors = {};

    if (!customer.customerName.trim()) {
      errors.customerName = "Customer name is required";
    }

    if (!customer.customerEmail.trim()) {
      error.customerEmail = "Customer email is required";
    } else if (!/.+@.+\..+/.test(customer.customerEmail.trim())) {
      error.customerEmail = "Please enter a valid email";
    }

    if (taxPercentage < 0 || taxPercentage > 100) {
      error.taxPercentage = "Tax must be between 0 and 100";
    }

    // validate itmes: at least on valid item
    if (!items || items.length === 0) {
      errors.items = "Add at least one item";
    } else {
      const itemErrors = [];
      items.forEach((item, index) => {
        const ie = {};
        if (!item.productId) {
          ie.productId = "Select a product";
        }
        if (!item.quantity || Number(item.quantity) <= 0) {
          ie.quantity = "Quantity must be at least 1";
        }
        if (item.unitPrice === "" || Number(item.unitPrice) < 0) {
          ie.unitPrice = "Unit price must be 0 or more";
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
    setError("");
    setSuccess("");

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

      await salesApi.createSale(payload);

      setSuccess("Sale created successfully");
      setFieldErrors({});

      //reset form for next sale
      setCustomer({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        taxPercentage: 0,
      });
      setItems([{ productId: "", quantity: 1, unitPrice: 0 }]);
      //navigate to a sales list page
      //setTimeout(() => navigate('/sales'), 800);
    } catch (err) {
      console.error("Error creating sale:", err);
      const backendMessage = err.response?.data?.message;

      setError(backendMessage || "Failed to creaete sale. please try again.");
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
    <div className="min-h-screen flex" style={{ background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main className="flex-1 p-8 overflow-auto">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1e293b' }}>New Sale</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>Fill in the details below to register a new sale</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150"
            style={{ background: '#fff', border: '1px solid #e2e8f0', color: '#475569' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3B5CD4'; e.currentTarget.style.color = '#3B5CD4'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
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

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── CUSTOMER INFO CARD ──────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <div className="px-6 py-4 border-b flex items-center gap-2" style={{ borderColor: '#f1f5f9', background: '#fafbff' }}>
              <svg className="w-4 h-4" style={{ color: '#3B5CD4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-sm font-semibold" style={{ color: '#1e293b' }}>Customer Information</h2>
            </div>
            <div className="p-6 grid gap-5 md:grid-cols-3">
              {/* Customer name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                  Customer Name
                </label>
                <input
                  name="customerName"
                  value={customer.customerName}
                  onChange={handleCustomerChange}
                  placeholder="John Smith"
                  className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-150 focus:outline-none"
                  style={{
                    border: fieldErrors.customerName ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                    background: fieldErrors.customerName ? '#fef2f2' : '#f8fafc',
                    color: '#1e293b',
                  }}
                  onFocus={e => { if (!fieldErrors.customerName) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                  onBlur={e => { if (!fieldErrors.customerName) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                />
                {fieldErrors.customerName && (
                  <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {fieldErrors.customerName}
                  </p>
                )}
              </div>

              {/* Customer email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                  Customer Email
                </label>
                <input
                  name="customerEmail"
                  type="email"
                  value={customer.customerEmail}
                  onChange={handleCustomerChange}
                  placeholder="john@example.com"
                  className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-150 focus:outline-none"
                  style={{
                    border: fieldErrors.customerEmail ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                    background: fieldErrors.customerEmail ? '#fef2f2' : '#f8fafc',
                    color: '#1e293b',
                  }}
                  onFocus={e => { if (!fieldErrors.customerEmail) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                  onBlur={e => { if (!fieldErrors.customerEmail) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                />
                {fieldErrors.customerEmail && (
                  <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {fieldErrors.customerEmail}
                  </p>
                )}
              </div>

              {/* Customer phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                  Customer Phone <span style={{ color: '#cbd5e1', fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  name="customerPhone"
                  value={customer.customerPhone}
                  onChange={handleCustomerChange}
                  placeholder="+1 555 000 0000"
                  className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-150 focus:outline-none"
                  style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b' }}
                  onFocus={e => { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; }}
                  onBlur={e => { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; }}
                />
              </div>

              {/* Tax */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#94a3b8' }}>
                  Tax Percentage (%)
                </label>
                <input
                  name="taxPercentage"
                  type="number"
                  value={customer.taxPercentage}
                  onChange={handleCustomerChange}
                  placeholder="0"
                  className="w-full rounded-xl px-4 py-2.5 text-sm transition-all duration-150 focus:outline-none"
                  style={{
                    border: fieldErrors.taxPercentage ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                    background: fieldErrors.taxPercentage ? '#fef2f2' : '#f8fafc',
                    color: '#1e293b',
                  }}
                  onFocus={e => { if (!fieldErrors.taxPercentage) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                  onBlur={e => { if (!fieldErrors.taxPercentage) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                />
                {fieldErrors.taxPercentage && (
                  <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#dc2626' }}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    {fieldErrors.taxPercentage}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── ITEMS TABLE CARD ────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: '#f1f5f9', background: '#fafbff' }}>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" style={{ color: '#3B5CD4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h2 className="text-sm font-semibold" style={{ color: '#1e293b' }}>Line Items</h2>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(59,92,212,0.1)', color: '#3B5CD4' }}>
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={addItemRow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-150"
                style={{ background: '#33B833', boxShadow: '0 2px 8px rgba(51,184,51,0.3)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(51,184,51,0.45)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(51,184,51,0.3)'}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>

            {fieldErrors.items && (
              <div className="mx-6 mt-4 rounded-lg px-4 py-2 text-xs flex items-center gap-2"
                style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {fieldErrors.items}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Product</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Unit Price</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Total</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const rowErrors = itemErrors[index] || {};
                    const qty = Number(item.quantity) || 0;
                    const price = Number(item.unitPrice) || 0;
                    const lineTotal = qty * price;

                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafbff'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                        {/* Product select */}
                        <td className="px-6 py-3">
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none transition-all duration-150 appearance-none"
                            style={{
                              border: rowErrors.productId ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                              background: rowErrors.productId ? '#fef2f2' : '#f8fafc',
                              color: item.productId ? '#1e293b' : '#94a3b8',
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 10px center',
                              backgroundSize: '14px',
                              paddingRight: '30px',
                            }}
                            onFocus={e => { if (!rowErrors.productId) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                            onBlur={e => { if (!rowErrors.productId) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                          >
                            <option value="">Select product…</option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>{p.sku} — {p.name}</option>
                            ))}
                          </select>
                          {rowErrors.productId && (
                            <p className="mt-1 text-xs" style={{ color: '#dc2626' }}>{rowErrors.productId}</p>
                          )}
                        </td>

                        {/* Qty */}
                        <td className="px-4 py-3">
                          <input
                            type="number" min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-20 rounded-lg px-3 py-2 text-sm text-right focus:outline-none transition-all duration-150 ml-auto block"
                            style={{
                              border: rowErrors.quantity ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                              background: rowErrors.quantity ? '#fef2f2' : '#f8fafc',
                              color: '#1e293b',
                            }}
                            onFocus={e => { if (!rowErrors.quantity) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                            onBlur={e => { if (!rowErrors.quantity) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                          />
                          {rowErrors.quantity && (
                            <p className="mt-1 text-xs text-right" style={{ color: '#dc2626' }}>{rowErrors.quantity}</p>
                          )}
                        </td>

                        {/* Unit price */}
                        <td className="px-4 py-3">
                          <input
                            type="number" min="0" step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-24 rounded-lg px-3 py-2 text-sm text-right focus:outline-none transition-all duration-150 ml-auto block"
                            style={{
                              border: rowErrors.unitPrice ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                              background: rowErrors.unitPrice ? '#fef2f2' : '#f8fafc',
                              color: '#1e293b',
                            }}
                            onFocus={e => { if (!rowErrors.unitPrice) { e.target.style.border = '1px solid #3B5CD4'; e.target.style.background = '#fff'; } }}
                            onBlur={e => { if (!rowErrors.unitPrice) { e.target.style.border = '1px solid #e2e8f0'; e.target.style.background = '#f8fafc'; } }}
                          />
                          {rowErrors.unitPrice && (
                            <p className="mt-1 text-xs text-right" style={{ color: '#dc2626' }}>{rowErrors.unitPrice}</p>
                          )}
                        </td>

                        {/* Line total */}
                        <td className="px-4 py-3 text-right text-sm font-semibold" style={{ color: '#1e293b' }}>
                          ${lineTotal.toFixed(2)}
                        </td>

                        {/* Remove */}
                        <td className="px-4 py-3 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItemRow(index)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all duration-150"
                              style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
                              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                              title="Remove item">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary footer */}
            <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: '#f1f5f9', background: '#fafbff' }}>
              <div className="text-sm space-y-1.5 min-w-48">
                <div className="flex justify-between gap-8" style={{ color: '#64748b' }}>
                  <span>Subtotal</span>
                  <span className="font-medium" style={{ color: '#1e293b' }}>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-8" style={{ color: '#64748b' }}>
                  <span>Tax ({customer.taxPercentage || 0}%)</span>
                  <span className="font-medium" style={{ color: '#1e293b' }}>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between gap-8 pt-2 border-t" style={{ borderColor: '#e2e8f0' }}>
                  <span className="font-semibold" style={{ color: '#1e293b' }}>Total</span>
                  <span className="text-base font-bold" style={{ color: '#3B5CD4' }}>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── SUBMIT ─────────────────────────────────────────────────────── */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-150"
              style={{
                background: saving ? '#86efac' : '#33B833',
                boxShadow: saving ? 'none' : '0 2px 12px rgba(51,184,51,0.35)',
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.boxShadow = '0 4px 20px rgba(51,184,51,0.5)'; }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.boxShadow = '0 2px 12px rgba(51,184,51,0.35)'; }}>
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving Sale…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Create Sale
                </>
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}

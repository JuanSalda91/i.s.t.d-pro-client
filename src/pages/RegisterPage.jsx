import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth(); // to store token/user after registration

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee", //default, matches backend default
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role, //optional, backend defaults to employee
      };

      const res = await authApi.register(payload);

      //backend returns: { success, token, refreshToekn, user: {...} }
      const { token, refreshToken, user } = res.data;

      //use Authcontext login method to store tokens/user
      authLogin({ token, refreshToken, user });

      //navigate to dashboard
      navigate("/");
    } catch (err) {
      const backendMessage = err.response?.data?.message;

      //handle "email already registered" as a field error
      if (backendMessage && backendMessage.toLowerCase().includes("email")) {
        setErrors((prev) => ({ ...prev, email: backendMessage }));
      } else {
        setError(backendMessage || "Failed to register");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1b3d 0%, #1a2f6b 50%, #0d2247 100%)' }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3B5CD4, transparent)' }} />
        <div className="absolute -bottom-40 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3A96D4, transparent)' }} />
        <div className="absolute top-1/3 right-1/3 w-px h-64 opacity-10 rotate-12"
          style={{ background: 'linear-gradient(to bottom, transparent, #3A96D4, transparent)' }} />
        <div className="absolute bottom-1/3 left-1/3 w-px h-48 opacity-10 -rotate-12"
          style={{ background: 'linear-gradient(to bottom, transparent, #3B5CD4, transparent)' }} />
      </div>

      <div className="w-full max-w-md mx-4 relative z-10">

        {/* Brand header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #3B5CD4, #3A96D4)' }}
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold tracking-wide">I.S.T.D PRO</h2>
          <p className="text-sm mt-1" style={{ color: '#7ea8d4' }}>Create your account</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h1 className="text-2xl font-bold text-white mb-1">Get started</h1>
          <p className="text-sm mb-8" style={{ color: '#7ea8d4' }}>
            Fill in your details to create an account
          </p>

          {/* Global error */}
          {error && (
            <div
              className="mb-6 rounded-lg px-4 py-3 text-sm flex items-center gap-2"
              style={{
                background: 'rgba(229,57,53,0.15)',
                border: '1px solid rgba(229,57,53,0.3)',
                color: '#ff8a80',
              }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Reusable input style helpers via inline handlers */}
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#7ea8d4' }}>
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Smith"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none"
                style={{
                  background: errors.name ? 'rgba(229,57,53,0.1)' : 'rgba(255,255,255,0.07)',
                  border: errors.name ? '1px solid rgba(229,57,53,0.5)' : '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={e => {
                  if (!errors.name) {
                    e.target.style.border = '1px solid #3A96D4';
                    e.target.style.background = 'rgba(58,150,212,0.1)';
                  }
                }}
                onBlur={e => {
                  if (!errors.name) {
                    e.target.style.border = '1px solid rgba(255,255,255,0.12)';
                    e.target.style.background = 'rgba(255,255,255,0.07)';
                  }
                }}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#ff8a80' }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#7ea8d4' }}>
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none"
                style={{
                  background: errors.email ? 'rgba(229,57,53,0.1)' : 'rgba(255,255,255,0.07)',
                  border: errors.email ? '1px solid rgba(229,57,53,0.5)' : '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={e => {
                  if (!errors.email) {
                    e.target.style.border = '1px solid #3A96D4';
                    e.target.style.background = 'rgba(58,150,212,0.1)';
                  }
                }}
                onBlur={e => {
                  if (!errors.email) {
                    e.target.style.border = '1px solid rgba(255,255,255,0.12)';
                    e.target.style.background = 'rgba(255,255,255,0.07)';
                  }
                }}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#ff8a80' }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#7ea8d4' }}>
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none"
                style={{
                  background: errors.password ? 'rgba(229,57,53,0.1)' : 'rgba(255,255,255,0.07)',
                  border: errors.password ? '1px solid rgba(229,57,53,0.5)' : '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={e => {
                  if (!errors.password) {
                    e.target.style.border = '1px solid #3A96D4';
                    e.target.style.background = 'rgba(58,150,212,0.1)';
                  }
                }}
                onBlur={e => {
                  if (!errors.password) {
                    e.target.style.border = '1px solid rgba(255,255,255,0.12)';
                    e.target.style.background = 'rgba(255,255,255,0.07)';
                  }
                }}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs flex items-center gap-1" style={{ color: '#ff8a80' }}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#7ea8d4' }}>
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl px-4 py-3 text-sm transition-all duration-200 focus:outline-none appearance-none cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: form.role ? '#ffffff' : '#64748b',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%237ea8d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  backgroundSize: '16px',
                }}
                onFocus={e => {
                  e.target.style.border = '1px solid #3A96D4';
                  e.target.style.background = 'rgba(58,150,212,0.1)';
                  e.target.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%233A96D4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`;
                  e.target.style.backgroundRepeat = 'no-repeat';
                  e.target.style.backgroundPosition = 'right 14px center';
                  e.target.style.backgroundSize = '16px';
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.12)';
                  e.target.style.background = 'rgba(255,255,255,0.07)';
                  e.target.style.backgroundImage = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%237ea8d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`;
                  e.target.style.backgroundRepeat = 'no-repeat';
                  e.target.style.backgroundPosition = 'right 14px center';
                  e.target.style.backgroundSize = '16px';
                }}
              >
                <option value="employee" style={{ background: '#1a2f6b', color: '#fff' }}>Employee</option>
                <option value="admin"    style={{ background: '#1a2f6b', color: '#fff' }}>Admin</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white tracking-wide transition-all duration-200 mt-2"
              style={{
                background: loading
                  ? 'rgba(59,92,212,0.5)'
                  : 'linear-gradient(135deg, #3B5CD4, #3A96D4)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(59,92,212,0.4)',
              }}
              onMouseEnter={e => {
                if (!loading) e.currentTarget.style.boxShadow = '0 6px 28px rgba(59,92,212,0.6)';
              }}
              onMouseLeave={e => {
                if (!loading) e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,92,212,0.4)';
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-sm mt-6" style={{ color: '#7ea8d4' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold transition-colors duration-150"
            style={{ color: '#3A96D4' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#3A96D4'}
          >
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/authApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

/**
 * LoginPage
 *
 * simple login form
 * - takes email and password
 * - calls backend /auth/login
 * - on success, stores toke+user via AuthContext and redirects to "/"
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await authApi.login(email, password);

      // Adjust these lines if your backend returns a different shape
      const token = res.data.token;
      const refreshToken = res.data.refreshToken;
      const user = res.data.user;

      login({ token, refreshToken, user });
      navigate("/");
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1b3d 0%, #1a2f6b 50%, #0d2247 100%)' }}>

      {/* Background geometric decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3A96D4, transparent)' }} />
        <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3B5CD4, transparent)' }} />
        <div className="absolute top-1/2 left-1/4 w-px h-64 opacity-10 rotate-12"
          style={{ background: 'linear-gradient(to bottom, transparent, #3A96D4, transparent)' }} />
        <div className="absolute top-1/3 right-1/4 w-px h-48 opacity-10 -rotate-12"
          style={{ background: 'linear-gradient(to bottom, transparent, #3B5CD4, transparent)' }} />
      </div>

      <div className="w-full max-w-md mx-4 relative z-10">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #3B5CD4, #3A96D4)' }}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h2 className="text-white text-xl font-semibold tracking-wide">I.S.T.D PRO</h2>
          <p className="text-sm mt-1" style={{ color: '#7ea8d4' }}>Business Management Platform</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-sm mb-8" style={{ color: '#7ea8d4' }}>Sign in to your account to continue</p>

          {error && (
            <div className="mb-6 rounded-lg px-4 py-3 text-sm flex items-center gap-2"
              style={{ background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#ff8a80' }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#7ea8d4' }}>
                Email Address
              </label>
              <input
                type="email"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={e => {
                  e.target.style.border = '1px solid #3A96D4';
                  e.target.style.background = 'rgba(58,150,212,0.1)';
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.12)';
                  e.target.style.background = 'rgba(255,255,255,0.07)';
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: '#7ea8d4' }}>
                Password
              </label>
              <input
                type="password"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                onFocus={e => {
                  e.target.style.border = '1px solid #3A96D4';
                  e.target.style.background = 'rgba(58,150,212,0.1)';
                }}
                onBlur={e => {
                  e.target.style.border = '1px solid rgba(255,255,255,0.12)';
                  e.target.style.background = 'rgba(255,255,255,0.07)';
                }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white tracking-wide transition-all duration-200 mt-2"
              style={{
                background: submitting
                  ? 'rgba(59,92,212,0.5)'
                  : 'linear-gradient(135deg, #3B5CD4, #3A96D4)',
                boxShadow: submitting ? 'none' : '0 4px 20px rgba(59,92,212,0.4)',
              }}
              onMouseEnter={e => {
                if (!submitting) e.target.style.boxShadow = '0 6px 28px rgba(59,92,212,0.6)';
              }}
              onMouseLeave={e => {
                if (!submitting) e.target.style.boxShadow = '0 4px 20px rgba(59,92,212,0.4)';
              }}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm mt-6" style={{ color: '#7ea8d4' }}>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold transition-colors duration-150"
            style={{ color: '#3A96D4' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = '#3A96D4'}
          >
            Create one →
          </Link>
        </p>
      </div>
    </div>
  );
}
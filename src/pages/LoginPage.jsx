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
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        <h1 className="text-2xl font-semibold mb-6 text-center text-slate-800">
          I.S.T.D PRO Login
        </h1>

        {error && (
          <div className="mb-4 rounded bg-red-100 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded py-2 text-sm font-medium"
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
          <p className="mt-4 text-xs text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-slate-800 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

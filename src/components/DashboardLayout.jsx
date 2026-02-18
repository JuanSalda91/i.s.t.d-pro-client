import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

/**
 * DashboardLayout wraps all authenticated pages.
 * It renders the shared Sidebar on the left and the current
 * route's page component on the right via <Outlet />.
 *
 * Usage in your router (e.g. App.jsx):
 *
 *   <Route element={<DashboardLayout />}>
 *     <Route path="/"              element={<DashboardPage />} />
 *     <Route path="/sales"         element={<SalesListPage />} />
 *     <Route path="/sales/new"     element={<SalesCreatePage />} />
 *     <Route path="/invoices"      element={<InvoicesListPage />} />
 *     <Route path="/products"      element={<ProductListPage />} />
 *     <Route path="/products/new"  element={<ProductForm />} />
 *     <Route path="/products/:id"  element={<ProductEditPage />} />
 *   </Route>
 *
 *   // Login and Register stay OUTSIDE DashboardLayout:
 *   <Route path="/login"    element={<LoginPage />} />
 *   <Route path="/register" element={<RegisterPage />} />
 */
function DashboardLayout() {
    const { user, logout } = useAuth();

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* Shared sidebar — rendered once for all child routes */}
      <Sidebar user={user} logout={logout} />

      {/* Page content — React Router swaps this per route */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Dashboard
 * 
 * simple placeholder for now
 * - shows logged in user email
 * - provides logout button
 */
export default function DashboardPage() {
    const { user, logout } = useAuth();
  
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-slate-800">
            I.S.T.D PRO Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="px-3 py-1 text-xs rounded bg-slate-800 text-white hover:bg-slate-900"
            >
              Logout
            </button>
          </div>
        </header>
  
        <main>
          <p className="text-slate-600 text-sm">
            Protected dashboard content will go here (cards, tables, charts).
          </p>
        </main>
      </div>
    );
  }
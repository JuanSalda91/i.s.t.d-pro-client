import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute
 * 
 * Wraps routed that require authentication
 * - If still loading auth state, shows a loading screen.
 * - If no user, redirects to /login
 * - If user exist, renders child routes (<Outlet />)
 */
export default function ProtectedRoute() {
    const { user, loading } = useAuth();

    //whilr checking localStorage / auth state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-slate-600 text-sm">Loading...</div>
            </div>
        );
    }

    // if not logged in, go to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    //user is logged in -> render the nested route
    return <Outlet />
}
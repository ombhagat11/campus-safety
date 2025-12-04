import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";

/**
 * Guest Route Component
 * Redirects authenticated users away from auth pages
 * Used for Login, Register, etc.
 */
const GuestRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (isAuthenticated && user) {
        // Check if user needs email verification
        if (!user.isVerified) {
            return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
        }

        // Redirect to intended destination or role-based default
        const from = location.state?.from?.pathname;

        if (from && from !== '/login' && from !== '/register') {
            return <Navigate to={from} replace />;
        }

        // Role-based default redirect
        switch (user.role) {
            case 'moderator':
                return <Navigate to="/app/moderator/dashboard" replace />;
            case 'admin':
            case 'super-admin':
                return <Navigate to="/app/admin/dashboard" replace />;
            case 'student':
            default:
                return <Navigate to="/app/dashboard" replace />;
        }
    }

    return children;
};

export default GuestRoute;

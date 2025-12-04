import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";
import { useEffect } from "react";

/**
 * Protected Route Component
 * Redirects to login if not authenticated
 * Optionally checks for required roles
 */
const ProtectedRoute = ({ children, requiredRoles = null }) => {
    const { isAuthenticated, user, hasRole } = useAuthStore();
    const location = useLocation();

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if user is verified
    if (user && !user.isVerified) {
        return <Navigate to="/verify-email" state={{ email: user.email }} replace />;
    }

    // Check role requirements if specified
    if (requiredRoles && !hasRole(requiredRoles)) {
        // Redirect based on user's actual role
        if (user) {
            switch (user.role) {
                case 'student':
                    return <Navigate to="/app/dashboard" replace />;
                case 'moderator':
                    return <Navigate to="/app/moderator/dashboard" replace />;
                case 'admin':
                case 'super-admin':
                    return <Navigate to="/app/admin/dashboard" replace />;
                default:
                    return <Navigate to="/app/dashboard" replace />;
            }
        }
        return <Navigate to="/app/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;

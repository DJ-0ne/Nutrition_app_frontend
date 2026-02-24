// components/Authentication/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/Login" replace />;
  }

  // ==================== ADMIN CHECK (supports your exact backend) ====================
  if (allowedRoles.length > 0) {
    const isAdminRoute = allowedRoles.includes('system_admin');

    let hasAccess = false;

    if (isAdminRoute) {
      // This matches exactly what your Login.jsx and AuthContext already do
      hasAccess =
        user.is_staff === true ||
        user.is_superuser === true ||
        user.role === 'system_admin';
    } else {
      // Normal role check (e.g. user_client)
      hasAccess = allowedRoles.includes(user.role);
    }

    if (!hasAccess) {
      return <Navigate to="/user/Home" replace />;   // or "/unauthorized" or keep "/Register"
    }
  }
  // =================================================================================

  return children;
};

export default ProtectedRoute;
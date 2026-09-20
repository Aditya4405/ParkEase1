import { Navigate } from "react-router-dom";
import { getToken, getUserRole, getOwnerAppStatus } from "../../api/api";

/**
 * Wraps any route that requires authentication.
 * Optionally enforces a specific role.
 *
 * Usage in App.js:
 *   <Route path="/user/dashboard"
 *     element={<ProtectedRoute role="USER"><UserDashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, role }) {
  const token = getToken();
  const userRole = getUserRole();
  const ownerAppStatus = getOwnerAppStatus();

  // No token → check if pending/rejected owner before redirecting to login
  if (!token) {
    if (ownerAppStatus === "PENDING") {
      return <Navigate to="/owner-pending" replace />;
    }
    if (ownerAppStatus === "REJECTED") {
      return <Navigate to="/owner-rejected" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to their correct dashboard
  if (role && userRole !== role) {
    if (userRole === "USER")  return <Navigate to="/user/dashboard"  replace />;
    if (userRole === "OWNER") return <Navigate to="/owner/dashboard" replace />;
    if (userRole === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
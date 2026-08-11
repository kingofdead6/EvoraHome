import { Navigate, Outlet } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (!token) return <Navigate to="/login" />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.usertype === "admin" || decoded.usertype === "superadmin") {
      return <Outlet />;
    }
    return <Navigate to="/login" />;
  } catch (error) {
    return <Navigate to="/login" />;
  }
}
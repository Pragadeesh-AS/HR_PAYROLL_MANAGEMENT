import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContextDefinition";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./utils/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

// Auth Pages entirely removed

// Dashboards
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import HRDashboard from "./pages/dashboards/HRDashboard";
import EmployeeDashboard from "./pages/dashboards/EmployeeDashboard";

// Placeholder components for future pages
const ComingSoon = ({ title }) => (
  <div style={{ textAlign: "center", padding: "60px 20px" }}>
    <h2>{title}</h2>
    <p style={{ color: "#6b7280", marginTop: "16px" }}>
      This feature is coming soon!
    </p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes - Removed */}

          {/* Protected Routes - Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route
              path="employees"
              element={<ComingSoon title="Employee Management" />}
            />
            <Route
              path="attendance"
              element={<ComingSoon title="Attendance Management" />}
            />
            <Route
              path="leave"
              element={<ComingSoon title="Leave Management" />}
            />
            <Route
              path="payroll"
              element={<ComingSoon title="Payroll Management" />}
            />
            <Route
              path="reports"
              element={<ComingSoon title="Reports & Analytics" />}
            />
            <Route path="settings" element={<ComingSoon title="Settings" />} />
          </Route>

          {/* Protected Routes - HR */}
          <Route
            path="/hr"
            element={
              <ProtectedRoute allowedRoles={["hr"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/hr/dashboard" replace />} />
            <Route path="dashboard" element={<HRDashboard />} />
            <Route
              path="employees"
              element={<ComingSoon title="Employee Management" />}
            />
            <Route
              path="attendance"
              element={<ComingSoon title="Attendance" />}
            />
            <Route
              path="leave"
              element={<ComingSoon title="Leave Requests" />}
            />
            <Route path="payroll" element={<ComingSoon title="Payroll" />} />
          </Route>

          {/* Protected Routes - Employee */}
          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={["employee"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/employee/dashboard" replace />}
            />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route
              path="attendance"
              element={<ComingSoon title="My Attendance" />}
            />
            <Route
              path="leave"
              element={<ComingSoon title="Leave Management" />}
            />
            <Route path="payslips" element={<ComingSoon title="Payslips" />} />
          </Route>

          {/* Profile Route - All authenticated users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ComingSoon title="My Profile" />} />
          </Route>

          {/* Error Routes */}
          <Route
            path="/unauthorized"
            element={
              <div style={{ textAlign: "center", padding: "100px 20px" }}>
                <h1 style={{ fontSize: "48px", color: "#ef4444" }}>403</h1>
                <h2>Unauthorized Access</h2>
                <p style={{ color: "#6b7280", marginTop: "16px" }}>
                  You don't have permission to access this page.
                </p>
              </div>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="*"
            element={
              <div style={{ textAlign: "center", padding: "100px 20px" }}>
                <h1 style={{ fontSize: "48px", color: "#ef4444" }}>404</h1>
                <h2>Page Not Found</h2>
                <p style={{ color: "#6b7280", marginTop: "16px" }}>
                  The page you're looking for doesn't exist.
                </p>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

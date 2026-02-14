import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextDefinition";
import Button from "../../components/common/Button";
import Input, { Select } from "../../components/common/Input";
import { FiMail, FiLock, FiUsers } from "react-icons/fi";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "employee",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await login(formData);

      // Redirect based on role
      switch (formData.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "hr":
          navigate("/hr/dashboard");
          break;
        default:
          navigate("/employee/dashboard");
      }
    } catch (error) {
      setErrors({ submit: error.message || "Login failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-bg"></div>
      <div className="auth-content animate-fadeIn">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <FiUsers size={40} />
            </div>
            <h1>Welcome Back</h1>
            <p>HR & Payroll Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon={<FiMail />}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={<FiLock />}
              error={errors.password}
              required
            />

            <Select
              label="Login As"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: "admin", label: "Admin" },
                { value: "hr", label: "HR Manager" },
                { value: "employee", label: "Employee" },
              ]}
              required
            />

            {errors.submit && (
              <div className="error-alert">{errors.submit}</div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="auth-link">
                Register here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-demo-info">
          <p className="text-sm text-gray">
            <strong>Demo Mode:</strong> Use any email and password (min 6 chars)
            to login
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

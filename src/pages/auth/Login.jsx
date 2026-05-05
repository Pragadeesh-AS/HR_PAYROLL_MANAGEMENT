import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContextDefinition";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import "./Auth.css";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Small trick: to test roles, we let user type admin@..., hr@..., etc.
      // We pass the role derived from email to the mock login to simulate it.
      const role = credentials.email.startsWith("admin")
        ? "admin"
        : credentials.email.startsWith("hr")
          ? "hr"
          : "employee";

      const user = await login({ ...credentials, role });
      
      // Redirect based on role
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "hr") navigate("/hr/dashboard");
      else navigate("/employee/dashboard");
      
    } catch (err) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Please enter your details to sign in</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* Public registration removed for security */}
        
        <div className="auth-footer" style={{marginTop: '10px', fontSize: '12px', color: '#9ca3af'}}>
          * Hint: Use admin@test.com for Admin, hr@test.com for HR
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContextDefinition";
import { authService } from "../../services/api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { FiUser, FiMail, FiBriefcase, FiHash, FiShield, FiCheckCircle, FiLock, FiEdit3 } from "react-icons/fi";
import "./Profile.css";

const Profile = () => {
  const { user } = useContext(AuthContext);
  
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setError("New passwords do not match");
    }
    if (passwords.newPassword.length < 6) {
      return setError("New password must be at least 6 characters long");
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setSuccess("Password updated successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <div className="new-profile-wrapper animate-fadeIn">
      <div className="profile-glass-grid">
        
        {/* Left Column - User Identity */}
        <div className="profile-identity-card">
          <div className="identity-bg-shape"></div>
          <div className="avatar-glow-ring">
            <div className="new-profile-avatar">
              {getInitials(user?.name)}
            </div>
            <button className="edit-avatar-btn"><FiEdit3 size={14} /></button>
          </div>
          <h1 className="identity-name">{user?.name}</h1>
          <div className="identity-role-badge">
            <FiShield size={14} /> {user?.role}
          </div>
          
          <div className="identity-quick-info">
            <div className="quick-info-pill">
              <FiHash size={16} className="pill-icon" />
              <span>{user?.empId || "EMP-000"}</span>
            </div>
            <div className="quick-info-pill">
              <FiMail size={16} className="pill-icon" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Right Column - Details & Security */}
        <div className="profile-details-column">
          
          {/* Work Information */}
          <div className="detail-section glass-panel">
            <div className="section-header">
              <FiBriefcase className="section-icon text-primary" />
              <h2>Work Information</h2>
            </div>
            
            <div className="work-info-grid">
              <div className="work-info-box">
                <span className="info-box-label">Department</span>
                <span className="info-box-value">{user?.department || "General"}</span>
              </div>
              <div className="work-info-box">
                <span className="info-box-label">Status</span>
                <span className="info-box-value status-active">Active Employee</span>
              </div>
              {user?.role === 'employee' && (
                <div className="work-info-box full-width">
                  <span className="info-box-label">Reporting Manager</span>
                  <span className="info-box-value flex-align">
                    <FiCheckCircle className="text-success" style={{marginRight: '8px'}} />
                    {user?.managedBy || "System Admin"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Security Settings */}
          <div className="detail-section glass-panel mt-6">
            <div className="section-header">
              <FiLock className="section-icon text-error" />
              <h2>Security Settings</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="new-password-form">
              <p className="security-subtitle">Ensure your account is using a long, random password to stay secure.</p>
              
              {error && <div className="toast-alert toast-error">{error}</div>}
              {success && <div className="toast-alert toast-success">{success}</div>}

              <div className="input-row">
                <Input
                  label="Current Password"
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="input-row split">
                <Input
                  label="New Password"
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  placeholder="New password"
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                />
              </div>
              
              <div className="form-action">
                <Button type="submit" loading={loading} className="btn-save-security">
                  Update Password
                </Button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;

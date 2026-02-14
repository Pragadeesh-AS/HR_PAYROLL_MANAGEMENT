import React from "react";
import "./Button.css";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  icon = null,
  iconPosition = "left",
  onClick,
  type = "button",
  className = "",
}) => {
  const buttonClass = `
    btn 
    btn-${variant} 
    btn-${size} 
    ${fullWidth ? "btn-full" : ""} 
    ${loading ? "btn-loading" : ""} 
    ${className}
  `.trim();

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="spinner spinner-sm"></span>}
      {!loading && icon && iconPosition === "left" && (
        <span className="btn-icon">{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === "right" && (
        <span className="btn-icon">{icon}</span>
      )}
    </button>
  );
};

export default Button;

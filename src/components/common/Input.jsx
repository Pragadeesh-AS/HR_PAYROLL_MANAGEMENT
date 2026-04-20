import React from "react";
import "./Input.css";

const Input = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error = "",
  icon = null,
  className = "",
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`input ${icon ? "input-with-icon" : ""} ${error ? "input-error" : ""}`}
        />
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  required = false,
  error = "",
  placeholder = "Select an option",
  className = "",
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`input select ${error ? "input-error" : ""}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error = "",
  rows = 4,
  className = "",
}) => {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`input textarea ${error ? "input-error" : ""}`}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;

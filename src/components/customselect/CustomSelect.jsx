// CustomSelect.jsx - Simplified without Formik dependency
import React from "react";
import "./customselect.scss";

const CustomSelect = ({
  label,
  options = [],
  placeholder = "-- Select --",
  name,
  value,
  onChange,
  // Class props
  selectClassName = "",
  labelClassName = "",
  containerClassName = "",
  errorClassName = "",
  // Additional props
  disabled = false,
  required = false,
  id,
  style = {},
  error = "", // Manual error prop for non-Formik usage
  ...otherProps
}) => {
  // For Product component, we don't need Formik at all
  const fieldProps = {
    name,
    value: value || "",
    onChange,
  };

  // Default class names
  const defaultContainerClass = "custom-select-container";
  const defaultLabelClass = "custom-select-label";
  const defaultSelectClass = "custom-select";
  const defaultErrorClass = "custom-select-error";

  // Combine default and custom class names
  const finalContainerClass = containerClassName
    ? `${defaultContainerClass} ${containerClassName}`
    : defaultContainerClass;

  const finalLabelClass = labelClassName
    ? `${defaultLabelClass} ${labelClassName}`
    : defaultLabelClass;

  const finalSelectClass = selectClassName
    ? `${defaultSelectClass} ${selectClassName}`
    : defaultSelectClass;

  const finalErrorClass = errorClassName
    ? `${defaultErrorClass} ${errorClassName}`
    : defaultErrorClass;

  const hasError = !!error;

  return (
    <div
      className={`${finalContainerClass} ${hasError ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}
      style={style}
    >
      {label && (
        <label
          htmlFor={id || name}
          className={`${finalLabelClass} ${required ? 'required' : ''}`}
        >
          {label}
          {required && <span className="required-asterisk"> *</span>}
        </label>
      )}

      <div className="select-wrapper">
        <select
          {...fieldProps}
          {...otherProps}
          id={id || name}
          className={`${finalSelectClass} ${hasError ? 'error' : ''}`}
          disabled={disabled}
          required={required}
        >
          <option value="" disabled={required}>
            {placeholder}
          </option>
          {options.map((opt, index) => (
            <option key={opt.value || index} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="select-arrow">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Error message */}
      {hasError && (
        <div className={finalErrorClass}>
          {error}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
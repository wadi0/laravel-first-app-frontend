// CustomSelect.jsx
import React from "react";
import { ErrorMessage, useField, useFormikContext } from "formik";
import "./customselect.scss";

const CustomSelect = ({
  label,
  options = [],
  placeholder = "-- Select --",
  name,
  value,
  onChange,
  // New class props
  selectClassName = "",
  labelClassName = "",
  containerClassName = "",
  errorClassName = "",
  // Additional props
  disabled = false,
  required = false,
  id,
  style = {},
  ...otherProps
}) => {
  const formikContext = useFormikContext();
  const isInsideFormik = !!formikContext;

  let fieldProps = {};
  let hasError = false;

  if (isInsideFormik) {
    const [field, meta] = useField(name);
    fieldProps = {
      ...field,
    };
    hasError = meta.touched && meta.error;
  } else {
    fieldProps = {
      name,
      value: value || "",
      onChange,
    };
  }

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

      {/* Error message for Formik */}
      {isInsideFormik && (
        <ErrorMessage
          name={name}
          component="div"
          className={finalErrorClass}
        />
      )}

      {/* Error message for non-Formik usage */}
      {!isInsideFormik && hasError && (
        <div className={finalErrorClass}>
          {hasError}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

// import React from "react";
// import {ErrorMessage, useField, useFormikContext} from "formik";
// import "./customselect.scss"
//
// const CustomSelect = ({ label, options, placeholder = "-- Select --", name, value, onChange }) => {
//   const formikContext = useFormikContext();
//   const isInsideFormik = !!formikContext;
//
//   let fieldProps = {};
//   if (isInsideFormik) {
//     const [field, meta] = useField(name);
//     fieldProps = {
//       ...field,
//     };
//   } else {
//     fieldProps = {
//       name,
//       value,
//       onChange,
//     };
//   }
//
//   return (
//     <div style={{ marginBottom: "1rem" }}>
//       {label && <label style={{ display: "block", marginBottom: "4px" }}>{label}</label>}
//
//       <select
//         {...fieldProps}
//         style={{ padding: "8px", width: "100%" }}
//       >
//         <option value="">{placeholder}</option>
//         {options.map((opt) => (
//           <option key={opt.value} value={opt.value}>
//             {opt.label}
//           </option>
//         ))}
//       </select>
//
//       {/* Optional: You can show error message if inside Formik */}
//       {isInsideFormik && (
//         <ErrorMessage name={name} component="div" style={{ color: "red", fontSize: "0.8em" }} />
//       )}
//     </div>
//   );
// };
//
// export default CustomSelect;



// import React from "react";
// import { useField } from "formik";
//
// const CustomSelect = ({ label, options, placeholder = "-- Select --", ...props }) => {
//   const [field, meta] = useField(props);
//
//   return (
//     <div style={{ marginBottom: "1rem" }}>
//       {label && <label style={{ display: "block", marginBottom: "4px" }}>{label}</label>}
//
//       <select {...field} {...props} style={{ padding: "8px", width: "100%" }}>
//         <option value="">{placeholder}</option>
//         {options.map((opt) => (
//           <option key={opt.value} value={opt.value}>
//             {opt.label}
//           </option>
//         ))}
//       </select>
//
//       {meta.touched && meta.error && (
//         <div style={{ color: "red", fontSize: "0.9em", marginTop: "4px" }}>{meta.error}</div>
//       )}
//     </div>
//   );
// };
//
// export default CustomSelect;

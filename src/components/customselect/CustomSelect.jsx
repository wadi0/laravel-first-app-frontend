import React from "react";
import {ErrorMessage, useField, useFormikContext} from "formik";
import "./customselect.scss"

const CustomSelect = ({ label, options, placeholder = "-- Select --", name, value, onChange }) => {
  const formikContext = useFormikContext();
  const isInsideFormik = !!formikContext;

  let fieldProps = {};
  if (isInsideFormik) {
    const [field, meta] = useField(name);
    fieldProps = {
      ...field,
    };
  } else {
    fieldProps = {
      name,
      value,
      onChange,
    };
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      {label && <label style={{ display: "block", marginBottom: "4px" }}>{label}</label>}

      <select
        {...fieldProps}
        style={{ padding: "8px", width: "100%" }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Optional: You can show error message if inside Formik */}
      {isInsideFormik && (
        <ErrorMessage name={name} component="div" style={{ color: "red", fontSize: "0.8em" }} />
      )}
    </div>
  );
};

export default CustomSelect;



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

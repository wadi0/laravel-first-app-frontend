import { useField } from 'formik';
import "./customInput.scss";

const CustomInput = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  const error = meta.touched && meta.error;

  return (
    <div className={`custom-input ${error ? 'error' : ''}`}>
      {label && <label htmlFor={props.id || props.name}>{label}</label>}

      <input
        {...field}
        {...props}
        className={`input-box ${field.value ? 'filled' : ''}`}
      />

      {error && <small className="error-text">{meta.error}</small>}
    </div>
  );
};

export default CustomInput;

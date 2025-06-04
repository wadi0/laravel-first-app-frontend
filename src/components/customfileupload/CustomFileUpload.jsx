import React from 'react';
import { useField, ErrorMessage } from 'formik';

const CustomFileUpload = ({ label, ...props }) => {
  const [field, meta, helpers] = useField(props.name);

  const handleChange = (event) => {
    const file = event.currentTarget.files[0];
    helpers.setValue(file);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label>{label}</label><br />
      <input
        type="file"
        onChange={handleChange}
        accept="image/*"
      />
      {meta.touched && meta.error && (
        <div style={{ color: 'red', marginTop: '5px' }}>{meta.error}</div>
      )}
    </div>
  );
};

export default CustomFileUpload;
// CustomLoader.jsx
import React from 'react';
import './customLoader.scss';

const CustomLoader = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="custom-loader-overlay">
      <div className="loader-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading...</p>
      </div>
    </div>
  );
};

export default CustomLoader;
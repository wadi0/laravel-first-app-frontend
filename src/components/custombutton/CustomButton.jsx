import React from 'react';
import "./custombutton.scss"

const CustomSubmitButton = ({isLoading, onClick, label, type, btnClassName}) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isLoading}
            className={`default-submit-btn ${btnClassName ? btnClassName : ''}`}
            // style={{
            //     backgroundColor: isLoading ? '#aaa' : '#007bff',
            //     color: '#fff',
            //     padding: '10px 20px',
            //     fontSize: '16px',
            //     borderRadius: '6px',
            //     border: 'none',
            //     cursor: isLoading ? 'not-allowed' : 'pointer',
            //     display: 'flex',
            //     alignItems: 'center',
            //     justifyContent: 'center',
            //     minWidth: '120px',
            // }}
        >
            {isLoading ? (
                <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}/>
            ) : (
                label
            )}

            {/* Spinner animation */}
            <style>
                {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
            </style>
        </button>
    );
};

export default CustomSubmitButton;

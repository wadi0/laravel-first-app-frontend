import React from 'react';
import "./customModal.scss";
import CustomSubmitButton from "../custombutton/CustomButton.jsx";
import {IoIosCloseCircleOutline} from "react-icons/io";

const CustomModal = ({isOpen, onClose, title, children, modalClass = "", size}) => {
    if (!isOpen) return null;

    return (
        <div className="custom-modal-overlay">
            <div className={`custom-modal ${modalClass}`} style={{ width: size || '500px' }}>
                <div className="custom-modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <CustomSubmitButton
                        // isLoading={loading}
                        onClick={onClose}
                        type="button"
                        icon = {<IoIosCloseCircleOutline />}
                        btnClassName="close-modal-btn"
                    />
                </div>
                <div className="custom-modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CustomModal;

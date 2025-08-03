import React from 'react';
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";

const ProductCard = ({ product, onEdit, onDelete }) => {
    return (
        <div className="product">
            <img
                src={`http://localhost:8000/storage/${product.image}`}
                alt={product.name}
                className="product-img"
                onError={(e) => {
                    e.target.src = '/placeholder-image.png';
                }}
            />
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">${product.price}</p>
            </div>
            <div className="product-actions">
                <CustomSubmitButton
                    onClick={() => onEdit(product)}
                    type="button"
                    label="Edit"
                    btnClassName="edit-btn"
                />
                <CustomSubmitButton
                    onClick={() => onDelete(product.id)}
                    type="button"
                    label="Delete"
                    btnClassName="delete-btn"
                />
            </div>
        </div>
    );
};

export default ProductCard;

// ProductCard.jsx
import React, {useState} from 'react';
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import {FaHeart, FaStar} from 'react-icons/fa';
import {FiShoppingCart} from 'react-icons/fi';
import "./productCard.scss";

const ProductCard = ({product, onAddToCart, onWishlist}) => {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const handleWishlist = () => {
        setIsWishlisted(!isWishlisted);
        onWishlist?.(product);
    };

    const handleAddToCart = async () => {
        setIsAddingToCart(true);
        await onAddToCart?.(product);
        setTimeout(() => setIsAddingToCart(false), 1000);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    return (
        <div className="product">
            {/* Image container */}
            <div className="product-image-container">
                <img
                    src={product.image ? `http://localhost:8000/storage/${product.image}` : '/placeholder-image.png'}
                    alt={product.name}
                    className="product-img"
                    onError={(e) => {
                        e.target.src = '/placeholder-image.png';
                    }}
                />

                {/* Wishlist button */}
                <button
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                    onClick={handleWishlist}
                >
                    <FaHeart/>
                </button>
            </div>

            {/* Product information */}
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description text-truncate">{product.description}</p>
                <div className="product-price">{formatPrice(product.price)}</div>
            </div>

            <div className="product-actions">
                <CustomSubmitButton
                    onClick={handleAddToCart}
                    type="button"
                    icon={<FiShoppingCart />}
                    label="Add to Cart"
                    btnClassName="default-submit-btn add-to-cart-btn"
                />
            </div>
        </div>
    );
};

export default ProductCard;
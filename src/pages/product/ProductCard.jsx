import React, {useEffect, useState} from 'react';
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import {FaHeart} from 'react-icons/fa';
import {FiShoppingCart} from 'react-icons/fi';
import "./productCard.scss";
import {MdOutlineRemoveShoppingCart} from "react-icons/md";
import {useApp} from "../../components/context/AppContext.jsx";

const ProductCard = ({product, cartItems, onAddToCart, onWishlist, onRemoveFromCart}) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isInCart, setIsInCart] = useState(false);

    // App context থেকে wishlist data নিন
    const { isInWishlist } = useApp();
    const [isWishlisted, setIsWishlisted] = useState(false);

    const handleWishlist = async () => {
        const success = await onWishlist?.(product);
        if (success) {
            setIsWishlisted(!isWishlisted);
        }
    };

    useEffect(() => {
        // cartItems prop check করুন
        if (cartItems && Array.isArray(cartItems)) {
            const found = cartItems.some(item => item.product_id === product.id);
            setIsInCart(found);
        } else {
            console.warn('cartItems is not defined or not an array:', cartItems);
            setIsInCart(false);
        }
    }, [cartItems, product.id]);

    useEffect(() => {
        if (typeof isInWishlist === 'function' && product && product.id) {
            setIsWishlisted(isInWishlist(product.id));
        }
    }, [isInWishlist, product.id]);

    const handleAddToCart = async () => {
        setIsAddingToCart(true);
        try {
            await onAddToCart?.(product);
            setIsInCart(true);
        } catch (error) {
            console.error('Add to cart failed:', error);
            // Keep cart state unchanged on failure
        } finally {
            setTimeout(() => setIsAddingToCart(false), 500);
        }
    };

    const handleRemoveFromCart = async () => {
        setIsAddingToCart(true);
        try {
            const success = await onRemoveFromCart?.(product);
            // Only update cart state if removal was successful
            if (success) {
                setIsInCart(false);
            }
        } catch (error) {
            console.error('Remove from cart failed:', error);
            // Keep cart state unchanged on failure
        } finally {
            setTimeout(() => setIsAddingToCart(false), 500);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    // Product data validation
    if (!product) {
        console.error('Product data is missing');
        return null;
    }

    return (
        <div className="product">
            {/* Image container */}
            <div className="product-image-container">
                <img
                    src={product.image ? `http://localhost:8000/storage/${product.image}` : '/placeholder-image.png'}
                    alt={product.name || 'Product'}
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
                <h3 className="product-name">{product.name || 'Unknown Product'}</h3>
                <p className="product-description text-truncate">{product.description || 'No description'}</p>
                <div className="product-price">{formatPrice(product.price || 0)}</div>
            </div>

            <div className="product-actions">
                {isInCart ? (
                    <CustomSubmitButton
                        onClick={handleRemoveFromCart}
                        type="button"
                        icon={<MdOutlineRemoveShoppingCart/>}
                        label="Remove from Cart"
                        btnClassName="default-remove-btn add-to-cart-btn"
                        isLoading={isAddingToCart}
                    />
                ) : (
                    <CustomSubmitButton
                        onClick={handleAddToCart}
                        type="button"
                        icon={<FiShoppingCart/>}
                        label="Add to Cart"
                        btnClassName="default-submit-btn add-to-cart-btn"
                        isLoading={isAddingToCart}
                    />
                )}
            </div>
        </div>
    );
};

export default ProductCard;
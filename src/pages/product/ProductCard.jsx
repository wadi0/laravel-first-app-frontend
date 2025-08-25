import React, {useEffect, useState, useCallback} from 'react';
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import {FaHeart} from 'react-icons/fa';
import {FiShoppingCart} from 'react-icons/fi';
import "./productCard.scss";
import {MdOutlineRemoveShoppingCart} from "react-icons/md";
import {useApp} from "../../components/context/AppContext.jsx";
import {toast} from "react-toastify";
import path from "../../routes/path.jsx";
import {useNavigate} from "react-router-dom";

const ProductCard = ({product, cartItems, onAddToCart, onWishlist, onRemoveFromCart}) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isInCart, setIsInCart] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false); // Separate loading state

    // App context থেকে wishlist data নিন
    const {isLoggedIn, isInWishlist} = useApp();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const navigate = useNavigate();

    // Use useCallback to prevent unnecessary re-renders and multiple calls
    const handleWishlist = useCallback(async () => {
        if (isWishlistLoading) return; // Prevent multiple calls

        if (!isLoggedIn()) {
            toast.info("Please login first");
            navigate(path.login);
            return;
        }

        setIsWishlistLoading(true);
        try {
            const success = await onWishlist?.(product);
            if (success) {
                setIsWishlisted(!isWishlisted);
            }
        } catch (error) {
            console.error('Wishlist operation failed:', error);
        } finally {
            setIsWishlistLoading(false);
        }
    }, [isWishlistLoading, isLoggedIn, onWishlist, product, isWishlisted, navigate]);

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

    const handleAddToCart = useCallback(async () => {
        if (isAddingToCart) return; // Prevent multiple calls

        if (!isLoggedIn()) {
            toast.info("Please login first");
            navigate(path.login);
            return;
        }

        setIsAddingToCart(true);
        try {
            const success = await onAddToCart?.(product);
            if (success) {
                setIsInCart(true);
            }
        } catch (error) {
            console.error('Add to cart failed:', error);
            // Keep cart state unchanged on failure
        } finally {
            // Remove the setTimeout, just set loading to false immediately
            setIsAddingToCart(false);
        }
    }, [isAddingToCart, isLoggedIn, onAddToCart, product, navigate]);

    const handleRemoveFromCart = useCallback(async () => {
        if (isAddingToCart) return; // Prevent multiple calls

        if (!isLoggedIn()) {
            toast.info("Please login first");
            navigate(path.login);
            return;
        }

        setIsAddingToCart(true);
        try {
            const success = await onRemoveFromCart?.(product);
            // Only update local state if removal was successful
            if (success) {
                setIsInCart(false);
            }
        } catch (error) {
            console.error('Remove from cart failed:', error);
            // Keep cart state unchanged on failure
        } finally {
            setIsAddingToCart(false);
        }
    }, [isAddingToCart, isLoggedIn, onRemoveFromCart, product, navigate]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    // Get proper image URL - same logic as admin panel
    const getImageUrl = (imageUrl) => {
        // If no image, return placeholder
        if (!imageUrl || imageUrl.trim() === '') {
            return '/placeholder-image.png';
        }

        // If already full URL (Cloudinary), return as is
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }

        // If relative path, add base URL
        return `http://localhost:8000/storage/${imageUrl}`;
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
                    src={getImageUrl(product.image)}
                    alt={product.name || 'Product'}
                    className="product-img"
                    onError={(e) => {
                        e.target.src = '/placeholder-image.png';
                    }}
                />

                {/* Wishlist button */}
                <button
                    className={`wishlist-btn ${isWishlisted ? 'active' : ''} ${isWishlistLoading ? 'loading' : ''}`}
                    onClick={handleWishlist}
                    disabled={isWishlistLoading} // Disable button during loading
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
                        disabled={isAddingToCart} // Add disabled prop
                    />
                ) : (
                    <CustomSubmitButton
                        onClick={handleAddToCart}
                        type="button"
                        icon={<FiShoppingCart/>}
                        label="Add to Cart"
                        btnClassName="default-submit-btn add-to-cart-btn"
                        isLoading={isAddingToCart}
                        disabled={isAddingToCart} // Add disabled prop
                    />
                )}
            </div>
        </div>
    );
};

export default ProductCard;
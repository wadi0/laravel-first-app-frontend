// pages/cart/Cart.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { FaShoppingCart, FaTrash, FaHeart, FaMinus, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './cart.scss';
import {useApp} from "../../components/context/AppContext.jsx";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";

const Cart = () => {
    const {
        cartItems,
        cartLoading,
        removeFromCart,
        addToWishlist,
        isInWishlist,
        updateCartQuantity,
        getCartItems
    } = useApp();

    const [loading, setLoading] = useState({});
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false); // Prevent multiple initial loads

    // Only load cart once when component mounts
    useEffect(() => {
        if (!hasLoadedOnce) {
            getCartItems();
            setHasLoadedOnce(true);
        }
    }, []); // Empty dependency array - only run once

    const handleRemoveFromCart = useCallback(async (product) => {
        if (!product || loading[`cart-${product.id}`]) return; // Prevent duplicate calls

        setLoading(prev => ({...prev, [`cart-${product.id}`]: true}));
        try {
            const success = await removeFromCart(product);
            if (!success) {
                // Error handling already done in context
            }
        } catch (error) {
            console.error('Remove from cart error:', error);
        } finally {
            setLoading(prev => ({...prev, [`cart-${product.id}`]: false}));
        }
    }, [removeFromCart, loading]);

    const handleAddToWishlist = useCallback(async (product) => {
        if (!product || loading[`wishlist-${product.id}`]) return; // Prevent duplicate calls

        setLoading(prev => ({...prev, [`wishlist-${product.id}`]: true}));
        try {
            const success = await addToWishlist(product);
            return success;
        } catch (error) {
            console.error('Add to wishlist error:', error);
            return false;
        } finally {
            setLoading(prev => ({...prev, [`wishlist-${product.id}`]: false}));
        }
    }, [addToWishlist, loading]);

    const handleQuantityUpdate = useCallback(async (product, newQuantity) => {
        if (!product || newQuantity < 1 || loading[`quantity-${product.id}`]) return;

        setLoading(prev => ({...prev, [`quantity-${product.id}`]: true}));
        try {
            const success = await updateCartQuantity(product, newQuantity);
            if (!success) {
                // Error toast already shown in context
            }
        } catch (error) {
            console.error('Update quantity error:', error);
        } finally {
            setLoading(prev => ({...prev, [`quantity-${product.id}`]: false}));
        }
    }, [updateCartQuantity, loading]);

    const formatPrice = useCallback((price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }, []);

    // Get proper image URL
    const getImageUrl = useCallback((imageUrl) => {
        if (!imageUrl || imageUrl.trim() === '') {
            return '/placeholder-image.png';
        }
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        return `http://localhost:8000/storage/${imageUrl}`;
    }, []);

    // Memoize calculations to prevent unnecessary recalculations
    const calculations = React.useMemo(() => {
        const subtotal = (cartItems || []).reduce((total, item) => {
            return total + ((item.product?.price || 0) * (item.quantity || 1));
        }, 0);

        const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total };
    }, [cartItems]);

    if (cartLoading && !hasLoadedOnce) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your cart...</p>
                    </div>
                </div>
            </div>
        );
    }

    const cartItemsArray = cartItems || []; // Safe fallback

    return (
        <div className="cart-page">
            <div className="container">
                <div className="cart-header">
                    <h1>
                        <FaShoppingCart className="page-icon" />
                        Shopping Cart
                    </h1>
                    <p className="cart-count">
                        {cartItemsArray.length} {cartItemsArray.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {cartItemsArray.length === 0 ? (
                    <div className="empty-cart">
                        <div className="empty-icon">
                            <FaShoppingCart />
                        </div>
                        <h2>Your cart is empty</h2>
                        <p>Add some products to get started</p>
                        <Link to="/product" className="shop-now-btn">
                            <CustomSubmitButton
                                type="button"
                                label="Start Shopping"
                                btnClassName="default-submit-btn"
                            />
                        </Link>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items">
                            {cartItemsArray.map((item) => {
                                if (!item || !item.product) {
                                    console.warn('Invalid cart item:', item);
                                    return null;
                                }

                                return (
                                    <div key={`cart-item-${item.id}`} className="cart-item">
                                        <div className="item-image">
                                            <img
                                                src={getImageUrl(item.product.image)}
                                                alt={item.product.name || 'Product'}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.png';
                                                }}
                                            />
                                        </div>

                                        <div className="item-details">
                                            <h3 className="item-name">{item.product.name || 'Unknown Product'}</h3>
                                            <p className="item-description">{item.product.description || 'No description'}</p>
                                            <div className="item-price">{formatPrice(item.product.price || 0)}</div>
                                        </div>

                                        <div className="item-quantity">
                                            <label>Quantity:</label>
                                            <div className="quantity-controls">
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => handleQuantityUpdate(item.product, (item.quantity || 1) - 1)}
                                                    disabled={loading[`quantity-${item.product.id}`] || (item.quantity || 1) <= 1}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <FaMinus />
                                                </button>
                                                <span className="quantity">{item.quantity || 1}</span>
                                                <button
                                                    className="qty-btn"
                                                    onClick={() => handleQuantityUpdate(item.product, (item.quantity || 1) + 1)}
                                                    disabled={loading[`quantity-${item.product.id}`]}
                                                    aria-label="Increase quantity"
                                                >
                                                    <FaPlus />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="item-total">
                                            <div className="total-price">
                                                {formatPrice((item.product.price || 0) * (item.quantity || 1))}
                                            </div>
                                        </div>

                                        <div className="item-actions">
                                            {!isInWishlist(item.product.id) && (
                                                <button
                                                    className="action-btn wishlist-btn"
                                                    onClick={() => handleAddToWishlist(item.product)}
                                                    disabled={loading[`wishlist-${item.product.id}`]}
                                                    title="Move to Wishlist"
                                                    aria-label="Add to wishlist"
                                                >
                                                    <FaHeart />
                                                </button>
                                            )}

                                            <button
                                                className="action-btn remove-btn"
                                                onClick={() => handleRemoveFromCart(item.product)}
                                                disabled={loading[`cart-${item.product.id}`]}
                                                title="Remove from Cart"
                                                aria-label="Remove from cart"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cart-summary">
                            <div className="summary-card">
                                <h3>Order Summary</h3>

                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(calculations.subtotal)}</span>
                                </div>

                                <div className="summary-row">
                                    <span>Shipping:</span>
                                    <span>{calculations.shipping === 0 ? 'Free' : formatPrice(calculations.shipping)}</span>
                                </div>

                                <div className="summary-row">
                                    <span>Tax:</span>
                                    <span>{formatPrice(calculations.tax)}</span>
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row total">
                                    <span>Total:</span>
                                    <span>{formatPrice(calculations.total)}</span>
                                </div>

                                {calculations.shipping > 0 && (
                                    <div className="free-shipping-notice">
                                        Add {formatPrice(50 - calculations.subtotal)} more for free shipping!
                                    </div>
                                )}

                                <CustomSubmitButton
                                    type="button"
                                    label="Proceed to Checkout"
                                    btnClassName="default-submit-btn checkout-btn"
                                    onClick={() => {
                                        // Handle checkout
                                        console.log('Proceeding to checkout...');
                                    }}
                                />

                                <Link to="/product" className="continue-shopping">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
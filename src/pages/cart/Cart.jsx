// pages/cart/Cart.jsx
import React, { useEffect, useState } from 'react';
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

    useEffect(() => {
        getCartItems(); // Page load এ cart refresh করুন
    }, []);

    const handleRemoveFromCart = async (product) => {
        setLoading(prev => ({...prev, [`cart-${product.id}`]: true}));
        const success = await removeFromCart(product);
        if (!success) {
            // Error handling already done in context
        }
        setLoading(prev => ({...prev, [`cart-${product.id}`]: false}));
    };

    const handleAddToWishlist = async (product) => {
        setLoading(prev => ({...prev, [`wishlist-${product.id}`]: true}));
        const success = await addToWishlist(product);
        setLoading(prev => ({...prev, [`wishlist-${product.id}`]: false}));
        return success;
    };

    const handleQuantityUpdate = async (product, newQuantity) => {
        if (newQuantity < 1) return;

        setLoading(prev => ({...prev, [`quantity-${product.id}`]: true}));
        const success = await updateCartQuantity(product, newQuantity);
        if (!success) {
            // Error toast already shown in context
        }
        setLoading(prev => ({...prev, [`quantity-${product.id}`]: false}));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
        return total + (item.product?.price * (item.quantity || 1));
    }, 0);

    const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    if (cartLoading) {
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

    return (
        <div className="cart-page">
            <div className="container">
                <div className="cart-header">
                    <h1>
                        <FaShoppingCart className="page-icon" />
                        Shopping Cart
                    </h1>
                    <p className="cart-count">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {cartItems.length === 0 ? (
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
                            {cartItems.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="item-image">
                                        <img
                                            src={item.product?.image
                                                ? `http://localhost:8000/storage/${item.product.image}`
                                                : '/placeholder-image.png'
                                            }
                                            alt={item.product?.name}
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.png';
                                            }}
                                        />
                                    </div>

                                    <div className="item-details">
                                        <h3 className="item-name">{item.product?.name}</h3>
                                        <p className="item-description">{item.product?.description}</p>
                                        <div className="item-price">{formatPrice(item.product?.price)}</div>
                                    </div>

                                    <div className="item-quantity">
                                        <label>Quantity:</label>
                                        <div className="quantity-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleQuantityUpdate(item.product, (item.quantity || 1) - 1)}
                                                disabled={loading[`quantity-${item.product.id}`] || (item.quantity || 1) <= 1}
                                            >
                                                <FaMinus />
                                            </button>
                                            <span className="quantity">{item.quantity || 1}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleQuantityUpdate(item.product, (item.quantity || 1) + 1)}
                                                disabled={loading[`quantity-${item.product.id}`]}
                                            >
                                                <FaPlus />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="item-total">
                                        <div className="total-price">
                                            {formatPrice(item.product?.price * (item.quantity || 1))}
                                        </div>
                                    </div>

                                    <div className="item-actions">
                                        {!isInWishlist(item.product.id) && (
                                            <button
                                                className="action-btn wishlist-btn"
                                                onClick={() => handleAddToWishlist(item.product)}
                                                disabled={loading[`wishlist-${item.product.id}`]}
                                                title="Move to Wishlist"
                                            >
                                                <FaHeart />
                                            </button>
                                        )}

                                        <button
                                            className="action-btn remove-btn"
                                            onClick={() => handleRemoveFromCart(item.product)}
                                            disabled={loading[`cart-${item.product.id}`]}
                                            title="Remove from Cart"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary">
                            <div className="summary-card">
                                <h3>Order Summary</h3>

                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>

                                <div className="summary-row">
                                    <span>Shipping:</span>
                                    <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                                </div>

                                <div className="summary-row">
                                    <span>Tax:</span>
                                    <span>{formatPrice(tax)}</span>
                                </div>

                                <div className="summary-divider"></div>

                                <div className="summary-row total">
                                    <span>Total:</span>
                                    <span>{formatPrice(total)}</span>
                                </div>

                                {shipping > 0 && (
                                    <div className="free-shipping-notice">
                                        Add {formatPrice(50 - subtotal)} more for free shipping!
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
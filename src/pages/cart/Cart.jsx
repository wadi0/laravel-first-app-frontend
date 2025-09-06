// pages/cart/Cart.jsx - Fixed mobile layout structure
import React, {useEffect, useState, useCallback} from 'react';
import {FaShoppingCart, FaTrash, FaHeart, FaMinus, FaPlus} from 'react-icons/fa';
import {Link, useNavigate} from 'react-router-dom';
import './cart.scss';
import {useApp} from "../../components/context/AppContext.jsx";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import CustomLoader from "../../components/customLoader/CustomLoader.jsx";
import path from "../../routes/path.jsx";

const Cart = () => {
    const navigate = useNavigate();
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
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Only load cart once when component mounts
    useEffect(() => {
        if (!hasLoadedOnce) {
            getCartItems();
            setHasLoadedOnce(true);
        }
    }, []);

    // Handle individual item selection
    const handleItemSelect = useCallback((itemId, isSelected) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(itemId);
            } else {
                newSet.delete(itemId);
            }

            // Update select all state
            const totalItems = cartItems?.length || 0;
            setSelectAll(newSet.size === totalItems && totalItems > 0);

            return newSet;
        });
    }, [cartItems]);

    // Handle select all toggle
    const handleSelectAll = useCallback(() => {
        if (selectAll) {
            // Deselect all
            setSelectedItems(new Set());
            setSelectAll(false);
        } else {
            // Select all
            const allItemIds = cartItems?.map(item => item.id) || [];
            setSelectedItems(new Set(allItemIds));
            setSelectAll(true);
        }
    }, [selectAll, cartItems]);

    // Handle proceed to checkout
    const handleProceedToCheckout = useCallback(() => {
        if (selectedItems.size === 0) {
            alert("Please select at least one item to checkout!");
            return;
        }

        // Get selected cart items
        const selectedCartItems = cartItems?.filter(item => selectedItems.has(item.id)) || [];

        // Navigate to checkout with selected items
        navigate(path.checkout, {
            state: {
                selectedItems: selectedCartItems,
                selectedItemIds: Array.from(selectedItems)
            }
        });
    }, [selectedItems, cartItems, navigate]);

    const handleRemoveFromCart = useCallback(async (product) => {
        if (!product || loading[`cart-${product.id}`]) return;

        setLoading(prev => ({...prev, [`cart-${product.id}`]: true}));
        try {
            const success = await removeFromCart(product);
            if (success) {
                // Remove from selected items if it was selected
                setSelectedItems(prev => {
                    const newSet = new Set(prev);
                    // Find the cart item id that corresponds to this product
                    const cartItem = cartItems?.find(item => item.product?.id === product.id);
                    if (cartItem) {
                        newSet.delete(cartItem.id);
                    }
                    return newSet;
                });
            }
        } catch (error) {
            console.error('Remove from cart error:', error);
        } finally {
            setLoading(prev => ({...prev, [`cart-${product.id}`]: false}));
        }
    }, [removeFromCart, loading, cartItems]);

    const handleAddToWishlist = useCallback(async (product) => {
        if (!product || loading[`wishlist-${product.id}`]) return;

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

    // Calculate selected items total
    const selectedItemsCalculation = React.useMemo(() => {
        const selectedCartItems = cartItems?.filter(item => selectedItems.has(item.id)) || [];

        const subtotal = selectedCartItems.reduce((total, item) => {
            const price = parseFloat(item.product?.price || 0);
            const quantity = parseInt(item.quantity || 1);
            return total + (price * quantity);
        }, 0);

        const shipping = subtotal > 50 ? 0 : 10;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total, itemCount: selectedCartItems.length };
    }, [cartItems, selectedItems]);

    // ✅ Hook to detect mobile screen
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    const cartItemsArray = cartItems || [];

    return (
        <div className="cart-page">
            <CustomLoader isLoading={cartLoading}/>
            {!cartLoading && (
                <div className="container">
                    <div className="cart-header">
                        <h1>
                            <FaShoppingCart className="page-icon"/>
                            Shopping Cart
                        </h1>
                        <p className="cart-count">
                            {cartItemsArray.length} {cartItemsArray.length === 1 ? 'item' : 'items'} in your cart
                        </p>
                    </div>

                    {cartItemsArray.length === 0 ? (
                        <div className="empty-cart">
                            <div className="empty-icon">
                                <FaShoppingCart/>
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
                                {/* Select All Header */}
                                <div className="cart-header-controls">
                                    <label className="select-all-container">
                                        <input
                                            type="checkbox"
                                            checked={selectAll}
                                            onChange={handleSelectAll}
                                            className="select-all-checkbox"
                                        />
                                        <span className="checkmark"></span>
                                        <span className="select-all-text">
                                            Select All ({cartItemsArray.length} items)
                                        </span>
                                    </label>

                                    {selectedItems.size > 0 && (
                                        <div className="selected-info">
                                            {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                                        </div>
                                    )}
                                </div>

                                {cartItemsArray.map((item) => {
                                    if (!item || !item.product) {
                                        console.warn('Invalid cart item:', item);
                                        return null;
                                    }

                                    const isSelected = selectedItems.has(item.id);

                                    return (
                                        <div
                                            key={`cart-item-${item.id}`}
                                            className={`cart-item ${isSelected ? 'selected' : ''}`}
                                        >
                                            {isMobile ? (
                                                // ✅ IMPROVED: Much better mobile layout
                                                <div className="mobile-card-layout">
                                                    {/* Top section */}
                                                    <div className="mobile-top-section">
                                                        <div className="item-checkbox">
                                                            <label className="checkbox-container">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                                                                    className="item-checkbox-input"
                                                                />
                                                                <span className="checkmark"></span>
                                                            </label>
                                                        </div>

                                                        <div className="item-image">
                                                            <img
                                                                src={getImageUrl(item.product.image)}
                                                                alt={item.product.name || 'Product'}
                                                                onError={(e) => {
                                                                    e.target.src = '/placeholder-image.png';
                                                                }}
                                                            />
                                                        </div>

                                                        <div className="mobile-content">
                                                            <div className="mobile-details-actions">
                                                                <div className="item-details">
                                                                    <h3 className="item-name">{item.product.name || 'Unknown Product'}</h3>
                                                                    <p className="item-description">{item.product.description || 'No description'}</p>
                                                                    <div className="item-price">{formatPrice(item.product.price || 0)}</div>
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
                                                                            <FaHeart/>
                                                                        </button>
                                                                    )}

                                                                    <button
                                                                        className="action-btn remove-btn"
                                                                        onClick={() => handleRemoveFromCart(item.product)}
                                                                        disabled={loading[`cart-${item.product.id}`]}
                                                                        title="Remove from Cart"
                                                                        aria-label="Remove from cart"
                                                                    >
                                                                        <FaTrash/>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Bottom section - Quantity and Total */}
                                                    <div className="mobile-quantity-total">
                                                        <div className="item-quantity">
                                                            <label>Quantity</label>
                                                            <div className="quantity-controls">
                                                                <button
                                                                    className="qty-btn"
                                                                    onClick={() => handleQuantityUpdate(item.product, (item.quantity || 1) - 1)}
                                                                    disabled={loading[`quantity-${item.product.id}`] || (item.quantity || 1) <= 1}
                                                                    aria-label="Decrease quantity"
                                                                >
                                                                    <FaMinus/>
                                                                </button>
                                                                <span className="quantity">{item.quantity || 1}</span>
                                                                <button
                                                                    className="qty-btn"
                                                                    onClick={() => handleQuantityUpdate(item.product, (item.quantity || 1) + 1)}
                                                                    disabled={loading[`quantity-${item.product.id}`]}
                                                                    aria-label="Increase quantity"
                                                                >
                                                                    <FaPlus/>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="item-total">
                                                            <span className="total-label">Total</span>
                                                            <div className="total-price">
                                                                {formatPrice((item.product.price || 0) * (item.quantity || 1))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Desktop layout (unchanged)
                                                <>
                                                    <div className="item-checkbox">
                                                        <label className="checkbox-container">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={(e) => handleItemSelect(item.id, e.target.checked)}
                                                                className="item-checkbox-input"
                                                            />
                                                            <span className="checkmark"></span>
                                                        </label>
                                                    </div>

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

                                                    <div className="quantity-total-section">
                                                        <div className="item-quantity">
                                                            <label>Quantity:</label>
                                                            <div className="quantity-controls">
                                                                <button
                                                                    className="qty-btn"
                                                                    onClick={() => handleQuantityUpdate(item.product, (item.quantity || 1) - 1)}
                                                                    disabled={loading[`quantity-${item.product.id}`] || (item.quantity || 1) <= 1}
                                                                    aria-label="Decrease quantity"
                                                                >
                                                                    <FaMinus/>
                                                                </button>
                                                                <span className="quantity">{item.quantity || 1}</span>
                                                                <button
                                                                    className="qty-btn"
                                                                    onClick={() => handleQuantityUpdate(item.product, (item.quantity || 1) + 1)}
                                                                    disabled={loading[`quantity-${item.product.id}`]}
                                                                    aria-label="Increase quantity"
                                                                >
                                                                    <FaPlus/>
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="item-total">
                                                            <span className="total-label">Total:</span>
                                                            <div className="total-price">
                                                                {formatPrice((item.product.price || 0) * (item.quantity || 1))}
                                                            </div>
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
                                                                <FaHeart/>
                                                            </button>
                                                        )}

                                                        <button
                                                            className="action-btn remove-btn"
                                                            onClick={() => handleRemoveFromCart(item.product)}
                                                            disabled={loading[`cart-${item.product.id}`]}
                                                            title="Remove from Cart"
                                                            aria-label="Remove from cart"
                                                        >
                                                            <FaTrash/>
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Updated Cart Summary - Only for Selected Items */}
                            <div className="cart-summary">
                                <div className="summary-card">
                                    <h3>Order Summary</h3>

                                    {selectedItems.size === 0 ? (
                                        <div className="no-selection-message">
                                            <p>Select items to see pricing</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="selected-items-info">
                                                <p>{selectedItemsCalculation.itemCount} item{selectedItemsCalculation.itemCount !== 1 ? 's' : ''} selected</p>
                                            </div>

                                            <div className="summary-row">
                                                <span>Subtotal:</span>
                                                <span>{formatPrice(selectedItemsCalculation.subtotal)}</span>
                                            </div>

                                            <div className="summary-row">
                                                <span>Shipping:</span>
                                                <span>{selectedItemsCalculation.shipping === 0 ? 'Free' : formatPrice(selectedItemsCalculation.shipping)}</span>
                                            </div>

                                            <div className="summary-row">
                                                <span>Tax:</span>
                                                <span>{formatPrice(selectedItemsCalculation.tax)}</span>
                                            </div>

                                            <div className="summary-divider"></div>

                                            <div className="summary-row total">
                                                <span>Total:</span>
                                                <span>{formatPrice(selectedItemsCalculation.total)}</span>
                                            </div>

                                            {selectedItemsCalculation.shipping > 0 && (
                                                <div className="free-shipping-notice">
                                                    Add {formatPrice(50 - selectedItemsCalculation.subtotal)} more for free shipping!
                                                </div>
                                            )}
                                        </>
                                    )}

                                    <CustomSubmitButton
                                        type="button"
                                        label="Proceed to Checkout"
                                        btnClassName="default-submit-btn checkout-btn"
                                        onClick={handleProceedToCheckout}
                                        disabled={selectedItems.size === 0}
                                    />

                                    <Link to="/product" className="continue-shopping">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Cart;
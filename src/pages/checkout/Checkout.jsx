// pages/checkout/Checkout.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaArrowLeft, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import './checkout.scss';
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import CustomLoader from "../../components/customLoader/CustomLoader.jsx";
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
import path from "../../routes/path.jsx";

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get selected items from location state
    const { selectedItems = [], selectedItemIds = [] } = location.state || {};

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shipping_address: '',
        phone: '',
        payment_method: 'sslcommerz',
        notes: ''
    });
    const [errors, setErrors] = useState({});

    // Redirect if no selected items
    if (!selectedItems || selectedItems.length === 0) {
        return (
            <div className="checkout-page">
                <div className="container">
                    <div className="no-items">
                        <h2>No Items Selected</h2>
                        <p>Please select items from your cart to proceed with checkout.</p>
                        <CustomSubmitButton
                            type="button"
                            label="Back to Cart"
                            btnClassName="default-submit-btn"
                            onClick={() => navigate(path.cart)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Calculate totals
    const calculations = useMemo(() => {
        const subtotal = selectedItems.reduce((total, item) => {
            const price = parseFloat(item.product?.price || 0);
            const quantity = parseInt(item.quantity || 1);
            return total + (price * quantity);
        }, 0);

        const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
        const tax = subtotal * 0.08; // 8% tax
        const total = subtotal + shipping + tax;

        return { subtotal, shipping, tax, total };
    }, [selectedItems]);

    // Handle form input changes
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    // Validate form
    const validateForm = useCallback(() => {
        const newErrors = {};

        if (!formData.shipping_address.trim()) {
            newErrors.shipping_address = 'Shipping address is required';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (!formData.payment_method) {
            newErrors.payment_method = 'Please select a payment method';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Handle order placement
    const handlePlaceOrder = useCallback(async () => {
        if (loading) return;

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                cart_ids: selectedItemIds,
                shipping_address: formData.shipping_address,
                phone: formData.phone,
                payment_method: formData.payment_method,
                notes: formData.notes
            };

            console.log('Placing order with data:', orderData);

            const response = await AxiosServices.post(ApiUrlServices.ORDER_PLACE, orderData);

            console.log('Order response:', response);

            if (response.data && response.data.order) {
                const order = response.data.order;

                // If payment method is SSLCommerz, redirect to payment
                if (formData.payment_method === 'sslcommerz') {
                    // Convert USD to BDT for payment gateway
                    const amountInBDT = Math.round((calculations.total * 120) * 100) / 100;

                    const paymentData = {
                        amount: amountInBDT,
                        order_id: order.id,
                        name: "Customer", // You can get this from user profile
                        email: "customer@example.com", // You can get this from user profile
                        address: formData.shipping_address,
                        phone: formData.phone
                    };

                    const paymentResponse = await AxiosServices.post(ApiUrlServices.PAYMENT_INIT, paymentData);

                    if (paymentResponse.data.status === "success" && paymentResponse.data.redirect_url) {
                        window.location.href = paymentResponse.data.redirect_url;
                        return;
                    }
                }

                // ✅ FIXED: Correct navigation syntax
                navigate(path.order_success(order.id), {
                    state: { order: order }
                });
            }
        } catch (error) {
            console.error('Order placement error:', error);

            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                alert(error.response?.data?.message || 'Failed to place order. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [loading, validateForm, selectedItemIds, formData, calculations.total, navigate]);

    const formatPrice = useCallback((price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }, []);

    const getImageUrl = useCallback((imageUrl) => {
        if (!imageUrl || imageUrl.trim() === '') {
            return '/placeholder-image.png';
        }
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        return `http://localhost:8000/storage/${imageUrl}`;
    }, []);

    return (
        <div className="checkout-page">
            <CustomLoader isLoading={loading} />

            <div className="container">
                <div className="checkout-header">
                    <button
                        className="back-btn"
                        onClick={() => navigate(path.cart)}
                        aria-label="Back to cart"
                    >
                        <FaArrowLeft />
                    </button>
                    <h1>
                        <FaShoppingBag className="page-icon" />
                        Checkout
                    </h1>
                </div>

                <div className="checkout-content">
                    {/* Order Items Section */}
                    <div className="checkout-section">
                        <h2>Order Items ({selectedItems.length} items)</h2>
                        <div className="order-items">
                            {selectedItems.map((item) => (
                                <div key={`checkout-item-${item.id}`} className="checkout-item">
                                    <div className="item-image">
                                        <img
                                            src={getImageUrl(item.product?.image)}
                                            alt={item.product?.name || 'Product'}
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.png';
                                            }}
                                        />
                                    </div>
                                    <div className="item-info">
                                        <h3>{item.product?.name || 'Unknown Product'}</h3>
                                        <p className="item-description">
                                            {item.product?.description || 'No description'}
                                        </p>
                                        <div className="item-pricing">
                                            <span className="price">{formatPrice(item.product?.price || 0)}</span>
                                            <span className="quantity">x {item.quantity || 1}</span>
                                            <span className="total">
                                                {formatPrice((item.product?.price || 0) * (item.quantity || 1))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="checkout-section">
                        <h2>Shipping Information</h2>
                        <div className="form-group">
                            <label htmlFor="shipping_address">
                                Shipping Address <span className="required">*</span>
                            </label>
                            <textarea
                                id="shipping_address"
                                name="shipping_address"
                                value={formData.shipping_address}
                                onChange={handleInputChange}
                                className={errors.shipping_address ? 'error' : ''}
                                placeholder="Enter your full shipping address..."
                                rows={4}
                                required
                            />
                            {errors.shipping_address && (
                                <span className="error-message">{errors.shipping_address}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">
                                Phone Number <span className="required">*</span>
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={errors.phone ? 'error' : ''}
                                placeholder="Enter your phone number"
                                required
                            />
                            {errors.phone && (
                                <span className="error-message">{errors.phone}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="notes">Order Notes (Optional)</label>
                            <textarea
                                id="notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Any special instructions for your order..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="checkout-section">
                        <h2>Payment Method</h2>
                        <div className="payment-methods">
                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="sslcommerz"
                                    checked={formData.payment_method === 'sslcommerz'}
                                    onChange={handleInputChange}
                                />
                                <div className="payment-info">
                                    <FaCreditCard className="payment-icon" />
                                    <div>
                                        <strong>Online Payment</strong>
                                        <p>Pay securely with credit/debit card or mobile banking</p>
                                    </div>
                                </div>
                            </label>

                            <label className="payment-option">
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="cod"
                                    checked={formData.payment_method === 'cod'}
                                    onChange={handleInputChange}
                                />
                                <div className="payment-info">
                                    <FaMoneyBillWave className="payment-icon" />
                                    <div>
                                        <strong>Cash on Delivery</strong>
                                        <p>Pay when you receive your order</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                        {errors.payment_method && (
                            <span className="error-message">{errors.payment_method}</span>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-section">
                        <h2>Order Summary</h2>
                        <div className="order-summary">
                            <div className="summary-row">
                                <span>Subtotal ({selectedItems.length} items):</span>
                                <span>{formatPrice(calculations.subtotal)}</span>
                            </div>

                            <div className="summary-row">
                                <span>Shipping Fee:</span>
                                <span>{calculations.shipping === 0 ? 'Free' : formatPrice(calculations.shipping)}</span>
                            </div>

                            <div className="summary-row">
                                <span>Tax (8%):</span>
                                <span>{formatPrice(calculations.tax)}</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="summary-row total-row">
                                <span>Total Amount:</span>
                                <span className="total-amount">{formatPrice(calculations.total)}</span>
                            </div>

                            {calculations.shipping > 0 && (
                                <div className="free-shipping-notice">
                                    Add {formatPrice(50 - calculations.subtotal)} more for free shipping!
                                </div>
                            )}
                        </div>

                        <div className="checkout-actions">
                            <CustomSubmitButton
                                type="button"
                                label={loading ? "Placing Order..." : "Place Order"}
                                btnClassName="default-submit-btn place-order-btn"
                                onClick={handlePlaceOrder}
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate(path.cart)}
                            >
                                Back to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
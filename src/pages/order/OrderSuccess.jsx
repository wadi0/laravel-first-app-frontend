import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaHome } from 'react-icons/fa';
import './orderSuccess.scss'; // ✅ Fixed: Correct SCSS file name
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
import path from "../../routes/path.jsx";

const OrderSuccess = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(location.state?.order || null);
    const [loading, setLoading] = useState(!order);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!order && orderId) {
            fetchOrderDetails();
        }
    }, [orderId, order]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await AxiosServices.get(ApiUrlServices.ORDER_BY_ID(orderId));
            setOrder(response.data);
        } catch (error) {
            console.error('Error fetching order details:', error); // ✅ Fixed: Correct error message
            setError('Failed to load order details'); // ✅ Fixed: Correct error message
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl || imageUrl.trim() === '') {
            return '/placeholder-image.png';
        }
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        return `http://localhost:8000/storage/${imageUrl}`;
    };

    const getStatusColor = (status) => {
        const statusColors = {
            'pending': '#f39c12',
            'confirmed': '#3498db',
            'processing': '#9b59b6',
            'shipped': '#e67e22',
            'delivered': '#27ae60',
            'cancelled': '#e74c3c'
        };
        return statusColors[status] || '#7f8c8d';
    };

    const getPaymentStatusColor = (status) => {
        const statusColors = {
            'pending': '#f39c12',
            'paid': '#27ae60',
            'failed': '#e74c3c',
            'refunded': '#3498db'
        };
        return statusColors[status] || '#7f8c8d';
    };

    if (loading) {
        return (
            <div className="order-success-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-success-page">
                <div className="container">
                    <div className="error-container">
                        <h2>Order Not Found</h2>
                        <p>{error || 'The order you are looking for could not be found.'}</p> {/* ✅ Fixed: Correct error message */}
                        <Link to={path.orders}>
                            <CustomSubmitButton
                                type="button"
                                label="View All Orders"
                                btnClassName="default-submit-btn"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-success-page">
            <div className="container">
                <div className="success-header">
                    <div className="success-icon">
                        <FaCheckCircle />
                    </div>
                    <h1>Order Placed Successfully!</h1>
                    <p className="success-message">
                        Thank you for your purchase. Your order has been confirmed and is being processed.
                    </p>
                </div>

                <div className="order-details-card">
                    <div className="order-header">
                        <div className="order-info">
                            <h2>Order #{order.order_number}</h2>
                            <p className="order-date">
                                Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div className="order-status">
                            <div className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                            <div className="payment-status-badge" style={{ backgroundColor: getPaymentStatusColor(order.payment_status) }}>
                                Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                            </div>
                        </div>
                    </div>

                    <div className="order-content">
                        {/* Order Items */}
                        <div className="section">
                            <h3>Order Items</h3>
                            <div className="order-items">
                                {order.order_items?.map((item) => (
                                    <div key={`order-item-${item.id}`} className="order-item">
                                        <div className="item-image">
                                            <img
                                                src={getImageUrl(item.product?.image)}
                                                alt={item.product?.name || 'Product'}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-image.png';
                                                }}
                                            />
                                        </div>
                                        <div className="item-details">
                                            <h4>{item.product?.name || 'Product'}</h4>
                                            <p>{item.product?.description || 'No description'}</p>
                                            <div className="item-pricing">
                                                <span className="price">{formatPrice(item.price)}</span>
                                                <span className="quantity">x {item.quantity}</span>
                                                <span className="total">{formatPrice(item.total)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Information */}
                        <div className="section">
                            <h3>Shipping Information</h3>
                            <div className="shipping-info">
                                <div className="info-row">
                                    <strong>Address:</strong>
                                    <span>{order.shipping_address}</span>
                                </div>
                                <div className="info-row">
                                    <strong>Phone:</strong>
                                    <span>{order.phone}</span>
                                </div>
                                <div className="info-row">
                                    <strong>Payment Method:</strong>
                                    <span>
                                        {order.payment_method === 'sslcommerz' ? 'Online Payment' : 'Cash on Delivery'}
                                    </span>
                                </div>
                                {order.notes && (
                                    <div className="info-row">
                                        <strong>Notes:</strong>
                                        <span>{order.notes}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="section">
                            <h3>Order Summary</h3>
                            <div className="order-summary">
                                <div className="summary-row">
                                    <span>Subtotal:</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping Fee:</span>
                                    <span>{order.shipping_fee === 0 ? 'Free' : formatPrice(order.shipping_fee)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax:</span>
                                    <span>{formatPrice(order.tax_amount)}</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row total-row">
                                    <span>Total Amount:</span>
                                    <span className="total-amount">{formatPrice(order.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
    <Link to={path.orders}>
        <CustomSubmitButton
            type="button"
            label="View All Orders"
            btnClassName="default-submit-btn secondary"
        />
    </Link>

    {/* ✅ Updated: Add Track Order link for trackable orders */}
    {(order.status !== 'delivered' && order.status !== 'cancelled') && (
        <Link to={path.track_order(order.id)}>
            <CustomSubmitButton
                type="button"
                label="Track Your Order"
                btnClassName="default-submit-btn"
            />
        </Link>
    )}

    {/* For delivered orders, show different text */}
    {order.status === 'delivered' && (
        <Link to={path.track_order(order.id)}>
            <CustomSubmitButton
                type="button"
                label="View Delivery Details"
                btnClassName="default-submit-btn"
            />
        </Link>
    )}

    {/* Continue shopping link */}
    <Link to={path.home}>
        <CustomSubmitButton
            type="button"
            label="Continue Shopping"
            btnClassName="default-submit-btn secondary"
        />
    </Link>
</div>
            </div>
        </div>
    );
};

export default OrderSuccess;
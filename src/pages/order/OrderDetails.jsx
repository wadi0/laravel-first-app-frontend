// pages/order-details/OrderDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa';
import './orderDetails.scss';
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import CustomLoader from "../../components/customLoader/CustomLoader.jsx";
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
import path from "../../routes/path.jsx";

const OrderDetails = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AxiosServices.get(ApiUrlServices.ORDER_BY_ID(orderId));
            setOrder(response.data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            setError('Failed to load order details');
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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <FaClock className="status-icon pending" />;
            case 'confirmed':
            case 'processing':
                return <FaTruck className="status-icon processing" />;
            case 'shipped':
                return <FaTruck className="status-icon shipped" />;
            case 'delivered':
                return <FaCheckCircle className="status-icon delivered" />;
            default:
                return <FaClock className="status-icon" />;
        }
    };

    const getStatusProgress = (status) => {
        const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
        const currentIndex = statusOrder.indexOf(status);
        return ((currentIndex + 1) / statusOrder.length) * 100;
    };

    if (loading) {
        return (
            <div className="order-details-page">
                <CustomLoader isLoading={true} />
                <div className="container">
                    <div className="loading-container">
                        <p>Loading order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-details-page">
                <div className="container">
                    <div className="error-container">
                        <h2>Order Not Found</h2>
                        <p>{error || 'The order you are looking for could not be found.'}</p>
                        <Link to={path.orders}>
                            <CustomSubmitButton
                                type="button"
                                label="Back to Orders"
                                btnClassName="default-submit-btn"
                            />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="order-details-page">
            <div className="container">
                <div className="page-header">
                    <Link to={path.orders} className="back-link">
                        <FaArrowLeft />
                        Back to Orders
                    </Link>
                    <h1>Order #{order.order_number}</h1>
                </div>

                {/* Order Status Progress */}
                <div className="status-progress-card">
                    <div className="progress-header">
                        <div className="status-info">
                            {getStatusIcon(order.status)}
                            <div>
                                <h3>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</h3>
                                <p>Order placed on {new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="payment-status">
                            <span className={`payment-badge ${order.payment_status}`}>
                                Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${getStatusProgress(order.status)}%` }}
                        ></div>
                    </div>
                </div>

                <div className="order-content">
                    {/* Order Items */}
                    <div className="content-section">
                        <h2>Order Items</h2>
                        <div className="order-items">
                            {order.order_items?.map((item) => (
                                <div key={`item-${item.id}`} className="order-item">
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
                                            <span className="price">
                                                {formatPrice(item.price)} x {item.quantity}
                                            </span>
                                            <span className="total">{formatPrice(item.total)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="content-section">
                        <h2>Order Summary</h2>
                        <div className="summary-details">
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
                            <div className="summary-row total">
                                <span>Total Amount:</span>
                                <span>{formatPrice(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="content-section">
                        <h2>Shipping Information</h2>
                        <div className="shipping-details">
                            <div className="detail-row">
                                <strong>Address:</strong>
                                <span>{order.shipping_address}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Phone:</strong>
                                <span>{order.phone}</span>
                            </div>
                            <div className="detail-row">
                                <strong>Payment Method:</strong>
                                <span>
                                    {order.payment_method === 'sslcommerz' ? 'Online Payment' : 'Cash on Delivery'}
                                </span>
                            </div>
                            {order.notes && (
                                <div className="detail-row">
                                    <strong>Notes:</strong>
                                    <span>{order.notes}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="action-buttons">
    <Link to={path.orders}>
        <CustomSubmitButton
            type="button"
            label="Back to Orders"
            btnClassName="default-submit-btn secondary"
        />
    </Link>

    {/* ✅ Updated: Add Track Order link for non-delivered orders */}
    {(order.status !== 'delivered' && order.status !== 'cancelled') && (
        <Link to={path.track_order(order.id)}>
            <CustomSubmitButton
                type="button"
                label="Track Order"
                btnClassName="default-submit-btn"
            />
        </Link>
    )}

    {/* Show tracking history for delivered orders */}
    {order.status === 'delivered' && (
        <Link to={path.track_order(order.id)}>
            <CustomSubmitButton
                type="button"
                label="View Tracking History"
                btnClassName="default-submit-btn"
            />
        </Link>
    )}
</div>
            </div>
        </div>
    );
};

export default OrderDetails;
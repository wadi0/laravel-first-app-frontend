// pages/track-order/TrackOrder.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    FaArrowLeft,
    FaBox,
    FaCheckCircle,
    FaClock,
    FaTruck,
    FaHome,
    FaMapMarkerAlt,
    FaCalendarAlt
} from 'react-icons/fa';
import './trackOrder.scss';
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import CustomLoader from "../../components/customLoader/CustomLoader.jsx";
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
import path from "../../routes/path.jsx";

const TrackOrder = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trackingHistory, setTrackingHistory] = useState([]);

    useEffect(() => {
        if (orderId) {
            fetchOrderTracking();
        }
    }, [orderId]);

    const fetchOrderTracking = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await AxiosServices.get(ApiUrlServices.ORDER_BY_ID(orderId));
            setOrder(response.data);

            // Generate tracking history based on order status
            generateTrackingHistory(response.data);
        } catch (error) {
            console.error('Error fetching order tracking:', error);
            setError('Failed to load order tracking information');
        } finally {
            setLoading(false);
        }
    };

    const generateTrackingHistory = (orderData) => {
        const baseDate = new Date(orderData.created_at);
        const history = [];

        // Order placed (always exists)
        history.push({
            status: 'placed',
            title: 'Order Placed',
            description: 'Your order has been successfully placed and received.',
            timestamp: baseDate,
            icon: FaBox,
            completed: true
        });

        // Order confirmed
        if (['confirmed', 'processing', 'shipped', 'delivered'].includes(orderData.status)) {
            const confirmedDate = new Date(baseDate.getTime() + (2 * 60 * 60 * 1000)); // +2 hours
            history.push({
                status: 'confirmed',
                title: 'Order Confirmed',
                description: 'Your order has been confirmed and is being prepared.',
                timestamp: confirmedDate,
                icon: FaCheckCircle,
                completed: true
            });
        }

        // Processing
        if (['processing', 'shipped', 'delivered'].includes(orderData.status)) {
            const processingDate = new Date(baseDate.getTime() + (24 * 60 * 60 * 1000)); // +1 day
            history.push({
                status: 'processing',
                title: 'Processing',
                description: 'Your items are being picked and packed.',
                timestamp: processingDate,
                icon: FaBox,
                completed: true
            });
        }

        // Shipped
        if (['shipped', 'delivered'].includes(orderData.status)) {
            const shippedDate = new Date(baseDate.getTime() + (2 * 24 * 60 * 60 * 1000)); // +2 days
            history.push({
                status: 'shipped',
                title: 'Order Shipped',
                description: 'Your order is on the way to your delivery address.',
                timestamp: shippedDate,
                icon: FaTruck,
                completed: true,
                trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase()
            });
        }

        // Out for delivery (for delivered orders)
        if (orderData.status === 'delivered') {
            const outForDeliveryDate = new Date(baseDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // +3 days
            history.push({
                status: 'out_for_delivery',
                title: 'Out for Delivery',
                description: 'Your order is out for delivery and will arrive soon.',
                timestamp: outForDeliveryDate,
                icon: FaTruck,
                completed: true
            });
        }

        // Delivered
        if (orderData.status === 'delivered') {
            const deliveredDate = new Date(baseDate.getTime() + (4 * 24 * 60 * 60 * 1000)); // +4 days
            history.push({
                status: 'delivered',
                title: 'Delivered',
                description: 'Your order has been successfully delivered.',
                timestamp: deliveredDate,
                icon: FaHome,
                completed: true
            });
        }

        // Add future steps for non-delivered orders
        if (orderData.status !== 'delivered' && orderData.status !== 'cancelled') {
            const currentIndex = history.length;
            const nextSteps = [
                { status: 'processing', title: 'Processing', icon: FaBox },
                { status: 'shipped', title: 'Order Shipped', icon: FaTruck },
                { status: 'out_for_delivery', title: 'Out for Delivery', icon: FaTruck },
                { status: 'delivered', title: 'Delivered', icon: FaHome }
            ];

            nextSteps.forEach((step, index) => {
                if (!history.some(h => h.status === step.status)) {
                    const estimatedDate = new Date(baseDate.getTime() + ((currentIndex + index + 1) * 24 * 60 * 60 * 1000));
                    history.push({
                        ...step,
                        description: `Estimated ${step.title.toLowerCase()}`,
                        timestamp: estimatedDate,
                        completed: false,
                        estimated: true
                    });
                }
            });
        }

        setTrackingHistory(history);
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

    const getEstimatedDelivery = () => {
        if (!order) return null;

        const baseDate = new Date(order.created_at);
        let estimatedDays = 5; // Default 5 days

        switch (order.status) {
            case 'pending':
                estimatedDays = 5;
                break;
            case 'confirmed':
                estimatedDays = 4;
                break;
            case 'processing':
                estimatedDays = 3;
                break;
            case 'shipped':
                estimatedDays = 1;
                break;
            case 'delivered':
                return 'Delivered';
            default:
                estimatedDays = 5;
        }

        const estimatedDate = new Date(baseDate.getTime() + (estimatedDays * 24 * 60 * 60 * 1000));
        return estimatedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="track-order-page">
                <CustomLoader isLoading={true} />
                <div className="container">
                    <div className="loading-container">
                        <p>Loading order tracking...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="track-order-page">
                <div className="container">
                    <div className="error-container">
                        <h2>Tracking Information Not Available</h2>
                        <p>{error || 'Unable to find tracking information for this order.'}</p>
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
        <div className="track-order-page">
            <div className="container">
                <div className="page-header">
                    <Link to={path.orders} className="back-link">
                        <FaArrowLeft />
                        Back to Orders
                    </Link>
                    <h1>Track Order #{order.order_number}</h1>
                </div>

                {/* Order Status Overview */}
                <div className="status-overview-card">
                    <div className="status-header">
                        <div className="current-status">
                            <h2>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</h2>
                            <p>Order placed on {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="delivery-estimate">
                            <FaCalendarAlt className="calendar-icon" />
                            <div>
                                <span className="label">Estimated Delivery</span>
                                <span className="date">{getEstimatedDelivery()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-container">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${(trackingHistory.filter(h => h.completed).length / Math.max(trackingHistory.length, 4)) * 100}%`
                                }}
                            ></div>
                        </div>
                        <div className="progress-labels">
                            <span>Placed</span>
                            <span>Processing</span>
                            <span>Shipped</span>
                            <span>Delivered</span>
                        </div>
                    </div>
                </div>

                <div className="tracking-content">
                    {/* Tracking Timeline */}
                    <div className="tracking-timeline">
                        <h3>Order Timeline</h3>
                        <div className="timeline">
                            {trackingHistory.map((item, index) => {
                                const IconComponent = item.icon;
                                return (
                                    <div key={index} className={`timeline-item ${item.completed ? 'completed' : 'pending'}`}>
                                        <div className="timeline-icon">
                                            <IconComponent />
                                        </div>
                                        <div className="timeline-content">
                                            <div className="timeline-header">
                                                <h4>{item.title}</h4>
                                                <span className="timeline-date">
                                                    {item.estimated ? 'Est. ' : ''}
                                                    {item.timestamp.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: item.completed ? '2-digit' : undefined,
                                                        minute: item.completed ? '2-digit' : undefined
                                                    })}
                                                </span>
                                            </div>
                                            <p>{item.description}</p>
                                            {item.trackingNumber && (
                                                <div className="tracking-number">
                                                    <strong>Tracking Number:</strong> {item.trackingNumber}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Order Items & Details */}
                    <div className="order-sidebar">
                        {/* Order Items */}
                        <div className="order-items-card">
                            <h3>Order Items</h3>
                            <div className="items-list">
                                {order.order_items?.map((item) => (
                                    <div key={item.id} className="item-row">
                                        <img
                                            src={getImageUrl(item.product?.image)}
                                            alt={item.product?.name || 'Product'}
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.png';
                                            }}
                                        />
                                        <div className="item-details">
                                            <span className="item-name">{item.product?.name || 'Product'}</span>
                                            <span className="item-quantity">Qty: {item.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="delivery-address-card">
                            <h3>
                                <FaMapMarkerAlt />
                                Delivery Address
                            </h3>
                            <div className="address-details">
                                <p>{order.shipping_address}</p>
                                <div className="contact-info">
                                    <span>Phone: {order.phone}</span>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="order-summary-card">
                            <h3>Order Summary</h3>
                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Items ({order.order_items?.length || 0})</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>{order.shipping_fee === 0 ? 'Free' : formatPrice(order.shipping_fee)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax</span>
                                    <span>{formatPrice(order.tax_amount)}</span>
                                </div>
                                <div className="summary-divider"></div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>{formatPrice(order.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <Link to={path.order_success(order.id)}>
                        <CustomSubmitButton
                            type="button"
                            label="View Order Details"
                            btnClassName="default-submit-btn secondary"
                        />
                    </Link>

                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <CustomSubmitButton
                            type="button"
                            label="Contact Support"
                            btnClassName="default-submit-btn"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrackOrder;
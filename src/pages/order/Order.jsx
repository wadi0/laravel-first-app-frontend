// pages/orders/Orders.jsx
import React, {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router-dom';
import {FaShoppingBag, FaEye, FaFilter, FaSearch} from 'react-icons/fa';
import './order.scss';
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import CustomLoader from "../../components/customLoader/CustomLoader.jsx";
import AxiosServices from "../../components/network/AxiosServices.jsx";
import ApiUrlServices from "../../components/network/ApiUrlServices.jsx";
import path from "../../routes/path.jsx";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        payment_status: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    });

    useEffect(() => {
        fetchOrders();
    }, [filters, pagination.current_page]);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: pagination.current_page,
                per_page: pagination.per_page,
                ...filters
            });

            const response = await AxiosServices.get(`${ApiUrlServices.ORDERS}?${params}`);

            if (response.data) {
                setOrders(response.data.data || []);
                setPagination(prev => ({
                    ...prev,
                    current_page: response.data.current_page || 1,
                    last_page: response.data.last_page || 1,
                    total: response.data.total || 0
                }));
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.current_page, pagination.per_page]);

    const handleFilterChange = useCallback((e) => {
        const {name, value} = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPagination(prev => ({...prev, current_page: 1})); // Reset to first page
    }, []);

    const handlePageChange = useCallback((page) => {
        setPagination(prev => ({...prev, current_page: page}));
    }, []);

    const formatPrice = useCallback((price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }, []);

    const getStatusColor = useCallback((status) => {
        const statusColors = {
            'pending': '#f39c12',
            'confirmed': '#3498db',
            'processing': '#9b59b6',
            'shipped': '#e67e22',
            'delivered': '#27ae60',
            'cancelled': '#e74c3c'
        };
        return statusColors[status] || '#7f8c8d';
    }, []);

    const getPaymentStatusColor = useCallback((status) => {
        const statusColors = {
            'pending': '#f39c12',
            'paid': '#27ae60',
            'failed': '#e74c3c',
            'refunded': '#3498db'
        };
        return statusColors[status] || '#7f8c8d';
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

    const renderPagination = () => {
        if (pagination.last_page <= 1) return null;

        const pages = [];
        for (let i = 1; i <= pagination.last_page; i++) {
            pages.push(i);
        }

        return (
            <div className="pagination">
                <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="page-btn"
                >
                    Previous
                </button>

                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`page-btn ${pagination.current_page === page ? 'active' : ''}`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="page-btn"
                >
                    Next
                </button>
            </div>
        );
    };

    if (loading && orders.length === 0) {
        return (
            <div className="orders-page">
                <CustomLoader isLoading={true}/>
                <div className="container">
                    <div className="loading-container">
                        <p>Loading your orders...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <CustomLoader isLoading={loading}/>

            <div className="container">
                <div className="orders-header">
                    <h1>
                        <FaShoppingBag className="page-icon"/>
                        My Orders
                    </h1>
                    <p className="orders-count">
                        {pagination.total} {pagination.total === 1 ? 'order' : 'orders'} found
                    </p>
                </div>

                {/* Filters */}
                <div className="orders-filters">
                    <div className="filters-container">
                        <div className="filter-group">
                            <label>
                                <FaSearch/>
                                <input
                                    type="text"
                                    name="search"
                                    placeholder="Search by order number..."
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                />
                            </label>
                        </div>

                        <div className="filter-group">
                            <select
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <select
                                name="payment_status"
                                value={filters.payment_status}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Payment Status</option>
                                <option value="pending">Payment Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="error-container">
                        <h2>Error Loading Orders</h2>
                        <p>{error}</p>
                        <CustomSubmitButton
                            type="button"
                            label="Retry"
                            btnClassName="default-submit-btn"
                            onClick={fetchOrders}
                        />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="empty-orders">
                        <div className="empty-icon">
                            <FaShoppingBag/>
                        </div>
                        <h2>No Orders Found</h2>
                        <p>You haven't placed any orders yet or no orders match your filters.</p>
                        <Link to={path.product}>
                            <CustomSubmitButton
                                type="button"
                                label="Start Shopping"
                                btnClassName="default-submit-btn"
                            />
                        </Link>
                    </div>
                ) : (
                    <div className="orders-content">
                        <div className="orders-list">
                            {orders.map((order) => (
                                <div key={`order-${order.id}`} className="order-card">
                                    <div className="order-header">
                                        <div className="order-info">
                                            <h3>Order #{order.order_number}</h3>
                                            <p className="order-date">
                                                {new Date(order.created_at).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>

                                        <div className="order-badges">
                                            <span
                                                className="status-badge"
                                                style={{backgroundColor: getStatusColor(order.status)}}
                                            >
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                            <span
                                                className="payment-badge"
                                                style={{backgroundColor: getPaymentStatusColor(order.payment_status)}}
                                            >
                                                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="order-items-preview">
                                        {order.order_items && order.order_items.slice(0, 3).map((item, index) => (
                                            <div key={`item-${item.id}`} className="item-preview">
                                                <img
                                                    src={getImageUrl(item.product?.image)}
                                                    alt={item.product?.name || 'Product'}
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.png';
                                                    }}
                                                />
                                                <div className="item-details">
                                                    <span className="item-name">
                                                        {item.product?.name || 'Product'}
                                                    </span>
                                                    <span className="item-quantity">
                                                        Qty: {item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {order.order_items && order.order_items.length > 3 && (
                                            <div className="more-items">
                                                +{order.order_items.length - 3} more items
                                            </div>
                                        )}
                                    </div>

                                    <div className="order-summary">
                                        <div className="summary-info">
                                            <div className="total-items">
                                                {order.order_items?.length || 0} items
                                            </div>
                                            <div className="total-amount">
                                                {formatPrice(order.total_amount)}
                                            </div>
                                        </div>

                                        <div className="order-actions">
                                            <Link to={path.order_details(order.id)}>
                                                <CustomSubmitButton
                                                    type="button"
                                                    label="View Details"
                                                    btnClassName="default-submit-btn secondary small"
                                                />
                                            </Link>

                                            {/* ✅ Updated: Link to track order instead of just button */}
                                            {(order.status === 'pending' || order.status === 'confirmed' ||
                                                order.status === 'processing' || order.status === 'shipped') && (
                                                <Link to={path.track_order(order.id)}>
                                                    <CustomSubmitButton
                                                        type="button"
                                                        label="Track Order"
                                                        btnClassName="default-submit-btn small"
                                                    />
                                                </Link>
                                            )}

                                            {/* Show different action for delivered orders */}
                                            {order.status === 'delivered' && (
                                                <Link to={path.track_order(order.id)}>
                                                    <CustomSubmitButton
                                                        type="button"
                                                        label="View Tracking"
                                                        btnClassName="default-submit-btn small secondary"
                                                    />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {renderPagination()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
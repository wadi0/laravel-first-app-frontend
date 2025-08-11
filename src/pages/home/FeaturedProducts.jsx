import React, {useState} from 'react';
import './featuredProduct.scss';
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";

const FeaturedProducts = () => {
    const [products] = useState([
        {
            id: 1,
            name: "Premium Wireless Headphones",
            price: 199.99,
            originalPrice: 249.99,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
            rating: 4.8,
            reviews: 234,
            badge: "Best Seller",
            category: "Electronics"
        },
        {
            id: 2,
            name: "Smart Fitness Watch",
            price: 299.99,
            originalPrice: 399.99,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
            rating: 4.6,
            reviews: 189,
            badge: "New",
            category: "Wearables"
        },
        {
            id: 3,
            name: "Organic Cotton T-Shirt",
            price: 29.99,
            originalPrice: 39.99,
            image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
            rating: 4.7,
            reviews: 156,
            badge: "Sale",
            category: "Clothing"
        },
        {
            id: 4,
            name: "Professional Camera Lens",
            price: 899.99,
            originalPrice: null,
            image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop",
            rating: 4.9,
            reviews: 87,
            badge: "Premium",
            category: "Photography"
        },
        {
            id: 5,
            name: "Eco-Friendly Water Bottle",
            price: 24.99,
            originalPrice: 34.99,
            image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
            rating: 4.5,
            reviews: 298,
            badge: "Eco",
            category: "Lifestyle"
        },
        {
            id: 6,
            name: "Wireless Charging Pad",
            price: 49.99,
            originalPrice: 69.99,
            image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop",
            rating: 4.4,
            reviews: 167,
            badge: "Tech",
            category: "Electronics"
        }
    ]);

    const [activeFilter, setActiveFilter] = useState('All');
    const categories = ['All', 'Electronics', 'Wearables', 'Clothing', 'Photography', 'Lifestyle'];

    const filteredProducts = activeFilter === 'All'
        ? products
        : products.filter(product => product.category === activeFilter);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={i} className="star filled">★</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="star half">★</span>);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
        }

        return stars;
    };

    const getBadgeClass = (badge) => {
        const badgeClasses = {
            'Best Seller': 'badge-bestseller',
            'New': 'badge-new',
            'Sale': 'badge-sale',
            'Premium': 'badge-premium',
            'Eco': 'badge-eco',
            'Tech': 'badge-tech'
        };
        return badgeClasses[badge] || 'badge-default';
    };

    return (
        <div className="featured-products">
            {/* Filter Tabs */}
            <div className="filter-tabs">
                {categories.map(category => (
                    // <button
                    //     key={category}
                    //     className={`filter-tab ${activeFilter === category ? 'active' : ''}`}
                    //     onClick={() => setActiveFilter(category)}
                    // >
                    //     {category}
                    // </button>
                    <CustomSubmitButton
                        key={category}
                        // isLoading={loading && activeFilter === category}
                        onClick={() => setActiveFilter(category)}
                        type="button"
                        label={category}
                        btnClassName={`filter-tab ${activeFilter === category ? 'active' : ''}`}
                    />
                ))}
            </div>

            {/* Products Grid */}
            <div className="products-grid">
                {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">
                        <div className="product-image-container">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="product-image"
                            />
                            <div className={`product-badge ${getBadgeClass(product.badge)}`}>
                                {product.badge}
                            </div>
                            <div className="product-overlay">
                                <button className="quick-view-btn">Quick View</button>
                                <div className="product-actions">
                                    <button className="action-btn">❤️</button>
                                    <button className="action-btn">🛒</button>
                                    <button className="action-btn">👁️</button>
                                </div>
                            </div>
                        </div>

                        <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>

                            <div className="product-rating">
                                <div className="stars">
                                    {renderStars(product.rating)}
                                </div>
                                <span className="rating-text">
                                    {product.rating} ({product.reviews} reviews)
                                </span>
                            </div>

                            <div className="product-price">
                                <span className="current-price">${product.price}</span>
                                {product.originalPrice && (
                                    <span className="original-price">${product.originalPrice}</span>
                                )}
                                {product.originalPrice && (
                                    <span className="discount">
                                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                    </span>
                                )}
                            </div>

                            <button className="add-to-cart-btn">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FeaturedProducts;
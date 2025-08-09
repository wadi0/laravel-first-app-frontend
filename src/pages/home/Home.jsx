import React from 'react';
import "./home.scss";
import HeroSection from "./HeroSection.jsx";
import FeaturedProducts from "./FeaturedProducts.jsx";
import Testimonials from "./Testimonials.jsx";
import BrandLogos from "./BrandLogos.jsx";
import NewsletterSignup from "./NewsLetterSignup.jsx";

const Home = () => {

    const featuresData = [
        {
            id: 1,
            icon: "🚚",
            title: "Free Shipping",
            description: "Free shipping on orders over $50"
        },
        {
            id: 2,
            icon: "↩️",
            title: "Easy Returns",
            description: "30-day return policy"
        },
        {
            id: 3,
            icon: "🔒",
            title: "Secure Payment",
            description: "100% secure payment"
        },
        {
            id: 4,
            icon: "📞",
            title: "24/7 Support",
            description: "Dedicated customer support"
        }
    ];

    const statsData = [
        { number: "50K+", label: "Happy Customers" },
        { number: "1000+", label: "Products" },
        { number: "99%", label: "Satisfaction Rate" },
        { number: "24/7", label: "Support" }
    ];

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <HeroSection />
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="features-grid">
                    {featuresData.map((feature) => (
                        <div key={feature.id} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured-products-section">
                <div className="section-header">
                    <h2 className="section-title">Featured Products</h2>
                    <p className="section-subtitle">Our most popular items</p>
                </div>
                <FeaturedProducts />
            </section>

            {/* Statistics Section */}
            <section className="stats-section">
                <div className="stats-grid">
                    {statsData.map((stat, index) => (
                        <div key={index} className="stat-item">
                            <h3 className="stat-number">{stat.number}</h3>
                            <p className="stat-label">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="section-header">
                    <h2 className="section-title">What Our Customers Say</h2>
                </div>
                <Testimonials />
            </section>

            {/* Brand Partners Section */}
            <section className="brands-section">
                <div className="section-header">
                    <h2 className="section-title">Trusted Brands</h2>
                </div>
                <BrandLogos />
            </section>

            {/* Newsletter Section */}
            <section className="newsletter-section">
                <NewsletterSignup />
            </section>
        </div>
    );
};

export default Home;
import React, { useState } from 'react';
import './newsLetterSignup.scss';

const NewsletterSignup = () => {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsSubscribed(true);
            setEmail('');
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setIsSubscribed(false);
        setEmail('');
        setError('');
    };

    const benefits = [
        {
            icon: '🎁',
            title: 'Exclusive Offers',
            description: 'Get special discounts and deals'
        },
        {
            icon: '🚀',
            title: 'Early Access',
            description: 'First to know about new products'
        },
        {
            icon: '📧',
            title: 'Weekly Updates',
            description: 'Curated content and tips'
        }
    ];

    if (isSubscribed) {
        return (
            <div className="newsletter-signup success">
                <div className="newsletter-container">
                    <div className="success-content">
                        <div className="success-icon">✅</div>
                        <h2>Welcome to Our Newsletter!</h2>
                        <p>Thank you for subscribing! You'll receive our latest updates and exclusive offers.</p>
                        <div className="success-benefits">
                            <div className="benefit-item">
                                <span className="benefit-icon">🎉</span>
                                <span>10% off your next purchase</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">📱</span>
                                <span>Weekly deals in your inbox</span>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">⚡</span>
                                <span>Early access to sales</span>
                            </div>
                        </div>
                        <button
                            className="continue-shopping-btn"
                            onClick={resetForm}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="newsletter-signup">
            <div className="newsletter-container">
                <div className="newsletter-content">
                    <div className="newsletter-header">
                        <h2>Stay Updated with Our Newsletter</h2>
                        <p>Join thousands of satisfied customers and get exclusive deals, product updates, and shopping tips delivered to your inbox.</p>
                    </div>

                    <div className="newsletter-benefits">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="benefit-card">
                                <div className="benefit-icon">{benefit.icon}</div>
                                <div className="benefit-info">
                                    <h3>{benefit.title}</h3>
                                    <p>{benefit.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="newsletter-form-section">
                        <div className="form-container">
                            <h3>Subscribe Now & Get 10% Off Your First Order</h3>

                            <div className="newsletter-form">
                                <div className="input-group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                        className={`email-input ${error ? 'error' : ''}`}
                                        disabled={isLoading}
                                    />
                                    <button
                                        onClick={handleSubmit}
                                        className={`subscribe-btn ${isLoading ? 'loading' : ''}`}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <div className="loading-spinner"></div>
                                        ) : (
                                            'Subscribe'
                                        )}
                                    </button>
                                </div>

                                {error && (
                                    <div className="error-message">
                                        <span className="error-icon">⚠️</span>
                                        {error}
                                    </div>
                                )}
                            </div>

                            <div className="newsletter-trust">
                                <div className="trust-indicators">
                                    <div className="trust-item">
                                        <span className="trust-icon">🔒</span>
                                        <span>100% Secure</span>
                                    </div>
                                    <div className="trust-item">
                                        <span className="trust-icon">📧</span>
                                        <span>No Spam</span>
                                    </div>
                                    <div className="trust-item">
                                        <span className="trust-icon">❌</span>
                                        <span>Unsubscribe Anytime</span>
                                    </div>
                                </div>
                                <p className="privacy-text">
                                    We respect your privacy. Your information is safe with us and will never be shared with third parties.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="social-section">
                        <h3>Follow Us on Social Media</h3>
                        <div className="social-links">
                            <a href="#" className="social-link facebook">
                                <span className="social-icon">📘</span>
                                <span>Facebook</span>
                            </a>
                            <a href="#" className="social-link twitter">
                                <span className="social-icon">🐦</span>
                                <span>Twitter</span>
                            </a>
                            <a href="#" className="social-link instagram">
                                <span className="social-icon">📷</span>
                                <span>Instagram</span>
                            </a>
                            <a href="#" className="social-link youtube">
                                <span className="social-icon">📺</span>
                                <span>YouTube</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsletterSignup;
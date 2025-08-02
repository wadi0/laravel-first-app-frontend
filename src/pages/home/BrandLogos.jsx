import React from 'react';
import './brandLogos.scss';

const BrandLogos = () => {
    const brands = [
        {
            id: 1,
            name: "Apple",
            logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
            description: "Technology & Electronics"
        },
        {
            id: 2,
            name: "Nike",
            logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
            description: "Sports & Lifestyle"
        },
        {
            id: 3,
            name: "Samsung",
            logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
            description: "Electronics & Appliances"
        },
        {
            id: 4,
            name: "Adidas",
            logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
            description: "Sports & Fashion"
        },
        {
            id: 5,
            name: "Sony",
            logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
            description: "Electronics & Entertainment"
        },
        {
            id: 6,
            name: "Microsoft",
            logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
            description: "Technology & Software"
        },
        {
            id: 7,
            name: "Canon",
            logo: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Canon_wordmark.svg",
            description: "Photography & Imaging"
        },
        {
            id: 8,
            name: "LG",
            logo: "https://upload.wikimedia.org/wikipedia/commons/8/8e/LG_logo_%282015%29.svg",
            description: "Electronics & Home Appliances"
        }
    ];

    return (
        <div className="brand-logos">
            <div className="brands-grid">
                {brands.map((brand) => (
                    <div key={brand.id} className="brand-card">
                        <div className="brand-logo-container">
                            <img
                                src={brand.logo}
                                alt={`${brand.name} logo`}
                                className="brand-logo"
                                onError={(e) => {
                                    // Fallback to text if image fails to load
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="brand-fallback" style={{ display: 'none' }}>
                                {brand.name}
                            </div>
                        </div>
                        <div className="brand-info">
                            <h3 className="brand-name">{brand.name}</h3>
                            <p className="brand-description">{brand.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Moving logos animation */}
            <div className="moving-brands">
                <div className="moving-track">
                    {/* Duplicate brands for seamless loop */}
                    {[...brands, ...brands].map((brand, index) => (
                        <div key={`moving-${index}`} className="moving-brand">
                            <img
                                src={brand.logo}
                                alt={`${brand.name} logo`}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <span className="moving-brand-fallback" style={{ display: 'none' }}>
                                {brand.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Brand stats */}
            <div className="brand-stats">
                <div className="stat-item">
                    <span className="stat-number">50+</span>
                    <span className="stat-label">Trusted Brands</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="stat-number">1000+</span>
                    <span className="stat-label">Brand Products</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">Brand Support</span>
                </div>
            </div>

            {/* Partnership info */}
            <div className="partnership-info">
                <h3>Why Choose Our Brand Partners?</h3>
                <div className="benefits-grid">
                    <div className="benefit-item">
                        <div className="benefit-icon">✓</div>
                        <div className="benefit-text">
                            <h4>Authentic Products</h4>
                            <p>100% genuine products directly from authorized partners</p>
                        </div>
                    </div>
                    <div className="benefit-item">
                        <div className="benefit-icon">🛡️</div>
                        <div className="benefit-text">
                            <h4>Warranty Protection</h4>
                            <p>Full manufacturer warranty on all brand products</p>
                        </div>
                    </div>
                    <div className="benefit-item">
                        <div className="benefit-icon">🚀</div>
                        <div className="benefit-text">
                            <h4>Latest Releases</h4>
                            <p>First access to new products and exclusive launches</p>
                        </div>
                    </div>
                    <div className="benefit-item">
                        <div className="benefit-icon">💰</div>
                        <div className="benefit-text">
                            <h4>Best Prices</h4>
                            <p>Competitive pricing with exclusive partner discounts</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandLogos;
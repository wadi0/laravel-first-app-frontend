import React, { useState, useEffect } from 'react';
import './heroSection.scss';

const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    const heroSlides = [
        {
            id: 1,
            title: "Discover Amazing Products",
            subtitle: "New Collection 2025",
            description: "Explore our latest collection with premium quality products at unbeatable prices. Find everything you need in one place.",
            buttonText: "Shop Now",
            buttonLink: "/products",
            backgroundImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=800&fit=crop",
            overlayColor: "rgba(0, 0, 0, 0.4)",
            textAlign: "left"
        },
        {
            id: 2,
            title: "Summer Sale",
            subtitle: "Up to 70% Off",
            description: "Don't miss our biggest sale of the year! Limited time offers on your favorite brands and products.",
            buttonText: "Explore Deals",
            buttonLink: "/sale",
            backgroundImage: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1920&h=800&fit=crop",
            overlayColor: "rgba(0, 0, 0, 0.3)",
            textAlign: "center"
        },
        {
            id: 3,
            title: "Premium Electronics",
            subtitle: "Latest Technology",
            description: "Stay ahead with cutting-edge technology. From smartphones to smart homes, we have it all.",
            buttonText: "Browse Electronics",
            buttonLink: "/electronics",
            backgroundImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1920&h=800&fit=crop",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            textAlign: "right"
        }
    ];

    useEffect(() => {
        setIsLoaded(true);
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroSlides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [heroSlides.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);
    };

    return (
        <div className={`hero-section ${isLoaded ? 'loaded' : ''}`}>
            <div className="hero-slider">
                {heroSlides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{
                            backgroundImage: `url(${slide.backgroundImage})`,
                        }}
                    >
                        <div
                            className="hero-overlay"
                            style={{ background: slide.overlayColor }}
                        ></div>

                        <div className="hero-container">
                            <div className={`hero-content ${slide.textAlign}`}>
                                <div className="hero-text">
                                    <span className="hero-subtitle">
                                        {slide.subtitle}
                                    </span>
                                    <h1 className="hero-title">
                                        {slide.title}
                                    </h1>
                                    <p className="hero-description">
                                        {slide.description}
                                    </p>
                                    <div className="hero-buttons">
                                        <button className="hero-btn primary">
                                            {slide.buttonText}
                                        </button>
                                        <button className="hero-btn secondary">
                                            Learn More
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Controls */}
            <div className="hero-controls">
                <button
                    className="hero-nav-btn prev"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                >
                    &#8249;
                </button>

                <button
                    className="hero-nav-btn next"
                    onClick={nextSlide}
                    aria-label="Next slide"
                >
                    &#8250;
                </button>
            </div>

            {/* Pagination Dots */}
            <div className="hero-pagination">
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        className={`pagination-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Scroll Indicator */}
            <div className="scroll-indicator">
                <div className="scroll-arrow">
                    <span>Scroll Down</span>
                    <div className="arrow-down">↓</div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
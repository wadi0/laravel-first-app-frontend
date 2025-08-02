import React, { useState, useEffect } from 'react';
import './testimonials.scss';

const Testimonials = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const testimonials = [
        {
            id: 1,
            name: "Sarah Johnson",
            role: "Fashion Blogger",
            company: "Style & Grace",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b5c1?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            text: "Amazing quality and fast shipping! I've been shopping here for over a year and they never disappoint. The customer service is exceptional.",
            date: "2 weeks ago"
        },
        {
            id: 2,
            name: "Michael Chen",
            role: "Tech Enthusiast",
            company: "Digital Nomad",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            text: "The electronics section is fantastic! Found exactly what I needed at competitive prices. The product descriptions are accurate and helpful.",
            date: "1 month ago"
        },
        {
            id: 3,
            name: "Emily Rodriguez",
            role: "Small Business Owner",
            company: "Eco Living Co.",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            text: "Love the eco-friendly options! It's great to find a store that cares about sustainability. Quality products with a conscience.",
            date: "3 weeks ago"
        },
        {
            id: 4,
            name: "David Thompson",
            role: "Photographer",
            company: "Thompson Studios",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            rating: 4,
            text: "Great selection of photography equipment. The product quality is top-notch and the prices are reasonable. Highly recommend!",
            date: "1 week ago"
        },
        {
            id: 5,
            name: "Lisa Park",
            role: "Fitness Coach",
            company: "FitLife Studio",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            text: "The fitness and wellness products are excellent. I've recommended this store to all my clients. Fast delivery and great customer support!",
            date: "4 days ago"
        },
        {
            id: 6,
            name: "Robert Kim",
            role: "Software Developer",
            company: "Tech Solutions Inc.",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
            rating: 5,
            text: "Seamless shopping experience with a user-friendly website. The product range is impressive and the checkout process is smooth.",
            date: "5 days ago"
        }
    ];

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % testimonials.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, testimonials.length]);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <span
                key={index}
                className={`star ${index < rating ? 'filled' : 'empty'}`}
            >
                ★
            </span>
        ));
    };

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + testimonials.length) % testimonials.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    return (
        <div className="testimonials">
            <div className="testimonials-container">
                {/* Main testimonial display */}
                <div className="testimonial-slider">
                    <div
                        className="testimonials-track"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        onMouseEnter={() => setIsAutoPlaying(false)}
                        onMouseLeave={() => setIsAutoPlaying(true)}
                    >
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="testimonial-slide">
                                <div className="testimonial-card">
                                    <div className="quote-icon">"</div>

                                    <div className="testimonial-content">
                                        <div className="rating">
                                            {renderStars(testimonial.rating)}
                                        </div>

                                        <p className="testimonial-text">{testimonial.text}</p>

                                        <div className="testimonial-author">
                                            <div className="author-image">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                />
                                            </div>
                                            <div className="author-info">
                                                <h4 className="author-name">{testimonial.name}</h4>
                                                <p className="author-role">{testimonial.role}</p>
                                                <p className="author-company">{testimonial.company}</p>
                                                <span className="testimonial-date">{testimonial.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation controls */}
                <div className="testimonial-controls">
                    <button
                        className="nav-btn prev-btn"
                        onClick={prevSlide}
                        aria-label="Previous testimonial"
                    >
                        &#8249;
                    </button>

                    <div className="pagination-dots">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        className="nav-btn next-btn"
                        onClick={nextSlide}
                        aria-label="Next testimonial"
                    >
                        &#8250;
                    </button>
                </div>

                {/* Stats section */}
                <div className="testimonial-stats">
                    <div className="stat-item">
                        <span className="stat-number">4.9</span>
                        <span className="stat-label">Average Rating</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-number">10K+</span>
                        <span className="stat-label">Happy Customers</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <span className="stat-number">99%</span>
                        <span className="stat-label">Satisfaction Rate</span>
                    </div>
                </div>
            </div>

            {/* Thumbnail testimonials */}
            <div className="testimonials-thumbnails">
                {testimonials.map((testimonial, index) => (
                    <div
                        key={testimonial.id}
                        className={`thumbnail-card ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                    >
                        <img src={testimonial.image} alt={testimonial.name} />
                        <div className="thumbnail-info">
                            <h5>{testimonial.name}</h5>
                            <div className="thumbnail-rating">
                                {renderStars(testimonial.rating)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Testimonials;
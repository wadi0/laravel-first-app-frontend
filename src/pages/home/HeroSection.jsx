import React, {useState, useEffect} from 'react';
import './heroSection.scss';
import summercollection from "../../assets/collection/summer.jpg";
import wintercollection from "../../assets/collection/winter.jpg";
import specialcollection from "../../assets/collection/specialcollection.jpg";
import newcollection from "../../assets/collection/newcollection.jpg";
import otherscollection from "../../assets/collection/otherscollection.jpg";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import {useNavigate} from "react-router-dom";

const HeroSection = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();

    // Collection data for slider
    const collectionData = [
        {
            "id": 1,
            "name": "New Collection",
            "slug": "new-collection",
            "image": newcollection,
            "description": "Discover our latest and most innovative products for 2025",
            "buttonText": "Shop New Collection"
        },
        {
            "id": 2,
            "name": "Summer Collection",
            "slug": "summer-collection",
            "image": summercollection,
            "description": "Fresh and vibrant pieces perfect for the sunny season",
            "buttonText": "Explore Summer"
        },
        {
            "id": 3,
            "name": "Winter Collection",
            "slug": "winter-collection",
            "image": wintercollection,
            "description": "Cozy and warm essentials for the cold weather",
            "buttonText": "Browse Winter"
        },
        {
            "id": 4,
            "name": "Special Collection",
            "slug": "special-collection",
            "image": specialcollection,
            "description": "Limited edition items crafted with premium materials",
            "buttonText": "View Special Items"
        },
        {
            "id": 5,
            "name": "Others Collection",
            "slug": "others-collection",
            "image": otherscollection,
            "description": "Unique and diverse products for every taste",
            "buttonText": "Discover More"
        }
    ];

    useEffect(() => {
        setIsLoaded(true);
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % collectionData.length);
        }, 4000);

        return () => clearInterval(interval);
    }, [collectionData.length]);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const nextSlide = () => {
        setCurrentSlide(prev => (prev + 1) % collectionData.length);
    };

    const prevSlide = () => {
        setCurrentSlide(prev => (prev - 1 + collectionData.length) % collectionData.length);
    };

    return (
        <div className="hero-section loaded">
            <div className="collection-slider">
                {collectionData.map((collection, index) => (
                    <div
                        key={collection.id}
                        className={`collection-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{
                            backgroundImage: `url(${collection.image})`,
                        }}
                    >
                        <div className="collection-overlay"></div>

                        <div className="collection-container">
                            <div className="collection-content">
                                <div className="collection-text">
                                    <h1 className="collection-title">
                                        {collection.name}
                                    </h1>
                                    <p className="collection-description">
                                        {collection.description}
                                    </p>
                                    <CustomSubmitButton
                                        onClick={() => navigate(`#${collection.slug}`)}
                                        type="button"
                                        label={collection.buttonText}
                                        btnClassName="dedefault-submit-btn"
                                        // isLoading={}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="collection-pagination">
                {collectionData.map((_, index) => (
                    <button
                        key={index}
                        className={`pagination-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to ${collectionData[index].name}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSection;
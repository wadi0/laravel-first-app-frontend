// pages/wishlist/Wishlist.jsx
import React, { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './wishlist.scss';
import {useApp} from "../../components/context/AppContext.jsx";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import ProductCard from "../product/ProductCard.jsx";

const Wishlist = () => {
    const {
        wishlistItems,
        wishlistLoading,
        addToCart,
        cartItems, // cartItems properly destructure করুন
        toggleWishlist,
        getWishlistItems
    } = useApp();

    // Debug করার জন্য
    console.log('Wishlist component - cartItems:', cartItems);
    console.log('Wishlist component - wishlistItems:', wishlistItems);

    useEffect(() => {
        getWishlistItems(); // Page load এ wishlist refresh করুন
    }, []);

    const handleAddToCart = async (product) => {
        const success = await addToCart(product);
        return success;
    };

    const handleRemoveFromWishlist = async (product) => {
        const result = await toggleWishlist(product);
        return result.success;
    };

    if (wishlistLoading) {
        return (
            <div className="wishlist-page">
                <div className="container">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your wishlist...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="container">
                <div className="wishlist-header">
                    <h1>
                        <FaHeart className="page-icon" />
                        My Wishlist
                    </h1>
                    <p className="wishlist-count">
                        {wishlistItems?.length || 0} {(wishlistItems?.length || 0) === 1 ? 'item' : 'items'} in your wishlist
                    </p>
                </div>

                {!wishlistItems || wishlistItems.length === 0 ? (
                    <div className="empty-wishlist">
                        <div className="empty-icon">
                            <FaHeart />
                        </div>
                        <h2>Your wishlist is empty</h2>
                        <p>Save items you love by clicking the heart icon</p>
                        <Link to="/product" className="shop-now-btn">
                            <CustomSubmitButton
                                type="button"
                                label="Start Shopping"
                                btnClassName="default-submit-btn"
                            />
                        </Link>
                    </div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlistItems.map((item) => {
                            // Each item validation
                            if (!item || !item.product) {
                                console.warn('Invalid wishlist item:', item);
                                return null;
                            }

                            return (
                                <ProductCard
                                    key={item.id}
                                    product={item.product}
                                    cartItems={cartItems || []} // Fallback empty array
                                    onAddToCart={handleAddToCart}
                                    onRemoveFromCart={() => {}} // Cart থেকে remove করার দরকার নেই wishlist page এ
                                    onWishlist={handleRemoveFromWishlist}
                                    showEditDelete={false} // Edit/Delete buttons show করবো না
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
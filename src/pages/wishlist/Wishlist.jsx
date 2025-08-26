// pages/wishlist/Wishlist.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './wishlist.scss';
import {useApp} from "../../components/context/AppContext.jsx";
import CustomSubmitButton from "../../components/custombutton/CustomButton.jsx";
import ProductCard from "../product/ProductCard.jsx";
import {toast} from "react-toastify";
import CustomLoader from "../../components/customLoader/CustomLoader.jsx";

const Wishlist = () => {
    const {
        wishlistItems,
        wishlistLoading,
        addToCart,
        removeFromCart, // removeFromCart function import করুন
        cartItems, // cartItems properly destructure করুন
        toggleWishlist,
        getWishlistItems,
        getCartItems // Cart items refresh করার জন্য
    } = useApp();

    // Debug করার জন্য
    console.log('Wishlist component - cartItems:', cartItems);
    console.log('Wishlist component - wishlistItems:', wishlistItems);

    useEffect(() => {
        getWishlistItems(); // Page load এ wishlist refresh করুন
        getCartItems(); // Cart items o refresh করুন
    }, []);

    const handleAddToCart = useCallback(async (product) => {
        try {
            const success = await addToCart(product);
            if (success) {
                toast.success("Product added to cart!");
                // Force refresh to ensure UI consistency
                setTimeout(() => {
                    getCartItems();
                }, 100);
            }
            return success;
        } catch (error) {
            console.error('Add to cart error in wishlist:', error);
            return false;
        }
    }, [addToCart, getCartItems]);

    const handleRemoveFromCart = useCallback(async (product) => {
        try {
            const success = await removeFromCart(product);
            if (success) {
                toast.success("Removed from cart successfully!");
                // Force refresh to ensure UI consistency
                setTimeout(() => {
                    getCartItems();
                }, 100);
            }
            return success;
        } catch (error) {
            console.error('Remove from cart error in wishlist:', error);
            return false;
        }
    }, [removeFromCart, getCartItems]);

    const handleRemoveFromWishlist = useCallback(async (product) => {
        try {
            const result = await toggleWishlist(product);
            if (result.success) {
                // Force refresh wishlist to ensure UI consistency
                setTimeout(() => {
                    getWishlistItems();
                }, 100);
            }
            return result.success;
        } catch (error) {
            console.error('Remove from wishlist error:', error);
            return false;
        }
    }, [toggleWishlist, getWishlistItems]);

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
            <CustomLoader isLoading={wishlistLoading} />
            {!wishlistLoading && (
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
                                    key={`wishlist-${item.id}-${cartItems?.length || 0}`} // Better key for re-rendering
                                    product={item.product}
                                    cartItems={cartItems || []} // Fallback empty array
                                    onAddToCart={handleAddToCart}
                                    onRemoveFromCart={handleRemoveFromCart} // Proper removeFromCart function pass করুন
                                    onWishlist={handleRemoveFromWishlist}
                                    showEditDelete={false} // Edit/Delete buttons show করবো না
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            )}
        </div>
    );
};

export default Wishlist;
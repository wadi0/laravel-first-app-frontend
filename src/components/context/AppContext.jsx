// context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "react-toastify";
import AxiosServices from "../network/AxiosServices.jsx";
import ApiUrlServices from "../network/ApiUrlServices.jsx";

const AppContext = createContext();

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export const AppProvider = ({ children }) => {
    // Cart States
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    // Wishlist States
    const [wishlistItems, setWishlistItems] = useState([]);
    const [wishlistCount, setWishlistCount] = useState(0);

    // Loading States
    const [cartLoading, setCartLoading] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    console.log('AppContext - cartItems state:', cartItems); // Debug log

    // ================== CART OPERATIONS ==================

    // Get cart items from API
    const getCartItems = async () => {
        try {
            setCartLoading(true);
            const res = await AxiosServices.get(ApiUrlServices.ALL_CART_LIST);
            console.log('Cart Items from API:', res.data);
            setCartItems(res.data);
            setCartCount(res.data.length);
        } catch (err) {
            console.error('Failed to fetch cart items', err);
        } finally {
            setCartLoading(false);
        }
    };

    // Add to cart
    const addToCart = async (product) => {
        let payload = {
            product_id: product.id,
            quantity: 1,
        }
        try {
            const response = await AxiosServices.post(ApiUrlServices.ADD_CART, payload);
            console.log('Add to cart response:', response.data);

            const newCartItem = response.data.cart;

            setCartItems(prev => {
                const existingIndex = prev.findIndex(item => item.product_id === product.id);
                if (existingIndex !== -1) {
                    const updated = [...prev];
                    updated[existingIndex] = newCartItem;
                    return updated;
                } else {
                    const newItems = [...prev, newCartItem];
                    setCartCount(newItems.length);
                    return newItems;
                }
            });

            return true;
        } catch (err) {
            console.error("Add to cart failed:", err);
            return false;
        }
    };

    // Remove from cart
    const removeFromCart = async (product) => {
        try {
            const cartItem = cartItems.find(item => item.product_id === product.id);

            if (!cartItem) {
                return false;
            }

            await AxiosServices.delete(ApiUrlServices.DELETE_CART(cartItem.id));

            setCartItems(prev => {
                const filtered = prev.filter(item => item.id !== cartItem.id);
                setCartCount(filtered.length);
                return filtered;
            });

            return true;
        } catch (err) {
            console.error("Remove from cart failed:", err);
            return false;
        }
    };

    // Update cart quantity
    const updateCartQuantity = async (product, newQuantity) => {
        if (newQuantity < 1) return false;

        try {
            const cartItem = cartItems.find(item => item.product_id === product.id);

            if (!cartItem) {
                return false;
            }

            const payload = {
                quantity: newQuantity,
            };

            const response = await AxiosServices.put(ApiUrlServices.UPDATE_CART_QUANTITY(cartItem.id), payload);
            console.log('Update quantity response:', response.data);

            // Update local state
            setCartItems(prev => {
                const updated = prev.map(item => {
                    if (item.product_id === product.id) {
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                });
                return updated;
            });

            return true;
        } catch (err) {
            console.error("Update quantity failed:", err);
            return false;
        }
    };

    // Check if product is in cart
    const isInCart = (productId) => {
        return cartItems.some(item => item.product_id === productId);
    };

    // ================== WISHLIST OPERATIONS ==================

    // Get wishlist items from API
    const getWishlistItems = async () => {
        try {
            setWishlistLoading(true);
            const res = await AxiosServices.get(ApiUrlServices.ALL_WISHLIST_LIST);
            console.log('Wishlist Items from API:', res.data);
            setWishlistItems(res.data);
            setWishlistCount(res.data.length);
        } catch (err) {
            console.error('Failed to fetch wishlist items', err);
        } finally {
            setWishlistLoading(false);
        }
    };

    // Add to wishlist
    const addToWishlist = async (product) => {
        let payload = {
            product_id: product.id,
        }
        try {
            const response = await AxiosServices.post(ApiUrlServices.ADD_WISHLIST, payload);
            console.log('Add to wishlist response:', response.data);

            const newWishlistItem = response.data.wishlist;

            setWishlistItems(prev => {
                const exists = prev.find(item => item.product_id === product.id);
                if (!exists) {
                    const newItems = [...prev, newWishlistItem];
                    setWishlistCount(newItems.length);
                    return newItems;
                }
                return prev;
            });

            return true;
        } catch (err) {
            console.error("Add to wishlist failed:", err);
            return false;
        }
    };

    // Remove from wishlist
    const removeFromWishlist = async (product) => {
        try {
            const wishlistItem = wishlistItems.find(item => item.product_id === product.id);

            if (!wishlistItem) {
                return false;
            }

            await AxiosServices.delete(ApiUrlServices.DELETE_WISHLIST(wishlistItem.id));

            setWishlistItems(prev => {
                const filtered = prev.filter(item => item.id !== wishlistItem.id);
                setWishlistCount(filtered.length);
                return filtered;
            });

            return true;
        } catch (err) {
            console.error("Remove from wishlist failed:", err);
            return false;
        }
    };

    // Toggle wishlist (add if not exists, remove if exists)
    const toggleWishlist = async (product) => {
        const exists = wishlistItems.find(item => item.product_id === product.id);

        if (exists) {
            const success = await removeFromWishlist(product);
            if (success) {
                toast.success("Removed from wishlist!");
            } else {
                toast.error("Failed to remove from wishlist");
            }
            return { success, action: 'removed', isWishlisted: false };
        } else {
            const success = await addToWishlist(product);
            if (success) {
                toast.success("Added to wishlist!");
            } else {
                toast.error("Failed to add to wishlist");
            }
            return { success, action: 'added', isWishlisted: true };
        }
    };

    // Check if product is in wishlist
    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.product_id === productId);
    };

    // ================== INITIAL LOAD ==================

    useEffect(() => {
        getCartItems();
        getWishlistItems();
    }, []);

    // ================== CONTEXT VALUE ==================

    const value = {
        // Cart
        cartItems,
        cartCount,
        cartLoading,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartItems,
        isInCart,

        // Wishlist
        wishlistItems,
        wishlistCount,
        wishlistLoading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        getWishlistItems,
        isInWishlist,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
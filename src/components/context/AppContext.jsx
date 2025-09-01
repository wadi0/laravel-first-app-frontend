// context/AppContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import AxiosServices from "../network/AxiosServices.jsx";
import ApiUrlServices from "../network/ApiUrlServices.jsx";
import path from "../../routes/path.jsx";

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

    // Use refs to track ongoing operations and prevent double calls
    const cartOperations = useRef(new Set());
    const wishlistOperations = useRef(new Set());

    console.log('AppContext - cartItems state:', cartItems); // Debug log

    // Check if user is logged in
    const isLoggedIn = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            return !!user?.token;
        } catch (error) {
            console.error('Error checking login status:', error);
            return false;
        }
    };

    // Redirect to login if not authenticated
    const redirectToLogin = () => {
        toast.error('Please login first to continue');
        setTimeout(() => {
            window.location.href = path.login;
        }, 1500);
    };

    // ================== CART OPERATIONS ==================

    // Get cart items from API
    const getCartItems = async () => {
        // Only fetch if logged in
        if (!isLoggedIn()) return;

        try {
            setCartLoading(true);
            const res = await AxiosServices.get(ApiUrlServices.ALL_CART_LIST);
            console.log('Cart Items from API:', res.data);
            setCartItems(res.data);
            setCartCount(res.data.length);
        } catch (err) {
            console.error('Failed to fetch cart items', err);
            // If 401, user is not logged in
            if (err.response?.status === 401) {
                setCartItems([]);
                setCartCount(0);
            }
        } finally {
            setCartLoading(false);
        }
    };

    // Add to cart
    const addToCart = async (product) => {
        // Check authentication first
        if (!isLoggedIn()) {
            redirectToLogin();
            return false;
        }

        const operationKey = `add_${product.id}`;

        // Prevent duplicate calls
        if (cartOperations.current.has(operationKey)) {
            console.log('Add to cart operation already in progress for product:', product.id);
            return false;
        }

        cartOperations.current.add(operationKey);

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
                    setCartCount(updated.length);
                    return updated;
                } else {
                    const newItems = [...prev, newCartItem];
                    setCartCount(newItems.length);
                    return newItems;
                }
            });

            // toast.success("Product added to cart successfully!");
            return true;
        } catch (err) {
            console.error("Add to cart failed:", err);
            if (err.response?.status === 401) {
                redirectToLogin();
            } else {
                // toast.error("Failed to add product to cart");
            }
            return false;
        } finally {
            cartOperations.current.delete(operationKey);
        }
    };

    // Remove from cart
    const removeFromCart = async (product) => {
        // Check authentication first
        if (!isLoggedIn()) {
            redirectToLogin();
            return false;
        }

        const operationKey = `remove_${product.id}`;

        // Prevent duplicate calls
        if (cartOperations.current.has(operationKey)) {
            console.log('Remove from cart operation already in progress for product:', product.id);
            return false;
        }

        cartOperations.current.add(operationKey);

        try {
            // Get fresh cart items to ensure we have the latest data
            const currentCartItems = cartItems || [];
            const cartItem = currentCartItems.find(item => item.product_id === product.id);

            if (!cartItem) {
                console.warn("Item not found in cart for product:", product.id);
                // Don't show error toast, just return false
                return false;
            }

            console.log('Removing cart item:', cartItem.id, 'for product:', product.id);

            // Make API call to remove from cart
            await AxiosServices.delete(ApiUrlServices.DELETE_CART(cartItem.id));

            // Update local state only after successful API call
            setCartItems(prev => {
                const filtered = prev.filter(item => item.id !== cartItem.id);
                console.log('Cart items after removal:', filtered.length);
                setCartCount(filtered.length);
                return filtered;
            });

            // Don't show success toast here - let the calling component handle it
            return true;
        } catch (err) {
            console.error("Remove from cart failed:", err);
            if (err.response?.status === 401) {
                redirectToLogin();
            } else if (err.response?.status === 404) {
                // Item already removed, just update local state
                setCartItems(prev => {
                    const filtered = prev.filter(item => item.product_id !== product.id);
                    setCartCount(filtered.length);
                    return filtered;
                });
                return true;
            } else {
                toast.error("Failed to remove item from cart");
            }
            return false;
        } finally {
            cartOperations.current.delete(operationKey);
        }
    };

    // Update cart quantity
    const updateCartQuantity = async (product, newQuantity) => {
        // Check authentication first
        if (!isLoggedIn()) {
            redirectToLogin();
            return false;
        }

        if (newQuantity < 1) return false;

        const operationKey = `update_${product.id}`;

        // Prevent duplicate calls
        if (cartOperations.current.has(operationKey)) {
            console.log('Update cart operation already in progress for product:', product.id);
            return false;
        }

        cartOperations.current.add(operationKey);

        try {
            const cartItem = cartItems.find(item => item.product_id === product.id);

            if (!cartItem) {
                console.error('Cart item not found for product:', product.id);
                toast.error("Cart item not found");
                return false;
            }

            console.log('Updating cart item:', cartItem.id, 'to quantity:', newQuantity);

            const payload = { quantity: newQuantity };
            const apiUrl = ApiUrlServices.UPDATE_CART(cartItem.id);
            console.log('API URL:', apiUrl);

            const response = await AxiosServices.put(apiUrl, payload);
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

            toast.success("Quantity updated successfully!");
            return true;
        } catch (err) {
            console.error("Update quantity failed:", err);

            // Better error messages
            if (err.response?.status === 422) {
                toast.error(err.response.data.message || "Stock limited");
            } else if (err.response?.status === 404) {
                toast.error("Cart item not found");
            } else if (err.response?.status === 401) {
                redirectToLogin();
            } else {
                toast.error("Failed to update quantity");
            }

            return false;
        } finally {
            cartOperations.current.delete(operationKey);
        }
    };

    // Check if product is in cart
    const isInCart = (productId) => {
        return cartItems.some(item => item.product_id === productId);
    };

    // ================== WISHLIST OPERATIONS ==================

    // Get wishlist items from API
    const getWishlistItems = async () => {
        // Only fetch if logged in
        if (!isLoggedIn()) return;

        try {
            setWishlistLoading(true);
            const res = await AxiosServices.get(ApiUrlServices.ALL_WISHLIST_LIST);
            console.log('Wishlist Items from API:', res.data);
            setWishlistItems(res.data);
            setWishlistCount(res.data.length);
        } catch (err) {
            console.error('Failed to fetch wishlist items', err);
            // If 401, user is not logged in
            if (err.response?.status === 401) {
                setWishlistItems([]);
                setWishlistCount(0);
            }
        } finally {
            setWishlistLoading(false);
        }
    };

    // Add to wishlist
    const addToWishlist = async (product) => {
        // Check authentication first
        if (!isLoggedIn()) {
            redirectToLogin();
            return false;
        }

        const operationKey = `add_wishlist_${product.id}`;

        // Prevent duplicate calls
        if (wishlistOperations.current.has(operationKey)) {
            console.log('Add to wishlist operation already in progress for product:', product.id);
            return false;
        }

        wishlistOperations.current.add(operationKey);

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
            if (err.response?.status === 401) {
                redirectToLogin();
            } else {
                toast.error("Failed to add to wishlist");
            }
            return false;
        } finally {
            wishlistOperations.current.delete(operationKey);
        }
    };

    // Remove from wishlist
    const removeFromWishlist = async (product) => {
        // Check authentication first
        if (!isLoggedIn()) {
            redirectToLogin();
            return false;
        }

        const operationKey = `remove_wishlist_${product.id}`;

        // Prevent duplicate calls
        if (wishlistOperations.current.has(operationKey)) {
            console.log('Remove from wishlist operation already in progress for product:', product.id);
            return false;
        }

        wishlistOperations.current.add(operationKey);

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
            if (err.response?.status === 401) {
                redirectToLogin();
            } else {
                toast.error("Failed to remove from wishlist");
            }
            return false;
        } finally {
            wishlistOperations.current.delete(operationKey);
        }
    };

    // Toggle wishlist (add if not exists, remove if exists)
    const toggleWishlist = async (product) => {
        // Check authentication first
        if (!isLoggedIn()) {
            redirectToLogin();
            return { success: false, action: 'authentication_required', isWishlisted: false };
        }

        const exists = wishlistItems.find(item => item.product_id === product.id);

        if (exists) {
            const success = await removeFromWishlist(product);
            if (success) {
                toast.success("Removed from wishlist!");
            }
            return { success, action: 'removed', isWishlisted: false };
        } else {
            const success = await addToWishlist(product);
            if (success) {
                toast.success("Added to wishlist!");
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
        // Only fetch data if user is logged in
        if (isLoggedIn()) {
            getCartItems();
            getWishlistItems();
        }
    }, []);

    // ================== CONTEXT VALUE ==================

    const value = {
        // Cart
        cartItems: cartItems || [], // Safety fallback
        cartCount: cartCount || 0,
        cartLoading: cartLoading || false,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartItems,
        isInCart,

        // Wishlist
        wishlistItems: wishlistItems || [], // Safety fallback
        wishlistCount: wishlistCount || 0,
        wishlistLoading: wishlistLoading || false,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        getWishlistItems,
        isInWishlist,

        // Auth utilities
        isLoggedIn,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
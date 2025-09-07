// context/AppContext.jsx - FINAL VERSION (No Session Expired Issue)
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
    // Authentication State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

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

    console.log('AppContext - cartItems state:', cartItems);

    // Check if user is logged in
    const isLoggedIn = () => {
        return isAuthenticated;
    };

    // Initialize authentication state from localStorage
    const initializeAuth = () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData?.token) {
                setIsAuthenticated(true);
                setUser(userData);
                return true;
            } else {
                setIsAuthenticated(false);
                setUser(null);
                return false;
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            setIsAuthenticated(false);
            setUser(null);
            return false;
        }
    };

    // Update authentication state
    const updateAuthState = async (userData = null, skipDataLoad = false) => {
        if (userData) {
            setIsAuthenticated(true);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            if (!skipDataLoad) {
                // Load cart and wishlist data after login
                console.log('User logged in, loading cart and wishlist data...');
                try {
                    await Promise.all([
                        getCartItems(),
                        getWishlistItems()
                    ]);
                    console.log('Cart and wishlist data loaded successfully');
                } catch (error) {
                    console.error('Error loading cart/wishlist data:', error);
                }
            }
        } else {
            // Clear data on logout
            console.log('User logging out, clearing all data...');
            setIsAuthenticated(false);
            setUser(null);
            localStorage.removeItem('user');
            
            // Immediately set counts to 0 for instant UI update
            setCartItems([]);
            setCartCount(0);
            setWishlistItems([]);
            setWishlistCount(0);
            console.log('All user data cleared');
        }
    };

    // Listen for storage changes (for multi-tab sync)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'user') {
                if (e.newValue) {
                    try {
                        const userData = JSON.parse(e.newValue);
                        setIsAuthenticated(true);
                        setUser(userData);
                        console.log('User logged in from another tab');
                    } catch (error) {
                        console.error('Error parsing user data from storage:', error);
                        setIsAuthenticated(false);
                        setUser(null);
                        setCartItems([]);
                        setCartCount(0);
                        setWishlistItems([]);
                        setWishlistCount(0);
                    }
                } else {
                    // User logged out in another tab
                    console.log('User logged out from another tab');
                    setIsAuthenticated(false);
                    setUser(null);
                    setCartItems([]);
                    setCartCount(0);
                    setWishlistItems([]);
                    setWishlistCount(0);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

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
        if (!isAuthenticated) {
            setCartItems([]);
            setCartCount(0);
            return;
        }

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
                // Don't call updateAuthState here to avoid loops
            }
        } finally {
            setCartLoading(false);
        }
    };

    // Add to cart
    const addToCart = async (product) => {
        // Check authentication first
        if (!isAuthenticated) {
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

            return true;
        } catch (err) {
            console.error("Add to cart failed:", err);
            if (err.response?.status === 401) {
                redirectToLogin();
            }
            return false;
        } finally {
            cartOperations.current.delete(operationKey);
        }
    };

    // Remove from cart
    const removeFromCart = async (product) => {
        // Check authentication first
        if (!isAuthenticated) {
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
        if (!isAuthenticated) {
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
        if (!isAuthenticated) {
            setWishlistItems([]);
            setWishlistCount(0);
            return;
        }

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
        if (!isAuthenticated) {
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
        if (!isAuthenticated) {
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
        if (!isAuthenticated) {
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
        // Initialize authentication state
        const isLoggedInNow = initializeAuth();
        
        // Only fetch data if user is logged in
        if (isLoggedInNow) {
            // Add small delay to ensure auth state is properly set
            setTimeout(() => {
                getCartItems();
                getWishlistItems();
            }, 100);
        }
    }, []);

    // Watch for authentication changes - FIXED to prevent loops
    useEffect(() => {
        // Only log, don't trigger additional actions to avoid loops
        if (isAuthenticated && user) {
            console.log('Auth state: User authenticated');
        } else if (!isAuthenticated) {
            console.log('Auth state: User not authenticated');
        }
    }, [isAuthenticated]); // Removed user dependency to avoid extra triggers

    // ================== CONTEXT VALUE ==================

    const value = {
        // Auth
        isAuthenticated,
        user,
        updateAuthState,
        isLoggedIn,

        // Cart
        cartItems: cartItems || [],
        cartCount: cartCount || 0,
        cartLoading: cartLoading || false,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartItems,
        isInCart,

        // Wishlist
        wishlistItems: wishlistItems || [],
        wishlistCount: wishlistCount || 0,
        wishlistLoading: wishlistLoading || false,
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


// // context/AppContext.jsx - FIXED VERSION
// import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// import { toast } from "react-toastify";
// import AxiosServices from "../network/AxiosServices.jsx";
// import ApiUrlServices from "../network/ApiUrlServices.jsx";
// import path from "../../routes/path.jsx";

// const AppContext = createContext();

// export const useApp = () => {
//     const context = useContext(AppContext);
//     if (!context) {
//         throw new Error('useApp must be used within an AppProvider');
//     }
//     return context;
// };

// export const AppProvider = ({ children }) => {
//     // Authentication State - এটা নতুন যোগ করা হয়েছে
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [user, setUser] = useState(null);

//     // Cart States
//     const [cartItems, setCartItems] = useState([]);
//     const [cartCount, setCartCount] = useState(0);

//     // Wishlist States
//     const [wishlistItems, setWishlistItems] = useState([]);
//     const [wishlistCount, setWishlistCount] = useState(0);

//     // Loading States
//     const [cartLoading, setCartLoading] = useState(false);
//     const [wishlistLoading, setWishlistLoading] = useState(false);

//     // Use refs to track ongoing operations and prevent double calls
//     const cartOperations = useRef(new Set());
//     const wishlistOperations = useRef(new Set());

//     console.log('AppContext - cartItems state:', cartItems);

//     // ✅ IMPROVED: Check if user is logged in - now reactive
//     const isLoggedIn = () => {
//         return isAuthenticated;
//     };

//     // ✅ NEW: Initialize authentication state from localStorage
//     const initializeAuth = () => {
//         try {
//             const userData = JSON.parse(localStorage.getItem('user'));
//             if (userData?.token) {
//                 setIsAuthenticated(true);
//                 setUser(userData);
//                 return true;
//             } else {
//                 setIsAuthenticated(false);
//                 setUser(null);
//                 return false;
//             }
//         } catch (error) {
//             console.error('Error initializing auth:', error);
//             setIsAuthenticated(false);
//             setUser(null);
//             return false;
//         }
//     };

//     // ✅ NEW: Update authentication state
//     const updateAuthState = (userData = null) => {
//         if (userData) {
//             setIsAuthenticated(true);
//             setUser(userData);
//             localStorage.setItem('user', JSON.stringify(userData));
//         } else {
//             setIsAuthenticated(false);
//             setUser(null);
//             localStorage.removeItem('user');
//             // ✅ IMPORTANT: Clear cart/wishlist data on logout
//             setCartItems([]);
//             setCartCount(0);
//             setWishlistItems([]);
//             setWishlistCount(0);
//         }
//     };

//     // ✅ NEW: Listen for storage changes (for multi-tab sync)
//     useEffect(() => {
//         const handleStorageChange = (e) => {
//             if (e.key === 'user') {
//                 if (e.newValue) {
//                     try {
//                         const userData = JSON.parse(e.newValue);
//                         setIsAuthenticated(true);
//                         setUser(userData);
//                         // ✅ IMPROVED: Don't auto-refresh on storage change, 
//                         // user should manually refresh if needed
//                         console.log('User logged in from another tab');
//                     } catch (error) {
//                         console.error('Error parsing user data from storage:', error);
//                         setIsAuthenticated(false);
//                         setUser(null);
//                         setCartItems([]);
//                         setCartCount(0);
//                         setWishlistItems([]);
//                         setWishlistCount(0);
//                     }
//                 } else {
//                     // ✅ User logged out in another tab - immediately clear
//                     console.log('User logged out from another tab');
//                     setIsAuthenticated(false);
//                     setUser(null);
//                     setCartItems([]);
//                     setCartCount(0);
//                     setWishlistItems([]);
//                     setWishlistCount(0);
//                 }
//             }
//         };

//         window.addEventListener('storage', handleStorageChange);
//         return () => window.removeEventListener('storage', handleStorageChange);
//     }, []);

//     // Redirect to login if not authenticated
//     const redirectToLogin = () => {
//         toast.error('Please login first to continue');
//         setTimeout(() => {
//             window.location.href = path.login;
//         }, 1500);
//     };

//     // ================== CART OPERATIONS ==================

//     // Get cart items from API
//     const getCartItems = async () => {
//         // Only fetch if logged in
//         if (!isAuthenticated) {
//             setCartItems([]);
//             setCartCount(0);
//             return;
//         }

//         try {
//             setCartLoading(true);
//             const res = await AxiosServices.get(ApiUrlServices.ALL_CART_LIST);
//             console.log('Cart Items from API:', res.data);
//             setCartItems(res.data);
//             setCartCount(res.data.length);
//         } catch (err) {
//             console.error('Failed to fetch cart items', err);
//             // If 401, user is not logged in
//             if (err.response?.status === 401) {
//                 setCartItems([]);
//                 setCartCount(0);
//                 updateAuthState(null); // Update auth state
//             }
//         } finally {
//             setCartLoading(false);
//         }
//     };

//     // Add to cart
//     const addToCart = async (product) => {
//         // Check authentication first
//         if (!isAuthenticated) {
//             redirectToLogin();
//             return false;
//         }

//         const operationKey = `add_${product.id}`;

//         // Prevent duplicate calls
//         if (cartOperations.current.has(operationKey)) {
//             console.log('Add to cart operation already in progress for product:', product.id);
//             return false;
//         }

//         cartOperations.current.add(operationKey);

//         let payload = {
//             product_id: product.id,
//             quantity: 1,
//         }
//         try {
//             const response = await AxiosServices.post(ApiUrlServices.ADD_CART, payload);
//             console.log('Add to cart response:', response.data);

//             const newCartItem = response.data.cart;

//             setCartItems(prev => {
//                 const existingIndex = prev.findIndex(item => item.product_id === product.id);
//                 if (existingIndex !== -1) {
//                     const updated = [...prev];
//                     updated[existingIndex] = newCartItem;
//                     setCartCount(updated.length);
//                     return updated;
//                 } else {
//                     const newItems = [...prev, newCartItem];
//                     setCartCount(newItems.length);
//                     return newItems;
//                 }
//             });

//             return true;
//         } catch (err) {
//             console.error("Add to cart failed:", err);
//             if (err.response?.status === 401) {
//                 updateAuthState(null);
//                 redirectToLogin();
//             }
//             return false;
//         } finally {
//             cartOperations.current.delete(operationKey);
//         }
//     };

//     // Remove from cart
//     const removeFromCart = async (product) => {
//         // Check authentication first
//         if (!isAuthenticated) {
//             redirectToLogin();
//             return false;
//         }

//         const operationKey = `remove_${product.id}`;

//         // Prevent duplicate calls
//         if (cartOperations.current.has(operationKey)) {
//             console.log('Remove from cart operation already in progress for product:', product.id);
//             return false;
//         }

//         cartOperations.current.add(operationKey);

//         try {
//             // Get fresh cart items to ensure we have the latest data
//             const currentCartItems = cartItems || [];
//             const cartItem = currentCartItems.find(item => item.product_id === product.id);

//             if (!cartItem) {
//                 console.warn("Item not found in cart for product:", product.id);
//                 return false;
//             }

//             console.log('Removing cart item:', cartItem.id, 'for product:', product.id);

//             // Make API call to remove from cart
//             await AxiosServices.delete(ApiUrlServices.DELETE_CART(cartItem.id));

//             // Update local state only after successful API call
//             setCartItems(prev => {
//                 const filtered = prev.filter(item => item.id !== cartItem.id);
//                 console.log('Cart items after removal:', filtered.length);
//                 setCartCount(filtered.length);
//                 return filtered;
//             });

//             return true;
//         } catch (err) {
//             console.error("Remove from cart failed:", err);
//             if (err.response?.status === 401) {
//                 updateAuthState(null);
//                 redirectToLogin();
//             } else if (err.response?.status === 404) {
//                 // Item already removed, just update local state
//                 setCartItems(prev => {
//                     const filtered = prev.filter(item => item.product_id !== product.id);
//                     setCartCount(filtered.length);
//                     return filtered;
//                 });
//                 return true;
//             } else {
//                 toast.error("Failed to remove item from cart");
//             }
//             return false;
//         } finally {
//             cartOperations.current.delete(operationKey);
//         }
//     };

//     // Update cart quantity
//     const updateCartQuantity = async (product, newQuantity) => {
//         // Check authentication first
//         if (!isAuthenticated) {
//             redirectToLogin();
//             return false;
//         }

//         if (newQuantity < 1) return false;

//         const operationKey = `update_${product.id}`;

//         // Prevent duplicate calls
//         if (cartOperations.current.has(operationKey)) {
//             console.log('Update cart operation already in progress for product:', product.id);
//             return false;
//         }

//         cartOperations.current.add(operationKey);

//         try {
//             const cartItem = cartItems.find(item => item.product_id === product.id);

//             if (!cartItem) {
//                 console.error('Cart item not found for product:', product.id);
//                 toast.error("Cart item not found");
//                 return false;
//             }

//             console.log('Updating cart item:', cartItem.id, 'to quantity:', newQuantity);

//             const payload = { quantity: newQuantity };
//             const apiUrl = ApiUrlServices.UPDATE_CART(cartItem.id);
//             console.log('API URL:', apiUrl);

//             const response = await AxiosServices.put(apiUrl, payload);
//             console.log('Update quantity response:', response.data);

//             // Update local state
//             setCartItems(prev => {
//                 const updated = prev.map(item => {
//                     if (item.product_id === product.id) {
//                         return { ...item, quantity: newQuantity };
//                     }
//                     return item;
//                 });
//                 return updated;
//             });

//             toast.success("Quantity updated successfully!");
//             return true;
//         } catch (err) {
//             console.error("Update quantity failed:", err);

//             // Better error messages
//             if (err.response?.status === 422) {
//                 toast.error(err.response.data.message || "Stock limited");
//             } else if (err.response?.status === 404) {
//                 toast.error("Cart item not found");
//             } else if (err.response?.status === 401) {
//                 updateAuthState(null);
//                 redirectToLogin();
//             } else {
//                 toast.error("Failed to update quantity");
//             }

//             return false;
//         } finally {
//             cartOperations.current.delete(operationKey);
//         }
//     };

//     // Check if product is in cart
//     const isInCart = (productId) => {
//         return cartItems.some(item => item.product_id === productId);
//     };

//     // ================== WISHLIST OPERATIONS ==================

//     // Get wishlist items from API
//     const getWishlistItems = async () => {
//         // Only fetch if logged in
//         if (!isAuthenticated) {
//             setWishlistItems([]);
//             setWishlistCount(0);
//             return;
//         }

//         try {
//             setWishlistLoading(true);
//             const res = await AxiosServices.get(ApiUrlServices.ALL_WISHLIST_LIST);
//             console.log('Wishlist Items from API:', res.data);
//             setWishlistItems(res.data);
//             setWishlistCount(res.data.length);
//         } catch (err) {
//             console.error('Failed to fetch wishlist items', err);
//             // If 401, user is not logged in
//             if (err.response?.status === 401) {
//                 setWishlistItems([]);
//                 setWishlistCount(0);
//                 updateAuthState(null);
//             }
//         } finally {
//             setWishlistLoading(false);
//         }
//     };

//     // Add to wishlist
//     const addToWishlist = async (product) => {
//         // Check authentication first
//         if (!isAuthenticated) {
//             redirectToLogin();
//             return false;
//         }

//         const operationKey = `add_wishlist_${product.id}`;

//         // Prevent duplicate calls
//         if (wishlistOperations.current.has(operationKey)) {
//             console.log('Add to wishlist operation already in progress for product:', product.id);
//             return false;
//         }

//         wishlistOperations.current.add(operationKey);

//         let payload = {
//             product_id: product.id,
//         }
//         try {
//             const response = await AxiosServices.post(ApiUrlServices.ADD_WISHLIST, payload);
//             console.log('Add to wishlist response:', response.data);

//             const newWishlistItem = response.data.wishlist;

//             setWishlistItems(prev => {
//                 const exists = prev.find(item => item.product_id === product.id);
//                 if (!exists) {
//                     const newItems = [...prev, newWishlistItem];
//                     setWishlistCount(newItems.length);
//                     return newItems;
//                 }
//                 return prev;
//             });

//             return true;
//         } catch (err) {
//             console.error("Add to wishlist failed:", err);
//             if (err.response?.status === 401) {
//                 updateAuthState(null);
//                 redirectToLogin();
//             } else {
//                 toast.error("Failed to add to wishlist");
//             }
//             return false;
//         } finally {
//             wishlistOperations.current.delete(operationKey);
//         }
//     };

//     // Remove from wishlist
//     const removeFromWishlist = async (product) => {
//         // Check authentication first
//         if (!isAuthenticated) {
//             redirectToLogin();
//             return false;
//         }

//         const operationKey = `remove_wishlist_${product.id}`;

//         // Prevent duplicate calls
//         if (wishlistOperations.current.has(operationKey)) {
//             console.log('Remove from wishlist operation already in progress for product:', product.id);
//             return false;
//         }

//         wishlistOperations.current.add(operationKey);

//         try {
//             const wishlistItem = wishlistItems.find(item => item.product_id === product.id);

//             if (!wishlistItem) {
//                 return false;
//             }

//             await AxiosServices.delete(ApiUrlServices.DELETE_WISHLIST(wishlistItem.id));

//             setWishlistItems(prev => {
//                 const filtered = prev.filter(item => item.id !== wishlistItem.id);
//                 setWishlistCount(filtered.length);
//                 return filtered;
//             });

//             return true;
//         } catch (err) {
//             console.error("Remove from wishlist failed:", err);
//             if (err.response?.status === 401) {
//                 updateAuthState(null);
//                 redirectToLogin();
//             } else {
//                 toast.error("Failed to remove from wishlist");
//             }
//             return false;
//         } finally {
//             wishlistOperations.current.delete(operationKey);
//         }
//     };

//     // Toggle wishlist (add if not exists, remove if exists)
//     const toggleWishlist = async (product) => {
//         // Check authentication first
//         if (!isAuthenticated) {
//             redirectToLogin();
//             return { success: false, action: 'authentication_required', isWishlisted: false };
//         }

//         const exists = wishlistItems.find(item => item.product_id === product.id);

//         if (exists) {
//             const success = await removeFromWishlist(product);
//             if (success) {
//                 toast.success("Removed from wishlist!");
//             }
//             return { success, action: 'removed', isWishlisted: false };
//         } else {
//             const success = await addToWishlist(product);
//             if (success) {
//                 toast.success("Added to wishlist!");
//             }
//             return { success, action: 'added', isWishlisted: true };
//         }
//     };

//     // Check if product is in wishlist
//     const isInWishlist = (productId) => {
//         return wishlistItems.some(item => item.product_id === productId);
//     };

//     // ================== INITIAL LOAD ==================

//     useEffect(() => {
//         // Initialize authentication state
//         const isLoggedInNow = initializeAuth();
        
//         // Only fetch data if user is logged in
//         if (isLoggedInNow) {
//             // ✅ Add small delay to ensure auth state is properly set
//             setTimeout(() => {
//                 getCartItems();
//                 getWishlistItems();
//             }, 100);
//         }
//     }, []);

//     // ✅ NEW: Watch for authentication changes
//     useEffect(() => {
//         if (isAuthenticated && user) {
//             // User just logged in, refresh data
//             console.log('User authenticated, refreshing cart and wishlist...');
//             getCartItems();
//             getWishlistItems();
//         } else if (!isAuthenticated) {
//             // User logged out, clear data
//             console.log('User logged out, clearing cart and wishlist...');
//             setCartItems([]);
//             setCartCount(0);
//             setWishlistItems([]);
//             setWishlistCount(0);
//         }
//     }, [isAuthenticated]);

//     // ================== CONTEXT VALUE ==================

//     const value = {
//         // Auth
//         isAuthenticated,
//         user,
//         updateAuthState,
//         isLoggedIn,

//         // Cart
//         cartItems: cartItems || [],
//         cartCount: cartCount || 0,
//         cartLoading: cartLoading || false,
//         addToCart,
//         removeFromCart,
//         updateCartQuantity,
//         getCartItems,
//         isInCart,

//         // Wishlist
//         wishlistItems: wishlistItems || [],
//         wishlistCount: wishlistCount || 0,
//         wishlistLoading: wishlistLoading || false,
//         addToWishlist,
//         removeFromWishlist,
//         toggleWishlist,
//         getWishlistItems,
//         isInWishlist,
//     };

//     return (
//         <AppContext.Provider value={value}>
//             {children}
//         </AppContext.Provider>
//     );
// };



// // // context/AppContext.jsx
// // import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// // import { toast } from "react-toastify";
// // import AxiosServices from "../network/AxiosServices.jsx";
// // import ApiUrlServices from "../network/ApiUrlServices.jsx";
// // import path from "../../routes/path.jsx";

// // const AppContext = createContext();

// // export const useApp = () => {
// //     const context = useContext(AppContext);
// //     if (!context) {
// //         throw new Error('useApp must be used within an AppProvider');
// //     }
// //     return context;
// // };

// // export const AppProvider = ({ children }) => {
// //     // Cart States
// //     const [cartItems, setCartItems] = useState([]);
// //     const [cartCount, setCartCount] = useState(0);

// //     // Wishlist States
// //     const [wishlistItems, setWishlistItems] = useState([]);
// //     const [wishlistCount, setWishlistCount] = useState(0);

// //     // Loading States
// //     const [cartLoading, setCartLoading] = useState(false);
// //     const [wishlistLoading, setWishlistLoading] = useState(false);

// //     // Use refs to track ongoing operations and prevent double calls
// //     const cartOperations = useRef(new Set());
// //     const wishlistOperations = useRef(new Set());

// //     console.log('AppContext - cartItems state:', cartItems); // Debug log

// //     // Check if user is logged in
// //     const isLoggedIn = () => {
// //         try {
// //             const user = JSON.parse(localStorage.getItem('user'));
// //             return !!user?.token;
// //         } catch (error) {
// //             console.error('Error checking login status:', error);
// //             return false;
// //         }
// //     };

// //     // Redirect to login if not authenticated
// //     const redirectToLogin = () => {
// //         toast.error('Please login first to continue');
// //         setTimeout(() => {
// //             window.location.href = path.login;
// //         }, 1500);
// //     };

// //     // ================== CART OPERATIONS ==================

// //     // Get cart items from API
// //     const getCartItems = async () => {
// //         // Only fetch if logged in
// //         if (!isLoggedIn()) return;

// //         try {
// //             setCartLoading(true);
// //             const res = await AxiosServices.get(ApiUrlServices.ALL_CART_LIST);
// //             console.log('Cart Items from API:', res.data);
// //             setCartItems(res.data);
// //             setCartCount(res.data.length);
// //         } catch (err) {
// //             console.error('Failed to fetch cart items', err);
// //             // If 401, user is not logged in
// //             if (err.response?.status === 401) {
// //                 setCartItems([]);
// //                 setCartCount(0);
// //             }
// //         } finally {
// //             setCartLoading(false);
// //         }
// //     };

// //     // Add to cart
// //     const addToCart = async (product) => {
// //         // Check authentication first
// //         if (!isLoggedIn()) {
// //             redirectToLogin();
// //             return false;
// //         }

// //         const operationKey = `add_${product.id}`;

// //         // Prevent duplicate calls
// //         if (cartOperations.current.has(operationKey)) {
// //             console.log('Add to cart operation already in progress for product:', product.id);
// //             return false;
// //         }

// //         cartOperations.current.add(operationKey);

// //         let payload = {
// //             product_id: product.id,
// //             quantity: 1,
// //         }
// //         try {
// //             const response = await AxiosServices.post(ApiUrlServices.ADD_CART, payload);
// //             console.log('Add to cart response:', response.data);

// //             const newCartItem = response.data.cart;

// //             setCartItems(prev => {
// //                 const existingIndex = prev.findIndex(item => item.product_id === product.id);
// //                 if (existingIndex !== -1) {
// //                     const updated = [...prev];
// //                     updated[existingIndex] = newCartItem;
// //                     setCartCount(updated.length);
// //                     return updated;
// //                 } else {
// //                     const newItems = [...prev, newCartItem];
// //                     setCartCount(newItems.length);
// //                     return newItems;
// //                 }
// //             });

// //             // toast.success("Product added to cart successfully!");
// //             return true;
// //         } catch (err) {
// //             console.error("Add to cart failed:", err);
// //             if (err.response?.status === 401) {
// //                 redirectToLogin();
// //             } else {
// //                 // toast.error("Failed to add product to cart");
// //             }
// //             return false;
// //         } finally {
// //             cartOperations.current.delete(operationKey);
// //         }
// //     };

// //     // Remove from cart
// //     const removeFromCart = async (product) => {
// //         // Check authentication first
// //         if (!isLoggedIn()) {
// //             redirectToLogin();
// //             return false;
// //         }

// //         const operationKey = `remove_${product.id}`;

// //         // Prevent duplicate calls
// //         if (cartOperations.current.has(operationKey)) {
// //             console.log('Remove from cart operation already in progress for product:', product.id);
// //             return false;
// //         }

// //         cartOperations.current.add(operationKey);

// //         try {
// //             // Get fresh cart items to ensure we have the latest data
// //             const currentCartItems = cartItems || [];
// //             const cartItem = currentCartItems.find(item => item.product_id === product.id);

// //             if (!cartItem) {
// //                 console.warn("Item not found in cart for product:", product.id);
// //                 // Don't show error toast, just return false
// //                 return false;
// //             }

// //             console.log('Removing cart item:', cartItem.id, 'for product:', product.id);

// //             // Make API call to remove from cart
// //             await AxiosServices.delete(ApiUrlServices.DELETE_CART(cartItem.id));

// //             // Update local state only after successful API call
// //             setCartItems(prev => {
// //                 const filtered = prev.filter(item => item.id !== cartItem.id);
// //                 console.log('Cart items after removal:', filtered.length);
// //                 setCartCount(filtered.length);
// //                 return filtered;
// //             });

// //             // Don't show success toast here - let the calling component handle it
// //             return true;
// //         } catch (err) {
// //             console.error("Remove from cart failed:", err);
// //             if (err.response?.status === 401) {
// //                 redirectToLogin();
// //             } else if (err.response?.status === 404) {
// //                 // Item already removed, just update local state
// //                 setCartItems(prev => {
// //                     const filtered = prev.filter(item => item.product_id !== product.id);
// //                     setCartCount(filtered.length);
// //                     return filtered;
// //                 });
// //                 return true;
// //             } else {
// //                 toast.error("Failed to remove item from cart");
// //             }
// //             return false;
// //         } finally {
// //             cartOperations.current.delete(operationKey);
// //         }
// //     };

// //     // Update cart quantity
// //     const updateCartQuantity = async (product, newQuantity) => {
// //         // Check authentication first
// //         if (!isLoggedIn()) {
// //             redirectToLogin();
// //             return false;
// //         }

// //         if (newQuantity < 1) return false;

// //         const operationKey = `update_${product.id}`;

// //         // Prevent duplicate calls
// //         if (cartOperations.current.has(operationKey)) {
// //             console.log('Update cart operation already in progress for product:', product.id);
// //             return false;
// //         }

// //         cartOperations.current.add(operationKey);

// //         try {
// //             const cartItem = cartItems.find(item => item.product_id === product.id);

// //             if (!cartItem) {
// //                 console.error('Cart item not found for product:', product.id);
// //                 toast.error("Cart item not found");
// //                 return false;
// //             }

// //             console.log('Updating cart item:', cartItem.id, 'to quantity:', newQuantity);

// //             const payload = { quantity: newQuantity };
// //             const apiUrl = ApiUrlServices.UPDATE_CART(cartItem.id);
// //             console.log('API URL:', apiUrl);

// //             const response = await AxiosServices.put(apiUrl, payload);
// //             console.log('Update quantity response:', response.data);

// //             // Update local state
// //             setCartItems(prev => {
// //                 const updated = prev.map(item => {
// //                     if (item.product_id === product.id) {
// //                         return { ...item, quantity: newQuantity };
// //                     }
// //                     return item;
// //                 });
// //                 return updated;
// //             });

// //             toast.success("Quantity updated successfully!");
// //             return true;
// //         } catch (err) {
// //             console.error("Update quantity failed:", err);

// //             // Better error messages
// //             if (err.response?.status === 422) {
// //                 toast.error(err.response.data.message || "Stock limited");
// //             } else if (err.response?.status === 404) {
// //                 toast.error("Cart item not found");
// //             } else if (err.response?.status === 401) {
// //                 redirectToLogin();
// //             } else {
// //                 toast.error("Failed to update quantity");
// //             }

// //             return false;
// //         } finally {
// //             cartOperations.current.delete(operationKey);
// //         }
// //     };

// //     // Check if product is in cart
// //     const isInCart = (productId) => {
// //         return cartItems.some(item => item.product_id === productId);
// //     };

// //     // ================== WISHLIST OPERATIONS ==================

// //     // Get wishlist items from API
// //     const getWishlistItems = async () => {
// //         // Only fetch if logged in
// //         if (!isLoggedIn()) return;

// //         try {
// //             setWishlistLoading(true);
// //             const res = await AxiosServices.get(ApiUrlServices.ALL_WISHLIST_LIST);
// //             console.log('Wishlist Items from API:', res.data);
// //             setWishlistItems(res.data);
// //             setWishlistCount(res.data.length);
// //         } catch (err) {
// //             console.error('Failed to fetch wishlist items', err);
// //             // If 401, user is not logged in
// //             if (err.response?.status === 401) {
// //                 setWishlistItems([]);
// //                 setWishlistCount(0);
// //             }
// //         } finally {
// //             setWishlistLoading(false);
// //         }
// //     };

// //     // Add to wishlist
// //     const addToWishlist = async (product) => {
// //         // Check authentication first
// //         if (!isLoggedIn()) {
// //             redirectToLogin();
// //             return false;
// //         }

// //         const operationKey = `add_wishlist_${product.id}`;

// //         // Prevent duplicate calls
// //         if (wishlistOperations.current.has(operationKey)) {
// //             console.log('Add to wishlist operation already in progress for product:', product.id);
// //             return false;
// //         }

// //         wishlistOperations.current.add(operationKey);

// //         let payload = {
// //             product_id: product.id,
// //         }
// //         try {
// //             const response = await AxiosServices.post(ApiUrlServices.ADD_WISHLIST, payload);
// //             console.log('Add to wishlist response:', response.data);

// //             const newWishlistItem = response.data.wishlist;

// //             setWishlistItems(prev => {
// //                 const exists = prev.find(item => item.product_id === product.id);
// //                 if (!exists) {
// //                     const newItems = [...prev, newWishlistItem];
// //                     setWishlistCount(newItems.length);
// //                     return newItems;
// //                 }
// //                 return prev;
// //             });

// //             return true;
// //         } catch (err) {
// //             console.error("Add to wishlist failed:", err);
// //             if (err.response?.status === 401) {
// //                 redirectToLogin();
// //             } else {
// //                 toast.error("Failed to add to wishlist");
// //             }
// //             return false;
// //         } finally {
// //             wishlistOperations.current.delete(operationKey);
// //         }
// //     };

// //     // Remove from wishlist
// //     const removeFromWishlist = async (product) => {
// //         // Check authentication first
// //         if (!isLoggedIn()) {
// //             redirectToLogin();
// //             return false;
// //         }

// //         const operationKey = `remove_wishlist_${product.id}`;

// //         // Prevent duplicate calls
// //         if (wishlistOperations.current.has(operationKey)) {
// //             console.log('Remove from wishlist operation already in progress for product:', product.id);
// //             return false;
// //         }

// //         wishlistOperations.current.add(operationKey);

// //         try {
// //             const wishlistItem = wishlistItems.find(item => item.product_id === product.id);

// //             if (!wishlistItem) {
// //                 return false;
// //             }

// //             await AxiosServices.delete(ApiUrlServices.DELETE_WISHLIST(wishlistItem.id));

// //             setWishlistItems(prev => {
// //                 const filtered = prev.filter(item => item.id !== wishlistItem.id);
// //                 setWishlistCount(filtered.length);
// //                 return filtered;
// //             });

// //             return true;
// //         } catch (err) {
// //             console.error("Remove from wishlist failed:", err);
// //             if (err.response?.status === 401) {
// //                 redirectToLogin();
// //             } else {
// //                 toast.error("Failed to remove from wishlist");
// //             }
// //             return false;
// //         } finally {
// //             wishlistOperations.current.delete(operationKey);
// //         }
// //     };

// //     // Toggle wishlist (add if not exists, remove if exists)
// //     const toggleWishlist = async (product) => {
// //         // Check authentication first
// //         if (!isLoggedIn()) {
// //             redirectToLogin();
// //             return { success: false, action: 'authentication_required', isWishlisted: false };
// //         }

// //         const exists = wishlistItems.find(item => item.product_id === product.id);

// //         if (exists) {
// //             const success = await removeFromWishlist(product);
// //             if (success) {
// //                 toast.success("Removed from wishlist!");
// //             }
// //             return { success, action: 'removed', isWishlisted: false };
// //         } else {
// //             const success = await addToWishlist(product);
// //             if (success) {
// //                 toast.success("Added to wishlist!");
// //             }
// //             return { success, action: 'added', isWishlisted: true };
// //         }
// //     };

// //     // Check if product is in wishlist
// //     const isInWishlist = (productId) => {
// //         return wishlistItems.some(item => item.product_id === productId);
// //     };

// //     // ================== INITIAL LOAD ==================

// //     useEffect(() => {
// //         // Only fetch data if user is logged in
// //         if (isLoggedIn()) {
// //             getCartItems();
// //             getWishlistItems();
// //         }
// //     }, []);

// //     // ================== CONTEXT VALUE ==================

// //     const value = {
// //         // Cart
// //         cartItems: cartItems || [], // Safety fallback
// //         cartCount: cartCount || 0,
// //         cartLoading: cartLoading || false,
// //         addToCart,
// //         removeFromCart,
// //         updateCartQuantity,
// //         getCartItems,
// //         isInCart,

// //         // Wishlist
// //         wishlistItems: wishlistItems || [], // Safety fallback
// //         wishlistCount: wishlistCount || 0,
// //         wishlistLoading: wishlistLoading || false,
// //         addToWishlist,
// //         removeFromWishlist,
// //         toggleWishlist,
// //         getWishlistItems,
// //         isInWishlist,

// //         // Auth utilities
// //         isLoggedIn,
// //     };

// //     return (
// //         <AppContext.Provider value={value}>
// //             {children}
// //         </AppContext.Provider>
// //     );
// // };
// context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AxiosServices from "../network/AxiosServices.jsx";
import ApiUrlServices from "../network/ApiUrlServices.jsx";

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    // Get cart items from API
    const getCartItems = async () => {
        try {
            const res = await AxiosServices.get(ApiUrlServices.ALL_CART_LIST);
            console.log('Cart Items from API:', res.data);
            setCartItems(res.data);
            setCartCount(res.data.length); // Cart count set করুন
        } catch (err) {
            console.error('Failed to fetch cart items', err);
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
                    setCartCount(newItems.length); // Count update করুন
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
                setCartCount(filtered.length); // Count update করুন
                return filtered;
            });

            return true;
        } catch (err) {
            console.error("Remove from cart failed:", err);
            return false;
        }
    };

    // Initial load
    useEffect(() => {
        getCartItems();
    }, []);

    const value = {
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        getCartItems
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
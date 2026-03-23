import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart({ items: [] });
        }
    }, [user]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await api.get('/cart');
            setCart(response.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            const response = await api.post('/cart/add', { productId, quantity });
            setCart(response.data);
            return true;
        } catch (error) {
            console.error('Error adding to cart:', error);
            return false;
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const response = await api.post(`/cart/remove/${productId}`);
            console.log("DEBUG: Cart after removal:", response.data);
            setCart(response.data);
            return true;

        } catch (error) {
            console.error('Error removing from cart:', error);
            return false;
        }
    };

    const clearCart = () => {
        setCart({ items: [] });
    };

    const cartItems = cart?.items || [];
    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + ((item.product?.price || 0) * (item.quantity || 0)), 0);


    return (
        <CartContext.Provider value={{ cart, cartItems, loading, fetchCart, addToCart, removeFromCart, clearCart, cartCount, cartTotal }}>

            {children}
        </CartContext.Provider>
    );
};


export const useCart = () => useContext(CartContext);

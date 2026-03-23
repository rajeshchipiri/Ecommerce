import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { CheckCircle } from 'lucide-react';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            await api.post('/orders');
            setOrderPlaced(true);
            clearCart();
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
        } catch (error) {
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (orderPlaced) {
        return (
            <div className="order-success">
                <CheckCircle size={64} color="green" />
                <h2>Order Placed Successfully!</h2>
                <p>Thank you for your purchase. You will be redirected to the dashboard shortly.</p>
            </div>
        );
    }

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>
            <div className="checkout-grid">
                <div className="checkout-info">
                    <h2>Shipping Information</h2>
                    <p>Standard Shipping (Free)</p>
                    <p>Estimated Delivery: 3-5 Business Days</p>
                    
                    <h2 style={{ marginTop: '2rem' }}>Payment</h2>
                    <p>Mock Payment Gateway - No real payment will be processed.</p>
                </div>
                <div className="checkout-summary">
                    <h2>Summary</h2>
                    <div className="summary-row">
                        <span>Items ({cart.items.length})</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row total">
                        <span>Total to Pay</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <button 
                        className="btn-primary btn-block" 
                        onClick={handlePlaceOrder}
                        disabled={loading || cart.items.length === 0}
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

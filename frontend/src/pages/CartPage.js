import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

const CartPage = () => {
    const { cartItems, removeFromCart, cartTotal, loading } = useCart();


    if (loading) return <div className="loading">Loading cart...</div>;

    if (!cartItems || cartItems.length === 0) {

        return (
            <div className="empty-cart">
                <ShoppingBag size={64} />
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/dashboard" className="btn-primary">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <h1>Your Shopping Cart</h1>
            <div className="cart-grid">
                <div className="cart-items">
                    {cartItems.map(item => (

                        <div key={item.id} className="cart-item">
                            <div className="item-details">
                                <h3>{item.product.name}</h3>
                                <p>{item.product.description}</p>
                            </div>
                            <div className="item-pricing">
                                <span className="item-price">${item.product.price.toFixed(2)}</span>
                                <span className="item-quantity">Qty: {item.quantity}</span>
                                <button className="btn-icon delete" onClick={() => removeFromCart(item.product.id)}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="cart-summary">
                    <h2>Order Summary</h2>
                    <div className="summary-row">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <hr />
                    <div className="summary-row total">
                        <span>Total</span>
                        <span>${cartTotal.toFixed(2)}</span>
                    </div>
                    <Link to="/checkout" className="btn-primary btn-block">
                        Proceed to Checkout <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CartPage;

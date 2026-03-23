import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Mail, ArrowRight, Loader } from 'lucide-react';

const CheckoutPage = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [orderCreated, setOrderCreated] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('RAZORPAY');
    const navigate = useNavigate();

    const totalPrice = cart?.items?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePlaceOrder = async (method = paymentMethod) => {
        if (totalPrice === 0) return;
        setLoading(true);

        try {
            if (method === 'COD') {
                // Direct COD Order
                await api.post('/orders', { paymentMethod: 'COD' });
                clearCart();
                setOrderCreated(true);
                setTimeout(() => navigate('/dashboard'), 5000);
            } else {
                // 1. Create Order on Backend for Razorpay
                const { data: orderData } = await api.post('/payment/create-order', { amount: totalPrice });
                
                // 2. Configure Razorpay Options
                const options = {
                    key: orderData.keyId,
                    amount: orderData.amount * 100,
                    currency: orderData.currency,
                    name: "Ecommerce Store",
                    description: "Purchase payment",
                    order_id: orderData.razorpayOrderId,
                    handler: async (response) => {
                        try {
                            const verifyRes = await api.post('/payment/verify', {
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            });

                            if (verifyRes.data.success) {
                                await api.post('/orders', { paymentMethod: 'RAZORPAY' });
                                clearCart();
                                setOrderCreated(true);
                                setTimeout(() => navigate('/dashboard'), 5000);
                            }
                        } catch (err) {
                            alert("Payment verification failed!");
                        }
                    },
                    prefill: {
                        name: user?.username,
                        email: user?.email || "customer@example.com"
                    },
                    theme: {
                        color: "#4f46e5"
                    }
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (error) {
            console.error("Order initiation failed", error);
            alert("Something went wrong while placing your order.");
        } finally {
            setLoading(false);
        }
    };

    if (orderCreated) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ background: 'white', padding: '48px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ color: 'var(--success)', marginBottom: '24px' }}>
                        <ShieldCheck size={80} strokeWidth={1.5} style={{ margin: 'auto' }} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>Order Success! 🎉</h1>
                    <p style={{ color: 'var(--text-mute)', fontSize: '1.2rem', marginBottom: '32px' }}>
                        A confirmation email has been sent to <strong>{user?.email}</strong>
                    </p>
                    <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '12px 32px' }}>
                        Go to Dashboard <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container payment-page">
            <h1 style={{ margin: '40px 0 24px' }}>Checkout Summary</h1>
            
            <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                <div className="card" style={{ padding: '32px' }}>
                    <h3 style={{ marginBottom: '20px' }}>Order Items</h3>
                    {cart?.items?.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div>
                                    <h4 style={{ margin: 0 }}>{item.product.name}</h4>
                                    <p style={{ color: 'var(--text-mute)', margin: 0 }}>Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <p style={{ fontWeight: '600' }}>₹{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    
                    <div style={{ marginTop: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Subtotal</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Shipping</span>
                            <span style={{ color: 'var(--success)' }}>FREE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '16px', borderTop: '2px solid white', fontWeight: '800', fontSize: '1.5rem' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--primary)' }}>₹{totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '32px', alignSelf: 'start' }}>
                    <h3 style={{ marginBottom: '24px' }}>Choose Payment Method</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                        <div 
                            onClick={() => setPaymentMethod('RAZORPAY')}
                            style={{ 
                                padding: '16px', borderRadius: '12px', border: `2px solid ${paymentMethod === 'RAZORPAY' ? '#4f46e5' : '#e2e8f0'}`,
                                cursor: 'pointer', background: paymentMethod === 'RAZORPAY' ? '#f5f3ff' : 'white', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CreditCard size={20} color={paymentMethod === 'RAZORPAY' ? '#4f46e5' : '#64748b'} />
                                    <span style={{ fontWeight: '600' }}>Pay Online</span>
                                </div>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #4f46e5', padding: '3px' }}>
                                    {paymentMethod === 'RAZORPAY' && <div style={{ width: '100%', height: '100%', background: '#4f46e5', borderRadius: '50%' }} />}
                                </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 0 32px' }}>Credit/Debit Card, UPI, Netbanking</p>
                        </div>

                        <div 
                            onClick={() => setPaymentMethod('COD')}
                            style={{ 
                                padding: '16px', borderRadius: '12px', border: `2px solid ${paymentMethod === 'COD' ? '#4f46e5' : '#e2e8f0'}`,
                                cursor: 'pointer', background: paymentMethod === 'COD' ? '#f5f3ff' : 'white', transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ShieldCheck size={20} color={paymentMethod === 'COD' ? '#4f46e5' : '#64748b'} />
                                    <span style={{ fontWeight: '600' }}>Cash on Delivery</span>
                                </div>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #4f46e5', padding: '3px' }}>
                                    {paymentMethod === 'COD' && <div style={{ width: '100%', height: '100%', background: '#4f46e5', borderRadius: '50%' }} />}
                                </div>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '8px 0 0 32px' }}>Pay when you receive your order</p>
                        </div>
                    </div>

                    <button 
                        className="btn-primary" 
                        onClick={() => handlePlaceOrder()} 
                        disabled={loading || totalPrice === 0}
                        style={{ width: '100%', padding: '16px', borderRadius: '12px', fontSize: '1.1rem', gap: '12px' }}
                    >
                        {loading ? (
                            <Loader className="animate-spin" size={24} />
                        ) : (
                            <>{paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'} ₹{totalPrice.toFixed(2)}</>
                        )}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" style={{ width: '100px', opacity: 0.5 }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

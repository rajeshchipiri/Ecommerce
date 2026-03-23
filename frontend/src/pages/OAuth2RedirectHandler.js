import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        const getUrlParameter = (name) => {
            name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
            const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            const results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        const token = getUrlParameter('token');

        if (token) {
            // We use a simplified login for OAuth to just store the token
            localStorage.setItem('token', token);
            // In a real app, you might fetch user details again here
            // For now, we'll just redirect to dashboard
            navigate('/dashboard');
            window.location.reload(); // Force refresh to update context
        } else {
            navigate('/login');
        }
    }, [location.search, navigate, login]);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Processing Login...</h2>
                <div className="loader"></div>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;

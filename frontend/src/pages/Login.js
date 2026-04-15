import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ usernameOrEmail: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/auth/signin', credentials);
            const { accessToken, username, roles } = response.data;
            login(accessToken, { username, roles });
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Redirect to Backend OAuth2 endpoint using the dynamic API URL
        const authUrl = api.defaults.baseURL.replace('/api', '');
        window.location.href = `${authUrl}/oauth2/authorization/google`;
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Welcome Back</h2>
                <p>Login to your account</p>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username or Email</label>
                        <div className="input-icon">
                            <Mail size={18} />
                            <input
                                type="text"
                                name="usernameOrEmail"
                                value={credentials.usernameOrEmail}
                                onChange={handleChange}
                                placeholder="Enter username or email"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-icon">
                            <Lock size={18} />
                            <input
                                type="password"
                                name="password"
                                value={credentials.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Logging in...' : <><LogIn size={18} /> Login</>}
                    </button>
                </form>
                
                <div className="divider">
                    <span>OR</span>
                </div>
                
                <button onClick={handleGoogleLogin} className="btn-google">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                    Login with Google
                </button>
                
                <p className="auth-footer">
                    Don't have an account? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

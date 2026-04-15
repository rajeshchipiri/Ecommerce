import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({ email: '' });
    const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({ email: user.email || '' });
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/user/me', profileData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/user/change-password', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data || 'Failed to change password.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action is IRREVERSIBLE and will delete all your data including orders and cart.")) {
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await api.delete('/user/me');
            logout();
            navigate('/login');
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete account. Please try again later.' });
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <h1>User Profile</h1>
            <div className="profile-grid">
                <div className="profile-section">
                    <h2><User size={20} />Personal Information</h2>
                    <form onSubmit={handleProfileSubmit}>
                        <div className="form-group">
                            <label>Username</label>
                            <input type="text" value={user?.username} disabled className="disabled-input" />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <div className="input-icon">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>Update Profile</button>
                    </form>
                </div>

                <div className="profile-section">
                    <h2><Lock size={20} />Change Password</h2>
                    <form onSubmit={handlePasswordSubmit}>
                        <div className="form-group">
                            <label>Old Password</label>
                            <input
                                type="password"
                                value={passwordData.oldPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>Change Password</button>
                    </form>
                </div>
            </div>

            <div className="profile-section dangerously-section">
                <h2><Trash2 size={20} color="#dc3545" /> Danger Zone</h2>
                <p>Deleting your account is permanent and cannot be undone.</p>
                <button 
                    onClick={handleDeleteAccount} 
                    className="btn-danger-solid" 
                    disabled={loading}
                >
                    Delete My Account
                </button>
            </div>

            {message.text && (
                <div className={`message-banner ${message.type}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default Profile;

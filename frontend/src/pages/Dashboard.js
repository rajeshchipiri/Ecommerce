import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({ name: '', description: '', price: '', imageUrl: '', category: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [notification, setNotification] = useState(null);
    
    const { user } = useAuth();
    const isAdmin = user?.roles?.some(r => r.authority === 'ROLE_ADMIN' || r === 'ROLE_ADMIN');

    useEffect(() => {
        fetchProducts();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/products/${currentProduct.id}`, currentProduct);
                showNotification('Product updated successfully! ✅');
            } else {
                await api.post('/products', currentProduct);
                showNotification('Product created successfully! 🎉');
            }
            setShowModal(false);
            setCurrentProduct({ name: '', description: '', price: '', imageUrl: '', category: '' });
            setIsEditing(false);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            showNotification('Failed to save product.', 'error');
        }
    };

    const handleEdit = (product) => {
        setCurrentProduct({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl || '',
            category: product.category || ''
        });
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.post(`/products/delete/${id}`);
                showNotification('Product deleted! 🗑️');
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
                showNotification('Failed to delete product.', 'error');
            }
        }
    };

    return (
        <div className="dashboard-container">
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}

            <header className="dashboard-header">
                <div className="header-info">
                    <h1>Product Dashboard</h1>
                    <p>Welcome, {user?.username}</p>
                </div>
                {isAdmin && (
                    <button className="btn-primary" onClick={() => { setShowModal(true); setIsEditing(false); setCurrentProduct({ name: '', description: '', price: '', imageUrl: '', category: '' }); }}>
                        <Plus size={18} /> Add Product
                    </button>
                )}
            </header>

            {loading ? (
                <div className="loading">Loading products...</div>
            ) : (
                <div className="product-grid">
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                isAdmin={isAdmin}
                                onEdit={() => handleEdit(product)}
                                onDelete={() => handleDelete(product.id)}
                            />
                        ))
                    ) : (
                        <div className="no-products">
                            <Package size={48} />
                            <p>No products available.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Admin-only CRUD Modal */}
            {showModal && isAdmin && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input type="text" name="name" value={currentProduct.name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Description *</label>
                                <textarea name="description" value={currentProduct.description} onChange={handleInputChange} rows="3" required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Price ($) *</label>
                                    <input type="number" step="0.01" min="0" name="price" value={currentProduct.price} onChange={handleInputChange} required />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select name="category" value={currentProduct.category} onChange={handleInputChange}>
                                        <option value="">Select</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Clothing">Clothing</option>
                                        <option value="Home">Home</option>
                                        <option value="Sports">Sports</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input type="url" name="imageUrl" value={currentProduct.imageUrl} onChange={handleInputChange} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">{isEditing ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

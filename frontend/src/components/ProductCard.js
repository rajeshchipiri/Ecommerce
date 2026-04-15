import { useCart } from '../context/CartContext';
import { Edit, Trash2, Tag, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, isAdmin, onEdit, onDelete }) => {
    const { addToCart } = useCart();

    return (
        <div className="product-card">
            <div className="product-image">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                ) : (
                    <Tag size={48} color="#4f46e5" />
                )}
            </div>

            <div className="product-info">
                <h3>{product.name}</h3>
                <p className="category-badge">{product.category}</p>
                <p className="description">{product.description}</p>

                <div className="product-footer">
                    <span className="price">${product.price.toFixed(2)}</span>
                    <div className="product-actions">
                        <button className="btn-secondary add-to-cart" onClick={() => addToCart(product.id)}>
                            <ShoppingCart size={16} /> Add
                        </button>
                        <div className="product-actions-group">
                            {isAdmin && (
                                <button onClick={onEdit} className="btn-icon">
                                    <Edit size={16} />
                                </button>
                            )}
                            <button onClick={onDelete} className="btn-icon btn-danger">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ProductCard;

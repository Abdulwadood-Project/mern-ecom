import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById } from '../services';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { isAuthenticated } = useAuth();
  const { addItem } = useCartContext();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getProductById(id);
        setProduct(data.data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } });
      return;
    }
    setAdding(true);
    setError('');
    setMessage('');
    try {
      await addItem(product._id, Number(quantity));
      setMessage('Added to cart.');
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loading label="Loading product..." />;
  if (error && !product) {
    return (
      <div className="container page">
        <ErrorMessage message={error} />
        <Button to="/shop" variant="secondary">
          Back to shop
        </Button>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="product-detail">
        <div className="product-detail-media">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <p className="product-category">{product.category?.name}</p>
          <h1>{product.name}</h1>
          <div className="product-meta">
            <strong>${Number(product.price).toFixed(2)}</strong>
            {product.compareAtPrice > product.price && (
              <span className="compare-price">${Number(product.compareAtPrice).toFixed(2)}</span>
            )}
          </div>
          <p>{product.description}</p>
          <p className="muted">
            Brand: {product.brand || 'N/A'} · Stock: {product.stock}
          </p>
          <ErrorMessage message={error} />
          {message && <div className="success-banner">{message}</div>}
          <div className="detail-actions">
            <Input
              label="Quantity"
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Button onClick={handleAdd} disabled={adding || product.stock < 1}>
              {product.stock < 1 ? 'Out of stock' : adding ? 'Adding...' : 'Add to cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

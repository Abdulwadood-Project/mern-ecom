import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Modal from '../components/Modal';
import { useCartContext } from '../context/CartContext';

const Cart = () => {
  const { cart, loading, error, updateItem, removeItem, clear, fetchCart } = useCartContext();
  const [busyId, setBusyId] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleQuantity = async (productId, quantity) => {
    setBusyId(productId);
    setActionError('');
    try {
      await updateItem(productId, Number(quantity));
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const handleRemove = async (productId) => {
    setBusyId(productId);
    setActionError('');
    try {
      await removeItem(productId);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId('');
    }
  };

  const handleClear = async () => {
    setActionError('');
    try {
      await clear();
      setConfirmClear(false);
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading && !cart) return <Loading label="Loading cart..." />;

  const items = cart?.items || [];

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Your cart</h1>
          <p className="muted">{cart?.itemCount || 0} item(s) in your cart</p>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" onClick={() => setConfirmClear(true)}>
            Clear cart
          </Button>
        )}
      </div>

      <ErrorMessage message={error || actionError} onRetry={fetchCart} />

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Button to="/shop">Browse products</Button>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.product._id} className="cart-item">
                <img src={item.product.image} alt={item.product.name} />
                <div className="cart-item-info">
                  <Link to={`/products/${item.product._id}`}>
                    <h3>{item.product.name}</h3>
                  </Link>
                  <p className="muted">${Number(item.product.price).toFixed(2)} each</p>
                  <div className="cart-item-actions">
                    <input
                      type="number"
                      min="1"
                      max={item.product.stock}
                      value={item.quantity}
                      disabled={busyId === item.product._id}
                      onChange={(e) => handleQuantity(item.product._id, e.target.value)}
                      aria-label={`Quantity for ${item.product.name}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === item.product._id}
                      onClick={() => handleRemove(item.product._id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
                <strong>${Number(item.lineTotal).toFixed(2)}</strong>
              </div>
            ))}
          </div>

          <aside className="cart-summary panel">
            <h2>Order summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>${Number(cart.subtotal).toFixed(2)}</strong>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{cart.subtotal >= 100 ? 'Free' : '$9.99'}</span>
            </div>
            <div className="summary-row total">
              <span>Estimated total</span>
              <strong>
                $
                {Number(cart.subtotal + (cart.subtotal >= 100 ? 0 : 9.99)).toFixed(2)}
              </strong>
            </div>
            <Button to="/checkout" className="full-width">
              Proceed to checkout
            </Button>
          </aside>
        </div>
      )}

      <Modal
        open={confirmClear}
        title="Clear cart?"
        onClose={() => setConfirmClear(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClear}>
              Clear cart
            </Button>
          </>
        }
      >
        <p>This will remove all items from your cart. This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default Cart;

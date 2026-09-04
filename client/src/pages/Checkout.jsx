import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import { createOrder } from '../services';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';

const Checkout = () => {
  const { currentUser } = useAuth();
  const { cart, loading, fetchCart } = useCartContext();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    street: currentUser?.address?.street || '',
    city: currentUser?.address?.city || '',
    state: currentUser?.address?.state || '',
    zipCode: currentUser?.address?.zipCode || '',
    country: currentUser?.address?.country || 'USA',
    paymentMethod: 'cod',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await createOrder({
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          country: form.country,
        },
        paymentMethod: form.paymentMethod,
      });
      await fetchCart();
      navigate(`/orders/${data.data.order._id}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !cart) return <Loading label="Preparing checkout..." />;

  if (!cart?.items?.length) {
    return (
      <div className="container page">
        <div className="empty-state">
          <p>Your cart is empty. Add products before checkout.</p>
          <Button to="/shop">Go to shop</Button>
        </div>
      </div>
    );
  }

  const shipping = cart.subtotal >= 100 ? 0 : 9.99;
  const total = cart.subtotal + shipping;

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Checkout</h1>
          <p className="muted">Enter shipping details to place your order.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="checkout-layout">
        <form className="panel form-stack" onSubmit={handleSubmit}>
          <h2>Shipping address</h2>
          <Input label="Full name" name="fullName" required value={form.fullName} onChange={handleChange} />
          <Input label="Phone" name="phone" required value={form.phone} onChange={handleChange} />
          <Input label="Street" name="street" required value={form.street} onChange={handleChange} />
          <div className="form-row">
            <Input label="City" name="city" required value={form.city} onChange={handleChange} />
            <Input label="State" name="state" required value={form.state} onChange={handleChange} />
          </div>
          <div className="form-row">
            <Input label="Zip code" name="zipCode" required value={form.zipCode} onChange={handleChange} />
            <Input label="Country" name="country" required value={form.country} onChange={handleChange} />
          </div>
          <Input
            label="Payment method"
            name="paymentMethod"
            as="select"
            value={form.paymentMethod}
            onChange={handleChange}
          >
            <option value="cod">Cash on delivery</option>
            <option value="card">Card (simulated)</option>
          </Input>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Placing order...' : 'Place order'}
          </Button>
        </form>

        <aside className="panel">
          <h2>Order summary</h2>
          <ul className="checkout-items">
            {cart.items.map((item) => (
              <li key={item.product._id}>
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <strong>${Number(item.lineTotal).toFixed(2)}</strong>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${Number(cart.subtotal).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>${Number(total).toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;

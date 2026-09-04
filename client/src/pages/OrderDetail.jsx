import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrderById } from '../services';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await getOrderById(id);
        setOrder(data.data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <Loading label="Loading order..." />;

  if (error || !order) {
    return (
      <div className="container page">
        <ErrorMessage message={error || 'Order not found'} />
        <Button to="/orders" variant="secondary">
          Back to orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Order #{order._id.slice(-8)}</h1>
          <p className="muted">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`status-pill status-${order.status}`}>{order.status}</span>
      </div>

      <div className="two-column">
        <div className="panel">
          <h2>Items</h2>
          <ul className="checkout-items">
            {order.orderItems.map((item) => (
              <li key={`${item.product}-${item.name}`}>
                <div className="order-item-line">
                  <img src={item.image} alt={item.name} />
                  <div>
                    <Link to={`/products/${item.product}`}>{item.name}</Link>
                    <p className="muted">
                      ${Number(item.price).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>
                <strong>${Number(item.price * item.quantity).toFixed(2)}</strong>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Items</span>
            <span>${Number(order.itemsPrice).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>${Number(order.shippingPrice).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <strong>${Number(order.totalPrice).toFixed(2)}</strong>
          </div>
        </div>

        <div className="panel">
          <h2>Shipping</h2>
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.phone}</p>
          <p>
            {order.shippingAddress.street}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.zipCode}
            <br />
            {order.shippingAddress.country}
          </p>
          <h2>Payment</h2>
          <p className="text-capitalize">{order.paymentMethod}</p>
          <p>{order.isPaid ? 'Paid' : 'Not paid'}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import Card from '../components/Card';
import { useCartContext } from '../context/CartContext';

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const { cart } = useCartContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getMyOrders();
        setOrders(data.data.orders.slice(0, 5));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Hello, {currentUser?.name}</h1>
          <p className="muted">Your shopping overview and recent activity.</p>
        </div>
        {isAdmin && <Button to="/admin">Open admin panel</Button>}
      </div>

      <div className="stats-grid">
        <Card>
          <p className="stat-label">Cart items</p>
          <p className="stat-value">{cart?.itemCount || 0}</p>
        </Card>
        <Card>
          <p className="stat-label">Recent orders</p>
          <p className="stat-value">{orders.length}</p>
        </Card>
        <Card>
          <p className="stat-label">Account role</p>
          <p className="stat-value text-capitalize">{currentUser?.role}</p>
        </Card>
      </div>

      <div className="section-heading compact">
        <h2>Quick actions</h2>
      </div>
      <div className="action-row">
        <Button to="/shop">Continue shopping</Button>
        <Button to="/cart" variant="secondary">
          View cart
        </Button>
        <Button to="/orders" variant="ghost">
          Order history
        </Button>
        <Button to="/profile" variant="ghost">
          Edit profile
        </Button>
      </div>

      <div className="section-heading compact">
        <h2>Latest orders</h2>
        <Link to="/orders" className="text-link">
          View all
        </Link>
      </div>

      <ErrorMessage message={error} />
      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>No orders yet. Browse the shop and place your first order.</p>
          <Button to="/shop">Go to shop</Button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <Link to={`/orders/${order._id}`}>#{order._id.slice(-8)}</Link>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-pill status-${order.status}`}>{order.status}</span>
                  </td>
                  <td>${Number(order.totalPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

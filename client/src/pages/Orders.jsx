import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders, cancelMyOrder } from '../services';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import Modal from '../components/Modal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelId, setCancelId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getMyOrders();
      setOrders(data.data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async () => {
    setBusy(true);
    setError('');
    try {
      await cancelMyOrder(cancelId);
      setCancelId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>My orders</h1>
          <p className="muted">Track and manage your order history.</p>
        </div>
      </div>

      <ErrorMessage message={error} onRetry={load} />

      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>You have not placed any orders yet.</p>
          <Button to="/shop">Start shopping</Button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Items</th>
                <th>Status</th>
                <th>Total</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <Link to={`/orders/${order._id}`}>#{order._id.slice(-8)}</Link>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>{order.orderItems.length}</td>
                  <td>
                    <span className={`status-pill status-${order.status}`}>{order.status}</span>
                  </td>
                  <td>${Number(order.totalPrice).toFixed(2)}</td>
                  <td>
                    {order.status === 'pending' && (
                      <Button variant="ghost" size="sm" onClick={() => setCancelId(order._id)}>
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(cancelId)}
        title="Cancel order?"
        onClose={() => setCancelId(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCancelId(null)}>
              Keep order
            </Button>
            <Button variant="danger" disabled={busy} onClick={handleCancel}>
              {busy ? 'Cancelling...' : 'Cancel order'}
            </Button>
          </>
        }
      >
        <p>Are you sure you want to cancel this pending order?</p>
      </Modal>
    </div>
  );
};

export default Orders;

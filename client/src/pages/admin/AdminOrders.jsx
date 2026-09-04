import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Input from '../../components/Input';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { getAllOrders, updateOrderStatus } from '../../services';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAllOrders({ status: status || undefined, limit: 50 });
      setOrders(data.data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  const handleStatusChange = async (orderId, nextStatus) => {
    setBusyId(orderId);
    setError('');
    try {
      await updateOrderStatus(orderId, nextStatus);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId('');
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <div className="page-header">
          <div>
            <h1>Orders</h1>
            <p className="muted">Update fulfillment status across the store.</p>
          </div>
          <Input
            as="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Input>
        </div>

        <ErrorMessage message={error} onRetry={load} />
        {loading ? (
          <Loading />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-8)}</td>
                    <td>
                      {order.user?.name}
                      <div className="muted">{order.user?.email}</div>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>${Number(order.totalPrice).toFixed(2)}</td>
                    <td>
                      <select
                        className="form-control"
                        value={order.status}
                        disabled={busyId === order._id || order.status === 'cancelled'}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="pending">pending</option>
                        <option value="processing">processing</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;

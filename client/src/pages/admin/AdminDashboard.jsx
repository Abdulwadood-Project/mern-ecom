import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Card from '../../components/Card';
import { getDashboardStats } from '../../services';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDashboardStats();
        setData(res.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <div className="page-header">
          <div>
            <h1>Admin overview</h1>
            <p className="muted">Monitor store performance and recent orders.</p>
          </div>
        </div>

        <ErrorMessage message={error} />
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="stats-grid">
              <Card>
                <p className="stat-label">Users</p>
                <p className="stat-value">{data.stats.totalUsers}</p>
              </Card>
              <Card>
                <p className="stat-label">Products</p>
                <p className="stat-value">{data.stats.totalProducts}</p>
              </Card>
              <Card>
                <p className="stat-label">Orders</p>
                <p className="stat-value">{data.stats.totalOrders}</p>
              </Card>
              <Card>
                <p className="stat-label">Revenue</p>
                <p className="stat-value">${Number(data.stats.totalRevenue).toFixed(2)}</p>
              </Card>
            </div>

            <div className="section-heading compact">
              <h2>Recent orders</h2>
              <Link to="/admin/orders" className="text-link">
                Manage orders
              </Link>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-8)}</td>
                      <td>{order.user?.name || 'N/A'}</td>
                      <td>
                        <span className={`status-pill status-${order.status}`}>{order.status}</span>
                      </td>
                      <td>${Number(order.totalPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

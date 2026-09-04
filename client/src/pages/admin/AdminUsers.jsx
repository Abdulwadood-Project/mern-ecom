import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { deleteUser, getUsers, updateUser } from '../../services';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getUsers({ search: search || undefined, limit: 50 });
      setUsers(data.data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRoleChange = async (userId, role) => {
    setBusy(true);
    setError('');
    try {
      await updateUser(userId, { role });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async (user) => {
    setBusy(true);
    setError('');
    try {
      await updateUser(user._id, { isActive: !user.isActive });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteUser(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <div className="page-header">
          <div>
            <h1>Users</h1>
            <p className="muted">Manage roles and account access.</p>
          </div>
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search users"
          />
        </div>

        <ErrorMessage message={error} onRetry={load} />
        {loading ? (
          <Loading />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isSelf = user._id === currentUser?._id;
                  return (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          className="form-control"
                          value={user.role}
                          disabled={busy || isSelf}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="table-actions">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={busy || isSelf}
                          onClick={() => handleToggleActive(user)}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busy || isSelf}
                          onClick={() => setDeleteId(user._id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          open={Boolean(deleteId)}
          title="Delete user?"
          onClose={() => setDeleteId(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" disabled={busy} onClick={handleDelete}>
                Delete user
              </Button>
            </>
          }
        >
          <p>This permanently deletes the user account.</p>
        </Modal>
      </div>
    </div>
  );
};

export default AdminUsers;

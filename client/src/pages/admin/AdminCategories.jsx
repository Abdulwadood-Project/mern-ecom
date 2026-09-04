import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../../services';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getCategories({ active: 'false' });
      setCategories(data.data.categories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', isActive: true });
    setOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive,
    });
    setOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await updateCategory(editing._id, form);
      } else {
        await createCategory(form);
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteCategory(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <div className="page-header">
          <div>
            <h1>Categories</h1>
            <p className="muted">Organize products into browseable groups.</p>
          </div>
          <Button onClick={openCreate}>Add category</Button>
        </div>

        <ErrorMessage message={error} onRetry={load} />
        {loading ? (
          <Loading />
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <p>No categories yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>{category.isActive ? 'Active' : 'Hidden'}</td>
                    <td className="table-actions">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(category)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(category._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal open={open} title={editing ? 'Edit category' : 'Add category'} onClose={() => setOpen(false)} footer={null}>
          <form className="form-stack" onSubmit={handleSave}>
            <Input label="Name" name="name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            <Input
              label="Description"
              name="description"
              as="textarea"
              rows="3"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              />
              Active
            </label>
            <div className="modal-footer" style={{ padding: 0 }}>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          open={Boolean(deleteId)}
          title="Delete category?"
          onClose={() => setDeleteId(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" disabled={saving} onClick={handleDelete}>
                Delete
              </Button>
            </>
          }
        >
          <p>Categories with products cannot be deleted.</p>
        </Modal>
      </div>
    </div>
  );
};

export default AdminCategories;

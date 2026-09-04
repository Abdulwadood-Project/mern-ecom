import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
} from '../../services';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  stock: '',
  category: '',
  image: '',
  brand: '',
  featured: false,
  isActive: true,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        getProducts({ all: true, limit: 50 }),
        getCategories({ active: 'false' }),
      ]);
      setProducts(productsRes.data.data.products);
      setCategories(categoriesRes.data.data.categories);
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
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice || '',
      stock: product.stock,
      category: product.category?._id || product.category,
      image: product.image,
      brand: product.brand || '',
      featured: product.featured,
      isActive: product.isActive,
    });
    setOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice === '' ? 0 : Number(form.compareAtPrice),
      stock: Number(form.stock),
      image: form.image || undefined,
    };

    try {
      if (editing) {
        await updateProduct(editing._id, payload);
      } else {
        await createProduct(payload);
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
      await deleteProduct(deleteId);
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
            <h1>Products</h1>
            <p className="muted">Create, update, and remove catalog items.</p>
          </div>
          <Button onClick={openCreate}>Add product</Button>
        </div>

        <ErrorMessage message={error} onRetry={load} />
        {loading ? (
          <Loading />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category?.name || '—'}</td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>{product.stock}</td>
                    <td>{product.isActive ? 'Active' : 'Hidden'}</td>
                    <td className="table-actions">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(product)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setDeleteId(product._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal
          open={open}
          title={editing ? 'Edit product' : 'Add product'}
          onClose={() => setOpen(false)}
          footer={null}
        >
          <form className="form-stack" onSubmit={handleSave}>
            <Input label="Name" name="name" required value={form.name} onChange={handleChange} />
            <Input
              label="Description"
              name="description"
              as="textarea"
              rows="4"
              required
              value={form.description}
              onChange={handleChange}
            />
            <div className="form-row">
              <Input label="Price" name="price" type="number" step="0.01" required value={form.price} onChange={handleChange} />
              <Input label="Compare at" name="compareAtPrice" type="number" step="0.01" value={form.compareAtPrice} onChange={handleChange} />
            </div>
            <div className="form-row">
              <Input label="Stock" name="stock" type="number" required value={form.stock} onChange={handleChange} />
              <Input label="Brand" name="brand" value={form.brand} onChange={handleChange} />
            </div>
            <Input label="Category" name="category" as="select" required value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </Input>
            <Input label="Image URL" name="image" value={form.image} onChange={handleChange} />
            <label className="checkbox-row">
              <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} />
              Featured
            </label>
            <label className="checkbox-row">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
              Active
            </label>
            <div className="modal-footer" style={{ padding: 0 }}>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save product'}
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          open={Boolean(deleteId)}
          title="Delete product?"
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
          <p>This permanently removes the product from the catalog.</p>
        </Modal>
      </div>
    </div>
  );
};

export default AdminProducts;

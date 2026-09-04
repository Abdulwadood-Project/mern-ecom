import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Input from '../components/Input';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getCategories, getProducts } from '../services';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addItem } = useCartContext();
  const navigate = useNavigate();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    getCategories()
      .then(({ data }) => setCategories(data.data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getProducts({
          search: search || undefined,
          category: category || undefined,
          sort: sort || undefined,
          page,
          limit: 12,
        });
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, category, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const handleAdd = async (product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/shop' } });
      return;
    }
    setAddingId(product._id);
    try {
      await addItem(product._id, 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingId('');
    }
  };

  return (
    <div className="container page">
      <div className="page-header">
        <div>
          <h1>Shop</h1>
          <p className="muted">Browse the full catalog and filter by category.</p>
        </div>
      </div>

      <div className="shop-layout">
        <aside className="filters-panel">
          <Input
            label="Search"
            name="search"
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            placeholder="Search products..."
          />
          <Input
            label="Category"
            name="category"
            as="select"
            value={category}
            onChange={(e) => updateParam('category', e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Input>
          <Input
            label="Sort by"
            name="sort"
            as="select"
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
          >
            <option value="">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name</option>
          </Input>
          <Button
            variant="ghost"
            onClick={() => setSearchParams({})}
          >
            Clear filters
          </Button>
        </aside>

        <div>
          <ErrorMessage message={error} />
          {loading ? (
            <Loading label="Loading products..." />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>No products matched your filters.</p>
            </div>
          ) : (
            <>
              <p className="muted results-count">{pagination.total} products found</p>
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAdd={handleAdd}
                    adding={addingId === product._id}
                  />
                ))}
              </div>
              {pagination.pages > 1 && (
                <div className="pagination">
                  <Button
                    variant="ghost"
                    disabled={page <= 1}
                    onClick={() => updateParam('page', String(page - 1))}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <Button
                    variant="ghost"
                    disabled={page >= pagination.pages}
                    onClick={() => updateParam('page', String(page + 1))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;

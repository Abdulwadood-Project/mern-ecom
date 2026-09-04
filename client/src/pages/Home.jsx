import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { getFeaturedProducts } from '../services';
import { useAuth } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState('');
  const { isAuthenticated } = useAuth();
  const { addItem } = useCartContext();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getFeaturedProducts();
        setProducts(data.data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
    <div className="home-page">
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <p className="hero-brand">ShopHub</p>
          <h1>Curated essentials for everyday living</h1>
          <p className="hero-sub">
            Discover quality products across electronics, fashion, home, and sports — with a smooth
            cart and checkout experience.
          </p>
          <div className="hero-actions">
            <Button to="/shop" size="lg">
              Shop collection <FiArrowRight />
            </Button>
            <Button to="/register" variant="secondary" size="lg">
              Create account
            </Button>
          </div>
        </div>
      </section>

      <section className="section trust-section">
        <div className="container trust-grid">
          <div>
            <FiTruck />
            <h3>Fast delivery</h3>
            <p>Free shipping on orders over $100.</p>
          </div>
          <div>
            <FiShield />
            <h3>Secure checkout</h3>
            <p>Protected authentication and private order history.</p>
          </div>
          <div>
            <FiRefreshCw />
            <h3>Easy tracking</h3>
            <p>Follow every order from pending to delivered.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <h2>Featured products</h2>
              <p>Hand-picked picks to start your catalog browsing.</p>
            </div>
            <Link to="/shop" className="text-link">
              View all
            </Link>
          </div>

          <ErrorMessage message={error} />
          {loading ? (
            <Loading label="Loading featured products..." />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>No featured products yet. Seed the database to get started.</p>
              <Button to="/shop">Browse shop</Button>
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

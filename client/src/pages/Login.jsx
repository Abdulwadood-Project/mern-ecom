import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      const redirectTo = location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage your cart, orders, and profile.</p>
        <ErrorMessage message={error} />
        <form onSubmit={handleSubmit} className="form-stack">
          <Input
            label="Email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          <Button type="submit" disabled={loading} className="full-width">
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        <p className="auth-footer">
          New to ShopHub? <Link to="/register">Create an account</Link>
        </p>
        <div className="demo-box">
          <p>
            <strong>Demo admin:</strong> admin@shophub.com / admin123
          </p>
          <p>
            <strong>Demo user:</strong> user@shophub.com / user123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

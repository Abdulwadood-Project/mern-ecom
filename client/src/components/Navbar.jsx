import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar = ({ cartCount = 0 }) => {
  const { isAuthenticated, isAdmin, currentUser, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          ShopHub
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <FiX /> : <FiMenu />}
        </button>

        <nav className={`nav-links ${open ? 'is-open' : ''}`}>
          <NavLink to="/" end onClick={() => setOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/shop" onClick={() => setOpen(false)}>
            Shop
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" onClick={() => setOpen(false)}>
                Dashboard
              </NavLink>
              <NavLink to="/orders" onClick={() => setOpen(false)}>
                Orders
              </NavLink>
              <NavLink to="/profile" onClick={() => setOpen(false)}>
                Profile
              </NavLink>
            </>
          )}
          {isAdmin && (
            <NavLink to="/admin" onClick={() => setOpen(false)}>
              Admin
            </NavLink>
          )}

          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="cart-link" onClick={() => setOpen(false)}>
                  <FiShoppingBag />
                  <span>Cart</span>
                  {cartCount > 0 && <em>{cartCount}</em>}
                </Link>
                <span className="nav-user">
                  <FiUser /> {currentUser?.name?.split(' ')[0]}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <FiLogOut /> Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" to="/login" onClick={() => setOpen(false)}>
                  Login
                </Button>
                <Button size="sm" to="/register" onClick={() => setOpen(false)}>
                  Register
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand brand-footer">
            ShopHub
          </Link>
          <p className="footer-copy">
            A modern MERN e-commerce experience for discovering products, managing carts, and
            tracking orders with confidence.
          </p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/shop">Shop</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Create account</Link>
        </div>
        <div>
          <h4>Support</h4>
          <p>Free shipping over $100</p>
          <p>Secure checkout</p>
          <p>Easy order tracking</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} ShopHub. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

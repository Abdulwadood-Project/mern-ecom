import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useCart } from '../hooks/useCart';
import { CartContext } from '../context/CartContext';

const Layout = () => {
  const cartState = useCart();

  return (
    <CartContext.Provider value={cartState}>
      <div className="app-shell">
        <Navbar cartCount={cartState.itemCount} />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CartContext.Provider>
  );
};

export default Layout;

import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiTag,
  FiHome,
} from 'react-icons/fi';

const Sidebar = ({ items }) => {
  const defaultItems = [
    { to: '/admin', label: 'Overview', icon: FiHome, end: true },
    { to: '/admin/products', label: 'Products', icon: FiPackage },
    { to: '/admin/categories', label: 'Categories', icon: FiTag },
    { to: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    { to: '/admin/users', label: 'Users', icon: FiUsers },
  ];

  const links = items || defaultItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <FiGrid /> Admin Panel
      </div>
      <nav className="sidebar-nav">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.end} className="sidebar-link">
              <Icon />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;

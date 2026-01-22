//sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { getUserRole, isSuperAdmin, isAdmin } from '../../utils/auth';

const Sidebar = () => {
  const location = useLocation();
  const userRole = getUserRole();

  const menuItems = [
    // User menu items (all roles)
    {
      title: 'Dashboard',
      path: `/${userRole}-dashboard`,
      icon: '🏠',
      roles: ['user', 'admin', 'super_admin'],
    },
    {
      title: 'Generate Bill',
      path: '/generate-bill',
      icon: '🧾',
      roles: ['user', 'admin', 'super_admin'],
    },
    {
      title: 'Products',
      path: '/products',
      icon: '📦',
      roles: ['user', 'admin', 'super_admin'],
    },
    {
      title: 'Bill History',
      path: '/bill-history',
      icon: '📋',
      roles: ['user', 'admin', 'super_admin'],
    },

    // Admin menu items
    {
      title: 'Sales Report',
      path: '/sales-report',
      icon: '📊',
      roles: ['admin', 'super_admin'],
    },
    {
      title: 'Profit/Loss',
      path: '/profit-loss',
      icon: '💰',
      roles: ['admin', 'super_admin'],
    },
    {
      title: 'View Users',
      path: '/users',
      icon: '👥',
      roles: ['admin', 'super_admin'],
    },

    // Super Admin menu items
    {
      title: 'Manage Users',
      path: '/manage-users',
      icon: '⚙️',
      roles: ['super_admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(userRole)
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-gradient-to-b from-purple-600 to-blue-600 min-h-screen text-white shadow-xl flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">Store Manager</h2>
        <p className="text-purple-200 text-sm capitalize">{userRole.replace('_', ' ')}</p>
      </div>

      <nav className="mt-6 flex-1 pb-20">
        {filteredMenuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`flex items-center px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all ${isActive(item.path) ? 'bg-white bg-opacity-20 border-l-4 border-yellow-400' : ''
              }`}
          >
            <span className="text-2xl mr-3">{item.icon}</span>
            <span className="font-medium">{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 bg-black bg-opacity-20">
        <div className="text-xs text-purple-200">
          © 2026 Store Manager
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
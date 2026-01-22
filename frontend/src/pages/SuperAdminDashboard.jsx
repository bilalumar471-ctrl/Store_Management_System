import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, billAPI, userAPI } from '../services/api';
import Layout from '../components/common/Layout';
import { LoadingSpinner, Card } from '../components/common';

function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    todayBills: 0,
    todaySales: 0,
    todayProfit: 0,
    totalUsers: 0,
    activeUsers: 0,
    admins: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    inventoryHealth: 0,
    salesTrend: 'up',
    userActivity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [products, bills, users] = await Promise.all([
        productAPI.getAll(),
        billAPI.getAll(),
        userAPI.getAll(),
      ]);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayBills = bills.filter(bill => 
        new Date(bill.created_at).toISOString().split('T')[0] === today
      );
      const todaySales = todayBills.reduce((sum, bill) => sum + bill.total_amount, 0);

      // Calculate profit
      let todayProfit = 0;
      todayBills.forEach(bill => {
        bill.items.forEach(item => {
          const product = products.find(p => p.id === item.product_id);
          if (product) {
            const profit = (item.price_per_unit - product.purchase_price) * item.quantity;
            todayProfit += profit;
          }
        });
      });

      // System health metrics
      const inventoryHealth = products.length > 0 
        ? ((products.filter(p => p.quantity >= 10).length / products.length) * 100)
        : 0;

      setStats({
        totalProducts: products.length,
        lowStockProducts: products.filter(p => p.quantity < 10).length,
        todayBills: todayBills.length,
        todaySales: todaySales,
        todayProfit: todayProfit,
        totalUsers: users.length,
        activeUsers: users.filter(u => u.is_active).length,
        admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
      });

      setRecentUsers(users.slice(-5).reverse());
      
      setSystemHealth({
        inventoryHealth: inventoryHealth,
        salesTrend: todayBills.length > 0 ? 'up' : 'stable',
        userActivity: users.length > 0 ? (users.filter(u => u.is_active).length / users.length) * 100 : 0,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout><LoadingSpinner message="Loading dashboard..." /></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
          <p className="text-gray-600">Complete system overview and management.</p>
        </div>

        {/* System Health */}
        <div className="mb-8">
          <Card title="System Health" icon="🏥">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-semibold">Inventory Health</span>
                  <span className="font-bold text-lg">{systemHealth.inventoryHealth.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full ${systemHealth.inventoryHealth > 70 ? 'bg-green-500' : systemHealth.inventoryHealth > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${systemHealth.inventoryHealth}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-semibold">Sales Trend</span>
                  <span className={`font-bold text-lg ${systemHealth.salesTrend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
                    {systemHealth.salesTrend === 'up' ? '📈 Up' : '➡️ Stable'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{stats.todayBills} transactions today</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-semibold">User Activity</span>
                  <span className="font-bold text-lg">{systemHealth.userActivity.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="h-4 rounded-full bg-blue-500"
                    style={{ width: `${systemHealth.userActivity}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">💵</span>
              <span className="text-blue-100 text-sm">Revenue</span>
            </div>
            <p className="text-4xl font-bold mb-2">${stats.todaySales.toFixed(2)}</p>
            <p className="text-blue-100">Today's Sales</p>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">💰</span>
              <span className="text-green-100 text-sm">Profit</span>
            </div>
            <p className="text-4xl font-bold mb-2">${stats.todayProfit.toFixed(2)}</p>
            <p className="text-green-100">Today's Profit</p>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">📦</span>
              <span className="text-purple-100 text-sm">Inventory</span>
            </div>
            <p className="text-4xl font-bold mb-2">{stats.totalProducts}</p>
            <p className="text-purple-100">Total Products</p>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">⚠️</span>
              <span className="text-red-100 text-sm">Alert</span>
            </div>
            <p className="text-4xl font-bold mb-2">{stats.lowStockProducts}</p>
            <p className="text-red-100">Low Stock</p>
          </div>

          <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">👥</span>
              <span className="text-cyan-100 text-sm">Users</span>
            </div>
            <p className="text-4xl font-bold mb-2">{stats.totalUsers}</p>
            <p className="text-cyan-100">Total Users</p>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">✅</span>
              <span className="text-orange-100 text-sm">Active</span>
            </div>
            <p className="text-4xl font-bold mb-2">{stats.activeUsers}</p>
            <p className="text-orange-100">Active Users</p>
          </div>

          <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">⚙️</span>
              <span className="text-pink-100 text-sm">Admins</span>
            </div>
            <p className="text-4xl font-bold mb-2">{stats.admins}</p>
            <p className="text-pink-100">Admin Users</p>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">🧾</span>
              <span className="text-indigo-100 text-sm">Bills</span>
            </div>
            <p className="text-4xl font-bold mb-2">{stats.todayBills}</p>
            <p className="text-indigo-100">Today's Bills</p>
          </div>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions" icon="⚡">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <button
              onClick={() => navigate('/manage-users')}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <span className="text-4xl mb-3 block">⚙️</span>
              <h3 className="text-lg font-bold">Manage Users</h3>
            </button>

            <button
              onClick={() => navigate('/generate-bill')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <span className="text-4xl mb-3 block">🧾</span>
              <h3 className="text-lg font-bold">Generate Bill</h3>
            </button>

            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <span className="text-4xl mb-3 block">📦</span>
              <h3 className="text-lg font-bold">Products</h3>
            </button>

            <button
              onClick={() => navigate('/sales-report')}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <span className="text-4xl mb-3 block">📊</span>
              <h3 className="text-lg font-bold">Sales Report</h3>
            </button>

            <button
              onClick={() => navigate('/profit-loss')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <span className="text-4xl mb-3 block">💰</span>
              <h3 className="text-lg font-bold">Profit/Loss</h3>
            </button>
          </div>
        </Card>

        {/* Recent Users */}
        <div className="mt-8">
          <Card title="Recently Added Users" icon="👥">
            {recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-6xl">👥</span>
                <p className="mt-4 text-gray-500">No users yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentUsers.map(user => (
                  <div key={user.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-500 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{user.full_name}</h3>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'super_admin' ? 'Super Admin' : 
                         user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Added: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}

export default SuperAdminDashboard;
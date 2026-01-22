import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import { billAPI, productAPI } from '../services/api';

function UserDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({
    todayBills: 0,
    totalProducts: 0,
    todaySales: 0
  });
  const [recentBills, setRecentBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [bills, products] = await Promise.all([
        billAPI.getMyBills(),
        productAPI.getAll()
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayBills = bills.filter(bill =>
        new Date(bill.created_at).toISOString().split('T')[0] === today
      );
      const todaySales = todayBills.reduce((sum, bill) => sum + bill.total_amount, 0);

      setStats({
        todayBills: todayBills.length,
        totalProducts: products.length,
        todaySales: todaySales
      });

      setRecentBills(bills.slice(-5).reverse());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            User Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="font-semibold">{user?.full_name || user?.username}</span>!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Bills Generated Today</p>
                <h3 className="text-3xl font-bold mt-2">
                  {loading ? '...' : stats.todayBills}
                </h3>
              </div>
              <div className="text-5xl">🧾</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Products in Stock</p>
                <h3 className="text-3xl font-bold mt-2">
                  {loading ? '...' : stats.totalProducts}
                </h3>
              </div>
              <div className="text-5xl">📦</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Today's Sales</p>
                <h3 className="text-3xl font-bold mt-2">
                  {loading ? '...' : `$${stats.todaySales.toFixed(2)}`}
                </h3>
              </div>
              <div className="text-5xl">💰</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/generate-bill')}
              className="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg p-8 text-center transition-all transform hover:scale-105 shadow-md"
            >
              <div className="text-6xl mb-4">🧾</div>
              <div className="text-xl font-semibold">Generate Bill</div>
              <p className="text-green-100 text-sm mt-2">Create a new bill for customers</p>
            </button>

            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg p-8 text-center transition-all transform hover:scale-105 shadow-md"
            >
              <div className="text-6xl mb-4">📦</div>
              <div className="text-xl font-semibold">Manage Inventory</div>
              <p className="text-blue-100 text-sm mt-2">View and update product stock</p>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Bills</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Loading...</p>
            </div>
          ) : recentBills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <p>No bills generated yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentBills.map(bill => (
                    <tr key={bill.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{bill.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(bill.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bill.items?.length || 0} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ${bill.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default UserDashboard;
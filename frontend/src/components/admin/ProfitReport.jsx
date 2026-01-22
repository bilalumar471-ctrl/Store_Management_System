import { useState, useEffect } from 'react';
import { billAPI, productAPI } from '../../services/api';
import Layout from '../common/Layout';
import { LoadingSpinner, ErrorAlert, Card } from '../common';

const ProfitReport = () => {
  const [bills, setBills] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [profitData, setProfitData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    calculateProfit();
  }, [selectedDate, bills, products]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [billsData, productsData] = await Promise.all([
        billAPI.getAll(),
        productAPI.getAll(),
      ]);
      setBills(billsData);
      setProducts(productsData);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfit = () => {
    const filteredBills = bills.filter(bill => {
      const billDate = new Date(bill.created_at).toISOString().split('T')[0];
      return billDate === selectedDate;
    });

    let totalRevenue = 0;
    let totalCost = 0;
    const productBreakdown = {};

    filteredBills.forEach(bill => {
      bill.items.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        const revenue = item.subtotal;
        const cost = product ? product.purchase_price * item.quantity : 0;
        const profit = revenue - cost;

        totalRevenue += revenue;
        totalCost += cost;

        if (!productBreakdown[item.product_name]) {
          productBreakdown[item.product_name] = {
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
        }

        productBreakdown[item.product_name].quantity += item.quantity;
        productBreakdown[item.product_name].revenue += revenue;
        productBreakdown[item.product_name].cost += cost;
        productBreakdown[item.product_name].profit += profit;
      });
    });

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    setProfitData({
      totalRevenue,
      totalCost,
      totalProfit,
      profitMargin,
      productBreakdown: Object.entries(productBreakdown).map(([name, data]) => ({
        name,
        ...data,
      })),
    });
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (loading) return <Layout><LoadingSpinner message="Calculating profit..." /></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <Card title="Daily Profit/Loss Report" icon="💰">
          {/* Date Filter */}
          <div className="mb-6 flex items-center space-x-4">
            <label className="font-semibold">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getTodayDate()}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={() => setSelectedDate(getTodayDate())}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              Today
            </button>
          </div>

          {profitData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <p className="text-blue-100 mb-2">Revenue</p>
                  <p className="text-3xl font-bold">${profitData.totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                  <p className="text-red-100 mb-2">Cost</p>
                  <p className="text-3xl font-bold">${profitData.totalCost.toFixed(2)}</p>
                </div>
                <div className={`bg-gradient-to-r ${profitData.totalProfit >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-lg p-6 text-white`}>
                  <p className="text-white mb-2">Profit</p>
                  <p className="text-3xl font-bold">${profitData.totalProfit.toFixed(2)}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <p className="text-purple-100 mb-2">Margin</p>
                  <p className="text-3xl font-bold">{profitData.profitMargin.toFixed(2)}%</p>
                </div>
              </div>

              {/* Product Breakdown */}
              {profitData.productBreakdown.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-6xl">📭</span>
                  <p className="mt-4 text-gray-500 text-lg">No sales data for this date</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold mb-4">Product-wise Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-100 to-blue-100">
                          <th className="px-4 py-3 text-left">Product</th>
                          <th className="px-4 py-3 text-center">Quantity Sold</th>
                          <th className="px-4 py-3 text-right">Revenue</th>
                          <th className="px-4 py-3 text-right">Cost</th>
                          <th className="px-4 py-3 text-right">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profitData.productBreakdown.map((item, index) => (
                          <tr key={index} className="border-b hover:bg-purple-50">
                            <td className="px-4 py-3 font-semibold">{item.name}</td>
                            <td className="px-4 py-3 text-center">{item.quantity}</td>
                            <td className="px-4 py-3 text-right">${item.revenue.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-red-600">${item.cost.toFixed(2)}</td>
                            <td className={`px-4 py-3 text-right font-bold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${item.profit.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default ProfitReport;
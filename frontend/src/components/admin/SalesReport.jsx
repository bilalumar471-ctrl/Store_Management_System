import { useState, useEffect } from 'react';
import { billAPI } from '../../services/api';
import Layout from '../common/Layout';
import { LoadingSpinner, ErrorAlert, Card } from '../common';

const SalesReport = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    filterBillsByDate();
  }, [selectedDate, bills]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await billAPI.getAll();
      setBills(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  const filterBillsByDate = () => {
    if (!selectedDate) {
      setFilteredBills(bills);
      return;
    }

    const filtered = bills.filter(bill => {
      const billDate = new Date(bill.created_at).toISOString().split('T')[0];
      return billDate === selectedDate;
    });
    setFilteredBills(filtered);
  };

  const calculateTotalSales = () => {
    return filteredBills.reduce((sum, bill) => sum + bill.total_amount, 0);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  if (loading) return <Layout><LoadingSpinner message="Loading sales report..." /></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}

        <Card title="Daily Sales Report" icon="📊">
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <p className="text-blue-100 mb-2">Total Sales</p>
              <p className="text-4xl font-bold">${calculateTotalSales().toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <p className="text-green-100 mb-2">Total Bills</p>
              <p className="text-4xl font-bold">{filteredBills.length}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <p className="text-purple-100 mb-2">Average Bill</p>
              <p className="text-4xl font-bold">
                ${filteredBills.length > 0 ? (calculateTotalSales() / filteredBills.length).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>

          {/* Bills Table */}
          {filteredBills.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl">📭</span>
              <p className="mt-4 text-gray-500 text-lg">No sales for this date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-100 to-blue-100">
                    <th className="px-4 py-3 text-left">Bill Number</th>
                    <th className="px-4 py-3 text-left">Date & Time</th>
                    <th className="px-4 py-3 text-center">Items</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill.id} className="border-b hover:bg-purple-50">
                      <td className="px-4 py-3 font-semibold">{bill.bill_number}</td>
                      <td className="px-4 py-3">{new Date(bill.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">{bill.items.length}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">
                        ${bill.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-purple-100 to-blue-100 font-bold">
                    <td colSpan="3" className="px-4 py-3 text-right">Total:</td>
                    <td className="px-4 py-3 text-right text-green-600 text-xl">
                      ${calculateTotalSales().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default SalesReport;
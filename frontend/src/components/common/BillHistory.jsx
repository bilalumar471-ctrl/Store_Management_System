import { useState, useEffect } from 'react';
import { billAPI } from '../../services/api';
import Layout from '../common/Layout';
import { LoadingSpinner, ErrorAlert, Card } from '../common';
import { getUserRole } from '../../utils/auth';

const BillHistory = () => {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBill, setSelectedBill] = useState(null);
    const userRole = getUserRole();

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            setLoading(true);
            // Use getMyBills for regular users, getAll for admins
            const data = userRole === 'user'
                ? await billAPI.getMyBills()
                : await billAPI.getAll();
            setBills(data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch bills');
        } finally {
            setLoading(false);
        }
    };

    const filteredBills = bills.filter(bill =>
        bill.bill_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.id.toString().includes(searchQuery)
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <Layout><LoadingSpinner message="Loading bill history..." /></Layout>;

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                {error && <ErrorAlert message={error} onClose={() => setError('')} />}

                <Card title="Bill History" icon="📋">
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Search by bill number or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    {/* Bill Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                            <p className="text-blue-100 text-sm">Total Bills</p>
                            <p className="text-3xl font-bold">{bills.length}</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                            <p className="text-green-100 text-sm">Total Revenue</p>
                            <p className="text-3xl font-bold">
                                ${bills.reduce((sum, bill) => sum + bill.total_amount, 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                            <p className="text-purple-100 text-sm">Today's Bills</p>
                            <p className="text-3xl font-bold">
                                {bills.filter(bill =>
                                    new Date(bill.created_at).toDateString() === new Date().toDateString()
                                ).length}
                            </p>
                        </div>
                    </div>

                    {/* Bills Table */}
                    {filteredBills.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="text-6xl">📋</span>
                            <p className="mt-4 text-gray-500 text-lg">No bills found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-purple-100 to-blue-100">
                                        <th className="px-4 py-3 text-left">Bill #</th>
                                        <th className="px-4 py-3 text-left">Date</th>
                                        <th className="px-4 py-3 text-center">Items</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBills.map((bill) => (
                                        <tr key={bill.id} className="border-b hover:bg-purple-50">
                                            <td className="px-4 py-3 font-semibold">{bill.bill_number || `#${bill.id}`}</td>
                                            <td className="px-4 py-3 text-gray-600">{formatDate(bill.created_at)}</td>
                                            <td className="px-4 py-3 text-center">{bill.items?.length || 0}</td>
                                            <td className="px-4 py-3 text-right font-bold text-green-600">
                                                ${bill.total_amount.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => setSelectedBill(selectedBill?.id === bill.id ? null : bill)}
                                                    className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                                                >
                                                    {selectedBill?.id === bill.id ? 'Hide' : 'View'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>

                {/* Bill Details Modal */}
                {selectedBill && (
                    <div className="mt-6">
                        <Card title={`Bill Details - ${selectedBill.bill_number || '#' + selectedBill.id}`} icon="🧾">
                            <div className="mb-4">
                                <p className="text-gray-600">
                                    <strong>Date:</strong> {formatDate(selectedBill.created_at)}
                                </p>
                            </div>

                            <table className="w-full mb-4">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left">Product</th>
                                        <th className="px-4 py-2 text-center">Quantity</th>
                                        <th className="px-4 py-2 text-right">Price</th>
                                        <th className="px-4 py-2 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedBill.items?.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="px-4 py-2">{item.product_name}</td>
                                            <td className="px-4 py-2 text-center">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right">${item.price_per_unit.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right">${item.subtotal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-green-100 font-bold">
                                        <td colSpan="3" className="px-4 py-2 text-right">Total:</td>
                                        <td className="px-4 py-2 text-right text-green-600">
                                            ${selectedBill.total_amount.toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </Card>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default BillHistory;

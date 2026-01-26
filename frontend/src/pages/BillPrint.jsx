import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { billAPI } from '../services/api';
import { LoadingSpinner, ErrorAlert } from '../components/common';

const BillPrint = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBill = async () => {
            try {
                const data = await billAPI.getById(id);
                setBill(data);
                // Auto-print after a short delay to ensure rendering
                setTimeout(() => {
                    window.print();
                }, 1000);
            } catch (err) {
                setError('Failed to load bill details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBill();
        }
    }, [id]);

    if (loading) return <LoadingSpinner message="Loading bill for printing..." />;
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!bill) return <div className="p-8 text-center">Bill not found</div>;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-white text-black p-8">
            {/* No-print controls */}
            <div className="print:hidden mb-6 flex justify-between items-center max-w-3xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back
                </button>
                <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0v3H7V4h6zm-8 7.414l2.293 2.293a1 1 0 001.414 0L16 6.414V9a1 1 0 001 1h-1v-2H5v2H4a1 1 0 00-1-1v-2.586a1 1 0 00.293-.707zM15 15v2H5v-2h10z" clipRule="evenodd" />
                    </svg>
                    Print Again
                </button>
            </div>

            {/* Printable Content */}
            <div className="max-w-3xl mx-auto border border-gray-200 p-8 shadow-sm print:shadow-none print:border-0">
                {/* Header */}
                <div className="text-center border-b pb-6 mb-6">
                    <h1 className="text-3xl font-bold mb-2">Store Cashier System</h1>
                    <p className="text-gray-500">Fast, Friendly, Reliable</p>
                </div>

                {/* Bill Info */}
                <div className="flex justify-between mb-8">
                    <div>
                        <p className="text-sm text-gray-500">Bill To:</p>
                        <p className="font-semibold">Walk-in Customer</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-xl">{bill.bill_number}</p>
                        <p className="text-gray-600">{formatDate(bill.created_at)}</p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-800">
                            <th className="text-left py-2">Item</th>
                            <th className="text-center py-2">Qty</th>
                            <th className="text-right py-2">Price</th>
                            <th className="text-right py-2">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bill.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                                <td className="py-2">{item.product_name}</td>
                                <td className="text-center py-2">{item.quantity}</td>
                                <td className="text-right py-2">${item.price_per_unit.toFixed(2)}</td>
                                <td className="text-right py-2">${item.subtotal.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-64">
                        <div className="flex justify-between py-2 border-b">
                            <span className="font-semibold">Subtotal</span>
                            <span>${bill.total_amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="font-semibold">Tax (0%)</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between py-4 text-xl font-bold">
                            <span>Total</span>
                            <span>${bill.total_amount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-sm text-gray-500 pt-8 border-t">
                    <p>Thank you for your business!</p>
                </div>
            </div>
        </div>
    );
};

export default BillPrint;

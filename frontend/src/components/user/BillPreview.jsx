import { useRef } from 'react';
import Layout from '../common/Layout';
import { Card, Button } from '../common';

const BillPreview = ({ bill, onClose }) => {
  const printRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 flex justify-end space-x-4 print:hidden">
          <Button variant="secondary" onClick={onClose}>
            ← Back to Billing
          </Button>
          <Button onClick={handlePrint}>
            🖨️ Print Bill
          </Button>
        </div>

        <Card>
          <div ref={printRef} className="print-content">
            {/* Bill Header */}
            <div className="text-center mb-8 border-b-2 pb-6">
              <h1 className="text-4xl font-bold text-purple-600 mb-2">Store Management System</h1>
              <p className="text-gray-600">123 Main Street, City, State 12345</p>
              <p className="text-gray-600">Phone: (123) 456-7890 | Email: store@example.com</p>
            </div>

            {/* Bill Info */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <p className="text-gray-600">Bill Number:</p>
                <p className="font-bold text-xl">{bill.bill_number}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600">Date:</p>
                <p className="font-bold">{new Date(bill.created_at).toLocaleString()}</p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="bg-purple-100 border-b-2 border-purple-600">
                  <th className="text-left py-3 px-4">Item</th>
                  <th className="text-center py-3 px-4">Quantity</th>
                  <th className="text-right py-3 px-4">Price</th>
                  <th className="text-right py-3 px-4">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3 px-4">{item.product_name}</td>
                    <td className="text-center py-3 px-4">{item.quantity}</td>
                    <td className="text-right py-3 px-4">${item.price_per_unit.toFixed(2)}</td>
                    <td className="text-right py-3 px-4 font-semibold">${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="flex justify-between py-2 border-t-2">
                  <span className="text-xl font-bold">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">${bill.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t-2 pt-6 text-gray-600">
              <p className="font-semibold">Thank you for your business!</p>
              <p className="text-sm mt-2">Please come again</p>
            </div>
          </div>
        </Card>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-content, .print-content * {
              visibility: visible;
            }
            .print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default BillPreview;
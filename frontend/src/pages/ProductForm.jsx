//product form
import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { Card, Button, ErrorAlert } from '../components/common';

const ProductForm = ({ product, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    purchase_price: '',
    selling_price: '',
    category: '',
    supplier: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        quantity: product.quantity || '',
        purchase_price: product.purchase_price || '',
        selling_price: product.selling_price || '',
        category: product.category || '',
        supplier: product.supplier || '',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.quantity || formData.quantity < 0) {
      setError('Valid quantity is required');
      return;
    }
    if (!formData.purchase_price || formData.purchase_price < 0) {
      setError('Valid purchase price is required');
      return;
    }
    if (!formData.selling_price || formData.selling_price < 0) {
      setError('Valid selling price is required');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        quantity: parseInt(formData.quantity),
        purchase_price: parseFloat(formData.purchase_price),
        selling_price: parseFloat(formData.selling_price),
      };

      if (product) {
        await productAPI.update(product.id, dataToSend);
      } else {
        await productAPI.create(dataToSend);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={product ? 'Edit Product' : 'Add New Product'} icon={product ? '✏️' : '➕'}>
      {error && <ErrorAlert message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Enter product name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Enter quantity"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Purchase Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="purchase_price"
              value={formData.purchase_price}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="0.00"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Selling Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="selling_price"
              value={formData.selling_price}
              onChange={handleChange}
              step="0.01"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="0.00"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="e.g., Electronics, Groceries"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Supplier
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              placeholder="Enter supplier name"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProductForm;
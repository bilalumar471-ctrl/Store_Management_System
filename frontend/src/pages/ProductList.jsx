//product list
import { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import Layout from '../components/common/Layout';
import { LoadingSpinner, ErrorAlert, SuccessAlert, Card, Button } from '../components/common';
import ProductForm from '../pages/ProductForm';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data);
      setFilteredProducts(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.id.toString().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productAPI.delete(id);
      setSuccess('Product deleted successfully');
      fetchProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
    setSuccess(editingProduct ? 'Product updated successfully' : 'Product created successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) return <Layout><LoadingSpinner message="Loading products..." /></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
        {success && <SuccessAlert message={success} onClose={() => setSuccess('')} />}

        {!showForm ? (
          <Card title="Product Inventory" icon="📦">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1 mr-4">
                <input
                  type="text"
                  placeholder="Search by name, ID, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>
              <Button onClick={() => setShowForm(true)}>
                ➕ Add Product
              </Button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">📭</span>
                <p className="mt-4 text-gray-500 text-lg">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-100 to-blue-100 text-gray-700">
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-right">Quantity</th>
                      <th className="px-4 py-3 text-right">Purchase Price</th>
                      <th className="px-4 py-3 text-right">Selling Price</th>
                      <th className="px-4 py-3 text-left">Supplier</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-purple-50 transition-colors">
                        <td className="px-4 py-3">{product.id}</td>
                        <td className="px-4 py-3 font-semibold">{product.name}</td>
                        <td className="px-4 py-3">
                          {product.category && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                              {product.category}
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${product.quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>
                          {product.quantity}
                          {product.quantity < 10 && <span className="ml-2">⚠️</span>}
                        </td>
                        <td className="px-4 py-3 text-right">${product.purchase_price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          ${product.selling_price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">{product.supplier || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ) : (
          <ProductForm
            product={editingProduct}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default ProductList;
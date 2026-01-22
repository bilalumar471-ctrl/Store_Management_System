import { useState, useEffect } from 'react';
import { productAPI, billAPI } from '../../services/api';
import Layout from '../common/Layout';
import { LoadingSpinner, ErrorAlert, SuccessAlert, Card, Button } from '../common';
import BillPreview from './BillPreview';

const GenerateBill = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedBill, setGeneratedBill] = useState(null);
  const [showBillPreview, setShowBillPreview] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data.filter(p => p.quantity > 0)); // Only show products in stock
      setError('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        setError(`Only ${product.quantity} units available in stock`);
        setTimeout(() => setError(''), 3000);
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: product.selling_price,
        max_quantity: product.quantity,
        quantity: 1,
      }]);
    }
    setSuccess(`${product.name} added to cart`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const updateQuantity = (productId, newQuantity) => {
    const item = cart.find(i => i.product_id === productId);
    if (newQuantity > item.max_quantity) {
      setError(`Only ${item.max_quantity} units available`);
      setTimeout(() => setError(''), 3000);
      return;
    }
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleGenerateBill = async () => {
    if (cart.length === 0) {
      setError('Cart is empty. Add products to generate bill.');
      return;
    }

    try {
      setLoading(true);
      const billData = {
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };

      const bill = await billAPI.create(billData);
      setGeneratedBill(bill);
      setShowBillPreview(true);
      setCart([]);
      setSuccess('Bill generated successfully!');
      fetchProducts(); // Refresh product quantities
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate bill');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.id.toString().includes(searchQuery)
  );

  if (showBillPreview && generatedBill) {
    return (
      <BillPreview 
        bill={generatedBill} 
        onClose={() => {
          setShowBillPreview(false);
          setGeneratedBill(null);
        }} 
      />
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {error && <ErrorAlert message={error} onClose={() => setError('')} />}
        {success && <SuccessAlert message={success} onClose={() => setSuccess('')} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <Card title="Select Products" icon="🛒">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                />
              </div>

              {loading ? (
                <LoadingSpinner message="Loading products..." />
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-6xl">📭</span>
                  <p className="mt-4 text-gray-500">No products available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-500 transition-all cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                          ${product.selling_price.toFixed(2)}
                        </span>
                      </div>
                      {product.category && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {product.category}
                        </span>
                      )}
                      <p className="text-sm text-gray-600 mt-2">
                        Stock: <span className={product.quantity < 10 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                          {product.quantity}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Cart Section */}
          <div>
            <Card title="Cart" icon="🛍️">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-6xl">🛒</span>
                  <p className="mt-4 text-gray-500">Cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.product_id} className="border-2 border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-lg font-bold"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center border-2 border-gray-300 rounded-lg"
                              min="1"
                              max={item.max_quantity}
                            />
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-lg font-bold"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-bold text-green-600">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold">Total:</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                    <Button
                      onClick={handleGenerateBill}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Generating...' : '🧾 Generate Bill'}
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GenerateBill;
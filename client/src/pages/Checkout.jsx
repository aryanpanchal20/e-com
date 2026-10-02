import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
// Assuming toast is available, e.g., from react-toastify or sonner
// import { toast } from 'react-hot-toast';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    pincode: ''
  });

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const orderPayload = {
        shippingDetails: formData,
        paymentMethod: 'COD',
        // Backend handles exact price calculation based on DB items
        items: cartItems.map(item => ({
          product: item.product._id,
          qty: item.qty
        }))
      };

      const { data } = await api.post('/orders', orderPayload);
      
      // Clear cart upon 201 response
      clearCart();
      // toast.success('Order placed successfully!');
      alert('Order placed successfully! Cash on Delivery confirmed.');
      
      navigate('/my-orders');
    } catch (error) {
      console.error('Checkout error:', error);
      // toast.error(error.response?.data?.message || 'Failed to place order.');
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="123 Street Name, Apartment 4B"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode / ZIP</label>
                  <input 
                    type="text" 
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="10001"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200 mt-6">
                <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-center">
                  <input 
                    type="radio" 
                    checked 
                    readOnly 
                    className="w-4 h-4 text-blue-600 mr-3"
                  />
                  <span className="font-medium">Cash on Delivery (COD)</span>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg mt-8 transition-colors disabled:opacity-70"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="w-full md:w-1/3">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-8">
            <h3 className="text-lg font-bold mb-4">Order Summary</h3>
            <div className="space-y-4 mb-4">
              {cartItems.map((item) => (
                <div key={item.product._id} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <span className="text-gray-800 font-medium line-clamp-1">{item.product.name}</span>
                    <span className="text-gray-500">Qty: {item.qty}</span>
                  </div>
                  <span className="font-medium ml-4 text-gray-900">
                    ${(item.product.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 mt-2">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

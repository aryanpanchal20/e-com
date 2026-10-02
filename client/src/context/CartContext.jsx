import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('cartItems');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse cart items from local storage', error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product._id === product._id);
      if (existingItem) {
        // STOCK BOUNDING: Prevent incrementing quantity beyond available product.stock
        const newQty = Math.min(existingItem.qty + qty, product.stock);
        return prev.map(item =>
          item.product._id === product._id ? { ...item, qty: newQty } : item
        );
      }
      // STOCK BOUNDING: Prevent adding more than stock
      const initialQty = Math.min(qty, product.stock);
      return [...prev, { product, qty: initialQty }];
    });
  };

  const updateQuantity = (productId, qty) => {
    setCartItems(prev => prev.map(item => {
      if (item.product._id === productId) {
        // STOCK BOUNDING
        const newQty = Math.min(Math.max(1, qty), item.product.stock);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product._id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.product.price * item.qty), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.qty, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

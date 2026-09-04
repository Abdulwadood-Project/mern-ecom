import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services';

export const useCart = () => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return null;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await api.getCart();
      setCart(data.data.cart);
      return data.data.cart;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    const { data } = await api.addToCart({ productId, quantity });
    setCart(data.data.cart);
    return data.data.cart;
  };

  const updateItem = async (productId, quantity) => {
    const { data } = await api.updateCartItem(productId, quantity);
    setCart(data.data.cart);
    return data.data.cart;
  };

  const removeItem = async (productId) => {
    const { data } = await api.removeFromCart(productId);
    setCart(data.data.cart);
    return data.data.cart;
  };

  const clear = async () => {
    const { data } = await api.clearCart();
    setCart(data.data.cart);
    return data.data.cart;
  };

  return {
    cart,
    loading,
    error,
    itemCount: cart?.itemCount || 0,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clear,
  };
};

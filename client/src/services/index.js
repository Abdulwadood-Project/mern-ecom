import api from './api';

export const register = (payload) => api.post('/auth/register', payload);
export const login = (payload) => api.post('/auth/login', payload);
export const logout = () => api.post('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');
export const updateProfile = (payload) => api.put('/auth/profile', payload);
export const changePassword = (payload) => api.put('/auth/password', payload);

export const getProducts = (params) => api.get('/products', { params });
export const getFeaturedProducts = () => api.get('/products/featured');
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (payload) => api.post('/products', payload);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getCategories = (params) => api.get('/categories', { params });
export const createCategory = (payload) => api.post('/categories', payload);
export const updateCategory = (id, payload) => api.put(`/categories/${id}`, payload);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

export const getCart = () => api.get('/cart');
export const addToCart = (payload) => api.post('/cart/items', payload);
export const updateCartItem = (productId, quantity) =>
  api.put(`/cart/items/${productId}`, { quantity });
export const removeFromCart = (productId) => api.delete(`/cart/items/${productId}`);
export const clearCart = () => api.delete('/cart');

export const createOrder = (payload) => api.post('/orders', payload);
export const getMyOrders = () => api.get('/orders/my');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const cancelMyOrder = (id) => api.patch(`/orders/${id}/cancel`);
export const getAllOrders = (params) => api.get('/orders/admin/all', { params });
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/admin/${id}/status`, { status });
export const getDashboardStats = () => api.get('/orders/admin/stats');

export const getUsers = (params) => api.get('/users', { params });
export const updateUser = (id, payload) => api.put(`/users/${id}`, payload);
export const deleteUser = (id) => api.delete(`/users/${id}`);

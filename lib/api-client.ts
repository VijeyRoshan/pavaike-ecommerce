// API Client for Backend Server
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const apiClient = {
  // Products
  async getProducts() {
    const response = await fetch(`${API_URL}/api/products`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  // Admin Products
  async getAdminProducts(token: string) {
    const response = await fetch(`${API_URL}/api/admin/products`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async createProduct(token: string, productData: any) {
    const response = await fetch(`${API_URL}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  async updateProduct(token: string, id: string, updateData: any) {
    const response = await fetch(`${API_URL}/api/admin/products`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, ...updateData }),
    });
    if (!response.ok) throw new Error('Failed to update product');
    return response.json();
  },

  async deleteProduct(token: string, id: string) {
    const response = await fetch(`${API_URL}/api/admin/products`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error('Failed to delete product');
    return response.json();
  },

  // Checkout
  async createCheckout(data: any) {
    const response = await fetch(`${API_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Checkout failed');
    }
    return response.json();
  },

  // Admin Orders
  async getAdminOrders(token: string) {
    const response = await fetch(`${API_URL}/api/admin/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async updateOrderStatus(token: string, id: string, status: string) {
    const response = await fetch(`${API_URL}/api/admin/orders`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) throw new Error('Failed to update order');
    return response.json();
  },

  // Admin Login
  async adminLogin(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Login failed');
    }
    return response.json();
  },

  // Test connection
  async testConnection() {
    const response = await fetch(`${API_URL}/api/test-connection`);
    if (!response.ok) throw new Error('Connection test failed');
    return response.json();
  },
};

export default apiClient;

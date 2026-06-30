const rawBase = import.meta.env.VITE_API_URL?.trim() || '/api';
const BASE = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  me: (token) => request('/auth/me', { token }),
  updateProfile: (payload, token) => request('/auth/me', { method: 'PUT', body: payload, token }),

  getStoreStatus: () => request('/menu/store-status'),
  getPizzas: (params = '') => request(`/menu/pizzas${params}`),
  getPizza: (id) => request(`/menu/pizzas/${id}`),
  getCategories: () => request('/menu/categories'),
  getToppings: () => request('/menu/toppings'),

  createOrder: (payload, token) => request('/orders', { method: 'POST', body: payload, token }),
  myOrders: (token) => request('/orders/my', { token }),
  getOrder: (id, token) => request(`/orders/${id}`, { token }),

  adminStats: (token) => request('/admin/stats', { token }),
  adminReports: (token) => request('/admin/reports', { token }),
  adminPizzas: (token) => request('/admin/pizzas', { token }),
  adminCreatePizza: (payload, token) => request('/admin/pizzas', { method: 'POST', body: payload, token }),
  adminUpdatePizza: (id, payload, token) => request(`/admin/pizzas/${id}`, { method: 'PUT', body: payload, token }),
  adminDeletePizza: (id, token) => request(`/admin/pizzas/${id}`, { method: 'DELETE', token }),
  adminOrders: (token, status) => request(`/admin/orders${status ? `?status=${status}` : ''}`, { token }),
  adminUpdateOrderStatus: (id, status, token) => request(`/admin/orders/${id}/status`, { method: 'PUT', body: { status }, token }),
  adminCustomers: (token) => request('/admin/customers', { token }),
  adminDeleteCustomer: (id, token) => request(`/admin/customers/${id}`, { method: 'DELETE', token }),
  adminToppings: (token) => request('/admin/toppings', { token }),
  adminCreateTopping: (payload, token) => request('/admin/toppings', { method: 'POST', body: payload, token }),
  adminUpdateTopping: (id, payload, token) => request(`/admin/toppings/${id}`, { method: 'PUT', body: payload, token }),
  adminDeleteTopping: (id, token) => request(`/admin/toppings/${id}`, { method: 'DELETE', token }),
  adminGetSettings: (token) => request('/admin/settings', { token }),
  adminUpdateSettings: (payload, token) => request('/admin/settings', { method: 'PUT', body: payload, token }),
  adminStaff: (token) => request('/admin/staff', { token }),
  adminCreateStaff: (payload, token) => request('/admin/staff', { method: 'POST', body: payload, token }),
  adminUpdateStaff: (id, payload, token) => request(`/admin/staff/${id}`, { method: 'PUT', body: payload, token }),
  adminDeleteStaff: (id, token) => request(`/admin/staff/${id}`, { method: 'DELETE', token }),
};

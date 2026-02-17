/**
 * POS Engine API layer
 * Wraps apiFetch with X-Tenant-ID header for all POS engine endpoints.
 */
import { apiFetch } from './api';

// ── Helpers ────────────────────────────────────────────────

function getTenantId(): string {
  try {
    const stored = localStorage.getItem('berhot_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.tenantId || '';
    }
  } catch { /* ignore */ }
  return '';
}

function posHeaders(): Record<string, string> {
  const tid = getTenantId();
  return tid ? { 'X-Tenant-ID': tid } : {};
}

function posFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    headers: {
      ...posHeaders(),
      ...(options.headers as Record<string, string> || {}),
    },
  });
}

// ── Product types ──────────────────────────────────────────

export interface Product {
  id: string;
  tenantId?: string;
  categoryId?: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  cost?: number;
  imageUrl?: string;
  isAvailable: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface Category {
  id: string;
  tenantId?: string;
  name: string;
  description?: string;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
}

// ── Product endpoints ──────────────────────────────────────

export async function fetchProducts(search?: string): Promise<Product[]> {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const data = await posFetch<{ products: Product[] }>(`/api/v1/pos/products${q}`);
  return data.products || [];
}

export async function fetchProduct(id: string): Promise<Product> {
  return posFetch<Product>(`/api/v1/pos/products/${id}`);
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  return posFetch<Product>('/api/v1/pos/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  return posFetch<Product>(`/api/v1/pos/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Category endpoints ─────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const data = await posFetch<{ categories: Category[] }>('/api/v1/pos/categories');
  return data.categories || [];
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  return posFetch<Category>('/api/v1/pos/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Order types ────────────────────────────────────────────

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  tenantId?: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  orderNumber: string;
  orderType: string;
  status: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Order endpoints ────────────────────────────────────────

export async function fetchOrders(status?: string): Promise<Order[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : '';
  const data = await posFetch<{ orders: Order[] }>(`/api/v1/pos/orders${q}`);
  return data.orders || [];
}

export async function fetchOrder(id: string): Promise<Order> {
  return posFetch<Order>(`/api/v1/pos/orders/${id}`);
}

export async function createOrder(data: {
  customerId?: string;
  orderType: string;
  items: { productId: string; quantity: number; notes?: string }[];
  notes?: string;
}): Promise<Order> {
  return posFetch<Order>('/api/v1/pos/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOrderStatus(id: string, status: string): Promise<{ message: string }> {
  return posFetch(`/api/v1/pos/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export async function completeOrder(id: string): Promise<{ message: string }> {
  return posFetch(`/api/v1/pos/orders/${id}/complete`, { method: 'POST' });
}

export async function cancelOrder(id: string): Promise<{ message: string }> {
  return posFetch(`/api/v1/pos/orders/${id}/cancel`, { method: 'POST' });
}

// ── Payment types ──────────────────────────────────────────

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  reference?: string;
  createdAt: string;
}

// ── Payment endpoints ──────────────────────────────────────

export async function processPayment(data: {
  orderId: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
}): Promise<Payment> {
  return posFetch<Payment>('/api/v1/pos/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchOrderPayments(orderId: string): Promise<Payment[]> {
  const data = await posFetch<{ payments: Payment[] }>(`/api/v1/pos/payments/${orderId}`);
  return data.payments || [];
}

// ── Customer types ─────────────────────────────────────────

export interface Customer {
  id: string;
  tenantId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  loyaltyPoints?: number;
  totalSpent?: number;
  visitCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Customer endpoints ─────────────────────────────────────

export async function fetchCustomers(search?: string): Promise<Customer[]> {
  const q = search ? `?search=${encodeURIComponent(search)}` : '';
  const data = await posFetch<{ customers: Customer[] }>(`/api/v1/pos/customers${q}`);
  return data.customers || [];
}

export async function createCustomer(data: Partial<Customer>): Promise<Customer> {
  return posFetch<Customer>('/api/v1/pos/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Inventory ──────────────────────────────────────────────

export interface InventoryItem {
  productId: string;
  quantity: number;
  lowStockThreshold?: number;
  updatedAt: string;
}

export async function fetchInventory(): Promise<InventoryItem[]> {
  const data = await posFetch<{ inventory: InventoryItem[] }>('/api/v1/pos/inventory');
  return data.inventory || [];
}

export async function updateInventory(productId: string, data: { quantity: number; lowStockThreshold?: number }): Promise<{ message: string }> {
  return posFetch(`/api/v1/pos/inventory/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Reports ────────────────────────────────────────────────

export async function fetchDailySalesReport(date?: string): Promise<unknown> {
  const q = date ? `?date=${encodeURIComponent(date)}` : '';
  return posFetch(`/api/v1/pos/reports/daily-sales${q}`);
}

export async function fetchTopProductsReport(): Promise<unknown> {
  return posFetch('/api/v1/pos/reports/top-products');
}

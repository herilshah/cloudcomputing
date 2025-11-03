// Enhanced API Client with proper service endpoints
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:9100';

async function request<T>(path: string, method: HttpMethod, body?: any, headers?: Record<string, string>): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers
  };

  // Add auth token if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${method} ${path} -> ${res.status}: ${errorText}`);
  }

  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as unknown as T);
}

// Service-specific API endpoints
export const api = {
  // User Service
  users: {
    getAll: () => request<User[]>('/api/users', 'GET'),
    getById: (id: number) => request<User>(`/api/users/${id}`, 'GET'),
    create: (user: CreateUserRequest) => request<User>('/api/users', 'POST', user),
    update: (id: number, user: UpdateUserRequest) => request<User>(`/api/users/${id}`, 'PUT', user),
    login: (credentials: LoginRequest) => request<LoginResponse>('/api/users/login', 'POST', credentials),
    register: (user: RegisterRequest) => request<User>('/api/users/register', 'POST', user)
  },

  // Profile Service
  profiles: {
    getByUserId: (userId: number) => request<Profile>(`/api/profiles/user/${userId}`, 'GET'),
    create: (profile: CreateProfileRequest) => request<Profile>('/api/profiles', 'POST', profile),
    update: (id: number, profile: UpdateProfileRequest) => request<Profile>(`/api/profiles/${id}`, 'PUT', profile)
  },

  // Shop Service
  shops: {
    getAll: () => request<Shop[]>('/api/shops', 'GET'),
    getById: (id: number) => request<Shop>(`/api/shops/${id}`, 'GET'),
    getByOwnerId: (ownerId: number) => request<Shop[]>(`/api/shops/owner/${ownerId}`, 'GET'),
    create: (shop: CreateShopRequest) => request<Shop>('/api/shops', 'POST', shop),
    update: (id: number, shop: UpdateShopRequest) => request<Shop>(`/api/shops/${id}`, 'PUT', shop)
  },

  // Product Service
  products: {
    getAll: () => request<Product[]>('/api/products', 'GET'),
    getById: (id: number) => request<Product>(`/api/products/${id}`, 'GET'),
    getByShopId: (shopId: number) => request<Product[]>(`/api/products/shop/${shopId}`, 'GET'),
    create: (product: CreateProductRequest) => request<Product>('/api/products', 'POST', product),
    update: (id: number, product: UpdateProductRequest) => request<Product>(`/api/products/${id}`, 'PUT', product),
    delete: (id: number) => request<void>(`/api/products/${id}`, 'DELETE'),
    updateStock: (id: number, stock: number) => request<Product>(`/api/products/${id}/stock`, 'PUT', { stock })
  },

  // Cart Service
  carts: {
    getByUserId: (userId: number) => request<Cart[]>(`/api/carts/user/${userId}`, 'GET'),
    create: (cart: CreateCartRequest) => request<Cart>('/api/carts', 'POST', cart),
    getById: (id: number) => request<Cart>(`/api/carts/${id}`, 'GET'),
    update: (id: number, cart: UpdateCartRequest) => request<Cart>(`/api/carts/${id}`, 'PUT', cart),
    delete: (id: number) => request<void>(`/api/carts/${id}`, 'DELETE'),
    addItem: (cartId: number, item: CreateCartItemRequest) => request<CartItem>(`/api/carts/${cartId}/items`, 'POST', item),
    getItems: (cartId: number) => request<CartItem[]>(`/api/carts/${cartId}/items`, 'GET')
  },

  // Cart Item Service
  cartItems: {
    getByCartId: (cartId: number) => request<CartItem[]>(`/api/carts/${cartId}/items`, 'GET'),
    add: (cartId: number, item: CreateCartItemRequest) => request<CartItem>(`/api/carts/${cartId}/items`, 'POST', item),
    // Backend expects PUT /api/cart-items/{id} with full payload
    update: (itemId: number, item: UpdateCartItemFullRequest) => request<CartItem>(`/api/cart-items/${itemId}`, 'PUT', item),
    remove: (itemId: number) => request<void>(`/api/cart-items/${itemId}`, 'DELETE')
  },

  // Order Service
  orders: {
    getByUserId: (userId: number) => request<Order[]>(`/api/orders/user/${userId}`, 'GET'),
    getByShopId: (shopId: number) => request<Order[]>(`/api/orders/shop/${shopId}`, 'GET'),
    getById: (id: number) => request<Order>(`/api/orders/${id}`, 'GET'),
    create: (order: CreateOrderRequest) => request<Order>('/api/orders', 'POST', order),
    update: (id: number, order: UpdateOrderRequest) => request<Order>(`/api/orders/${id}`, 'PUT', order),
    updateStatus: (id: number, status: string) => request<Order>(`/api/orders/${id}/status`, 'PUT', status)
  },

  // Order Item Service
  orderItems: {
    getByOrderId: (orderId: number) => request<OrderItem[]>(`/api/order-items/order/${orderId}`, 'GET'),
    create: (orderId: number, item: CreateOrderItemRequest) => request<OrderItem>(`/api/order-items`, 'POST', { ...item, orderId })
  }
};

// Type definitions
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  sku?: string;
  images: string[];
  shopId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  shopId: number;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  userId: number;
  shopId: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'CUSTOMER' | 'SELLER';
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

export interface CreateProfileRequest {
  userId: number;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  avatar?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  avatar?: string;
}

export interface CreateShopRequest {
  name: string;
  description: string;
  ownerId: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

export interface UpdateShopRequest {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  isActive?: boolean;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  sku?: string;
  images: string[];
  shopId: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: string;
  brand?: string;
  sku?: string;
  images?: string[];
  isActive?: boolean;
}

export interface CreateCartRequest {
  userId: number;
  shopId: number;
}

export interface UpdateCartRequest {
  totalAmount?: number;
  itemCount?: number;
}

export interface CreateCartItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UpdateCartItemFullRequest {
  cartId: number;
  productId: number;
  quantity: number;
}

export const formatCurrencyINR = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount || 0));

export interface CreateOrderRequest {
  userId: number;
  shopId: number;
  totalAmount: number;
  shippingAddress: string;
  paymentMethod: string;
}

export interface UpdateOrderRequest {
  status?: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
}

export interface CreateOrderItemRequest {
  productId: number;
  quantity: number;
  price: number;
}
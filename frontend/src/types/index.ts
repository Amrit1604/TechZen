// User types
export interface User {
  username: string;
  email: string;
  id?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success?: boolean;
  redirect?: string;
  error?: string;
  username?: string;
}

// Product types
export interface Product {
  id: string;
  name: string;
  price: string | number;
  category: string;
  description: string;
  features: string;
  condition: 'new' | 'used' | 'refurbished';
  seller: string | SellerInfo;
  images: string[];
  createdAt: string;
}

export interface SellerInfo {
  id: string;
  name: string;
  contact: string;
}

export interface NewProduct {
  name: string;
  price: string | number;
  category: string;
  description: string;
  features: string;
  condition: 'new' | 'used' | 'refurbished';
  seller: string;
}

// News types
export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  image: string;
  tag: string;
  link: string;
  createdAt?: string;
}

// Chatbot types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatbotResponse {
  message: string;
  success: boolean;
  error?: string;
}

// Cart types
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  status: 'cart' | 'pending' | 'completed';
  createdAt: string;
  updatedAt?: string;
  shippingAddress?: string;
  paymentInfo?: string;
}

// Category types
export interface Category {
  name: string;
  description: string;
  image: string;
  link: string;
}

// API Response types
export interface ApiError {
  error: string;
  message?: string;
}

export type ApiResponse<T> = T | ApiError;

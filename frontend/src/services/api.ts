import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import type { 
  LoginCredentials, 
  SignupData, 
  AuthResponse, 
  User,
  Product,
  NewProduct,
  ChatbotResponse,
  Cart
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/login', credentials);
    return response.data;
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/api/auth/signup', data);
    return response.data;
  }

  async logout(): Promise<{ success: boolean }> {
    const response = await this.api.post('/api/auth/logout');
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/api/user');
    return response.data;
  }

  // Products endpoints
  async getProducts(): Promise<Product[]> {
    const response = await this.api.get<Product[]>('/api/products');
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.api.get<Product>(`/api/products/${id}`);
    return response.data;
  }

  async createProduct(product: NewProduct, images: File[]): Promise<Product> {
    const formData = new FormData();
    
    // Append product data
    Object.entries(product).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    // Append images
    images.forEach((image) => {
      formData.append('images', image);
    });

    const response = await this.api.post<Product>('/api/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  // Chatbot endpoint
  async sendChatMessage(message: string): Promise<ChatbotResponse> {
    const response = await this.api.post<ChatbotResponse>('/chatbot', {
      prompt: message,
      message: message
    });
    return response.data;
  }

  // Cart endpoints
  async getCart(userId: string): Promise<Cart> {
    const response = await this.api.get<Cart>(`/api/sell/cart/${userId}`);
    return response.data;
  }

  async addToCart(userId: string, productId: string, quantity: number): Promise<Cart> {
    const response = await this.api.post<Cart>(`/api/sell/cart/${userId}/add`, {
      productId,
      quantity
    });
    return response.data;
  }

  async checkout(userId: string, shippingAddress: string, paymentInfo: string): Promise<{ success: boolean; order: Cart }> {
    const response = await this.api.post(`/api/sell/cart/${userId}/checkout`, {
      shippingAddress,
      paymentInfo
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;

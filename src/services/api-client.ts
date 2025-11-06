import type { ApiResponse, ApiError } from '../types/index.js';

export interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

export interface Interceptor {
  request?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  response?: (response: Response) => Response | Promise<Response>;
  error?: (error: Error) => Error | Promise<Error>;
}

export class ApiClient {
  private baseURL: string;
  private defaultTimeout: number = 10000;
  private interceptors: Interceptor[] = [];

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.setupDefaultInterceptors();
  }

  /**
   * Add an interceptor for requests, responses, or errors
   */
  addInterceptor(interceptor: Interceptor): void {
    this.interceptors.push(interceptor);
  }

  /**
   * Remove all interceptors
   */
  clearInterceptors(): void {
    this.interceptors = [];
    this.setupDefaultInterceptors();
  }

  /**
   * Setup default interceptors for JWT tokens and error handling
   */
  private setupDefaultInterceptors(): void {
    // JWT Token interceptor
    this.addInterceptor({
      request: (config: RequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return config;
      },
    });

    // Response error interceptor
    this.addInterceptor({
      error: async (error: Error) => {
        if (error.message.includes('401')) {
          // Token expired or invalid - clear auth and redirect
          localStorage.removeItem('auth_token');
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return error;
      },
    });
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let processedConfig = config;
    
    for (const interceptor of this.interceptors) {
      if (interceptor.request) {
        processedConfig = await interceptor.request(processedConfig);
      }
    }
    

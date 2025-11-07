import type { ApiResponse, ApiError } from '../types/index.js';
import { config } from '../config/index.js';

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
  private defaultTimeout: number;
  private interceptors: Interceptor[] = [];

  constructor(baseURL?: string, timeout?: number) {
    this.baseURL = baseURL || config.api.baseUrl;
    this.defaultTimeout = timeout || config.api.timeout;
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
      request: (requestConfig: RequestConfig) => {
        const token = localStorage.getItem(config.auth.tokenKey);
        if (token) {
          requestConfig.headers = {
            ...requestConfig.headers,
            Authorization: `Bearer ${token}`,
          };
        }
        return requestConfig;
      },
    });

    // Response error interceptor
    this.addInterceptor({
      error: async (error: Error) => {
        if (error.message.includes('401')) {
          // Token expired or invalid - clear auth and redirect
          localStorage.removeItem(config.auth.tokenKey);
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        return error;
      },
    });
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(
    config: RequestConfig
  ): Promise<RequestConfig> {
    let processedConfig = config;

    for (const interceptor of this.interceptors) {
      if (interceptor.request) {
        processedConfig = await interceptor.request(processedConfig);
      }
    }

    return processedConfig;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors(
    response: Response
  ): Promise<Response> {
    let processedResponse = response;

    for (const interceptor of this.interceptors) {
      if (interceptor.response) {
        processedResponse = await interceptor.response(processedResponse);
      }
    }

    return processedResponse;
  }

  /**
   * Apply error interceptors
   */
  private async applyErrorInterceptors(error: Error): Promise<Error> {
    let processedError = error;

    for (const interceptor of this.interceptors) {
      if (interceptor.error) {
        processedError = await interceptor.error(processedError);
      }
    }

    return processedError;
  }

  /**
   * Create an API error from response
   */
  private async createApiError(response: Response): Promise<ApiError> {
    let errorData: any = {};

    try {
      errorData = await response.json();
    } catch {
      // If response is not JSON, use default error message
      errorData = { message: 'Error de conexión con el servidor' };
    }

    return {
      message: errorData.message || `Error ${response.status}`,
      code: errorData.code || 'UNKNOWN_ERROR',
      status: response.status,
      details: errorData.details,
    };
  }

  /**
   * Make HTTP request with interceptors and error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Setup default config
    let config: RequestConfig = {
      timeout: this.defaultTimeout,
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      // Apply request interceptors
      config = await this.applyRequestInterceptors(config);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      // Make the request
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Apply response interceptors
      const processedResponse = await this.applyResponseInterceptors(response);

      // Handle HTTP errors
      if (!processedResponse.ok) {
        const apiError = await this.createApiError(processedResponse);
        const error = new Error(apiError.message);
        (error as any).apiError = apiError;
        throw await this.applyErrorInterceptors(error);
      }

      // Parse successful response
      const data = await processedResponse.json();
      return data;
    } catch (error) {
      // Handle network errors, timeouts, etc.
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          const timeoutError = new Error('Tiempo de espera agotado');
          (timeoutError as any).apiError = {
            message: 'Tiempo de espera agotado',
            code: 'TIMEOUT_ERROR',
            status: 408,
          };
          throw await this.applyErrorInterceptors(timeoutError);
        }

        throw await this.applyErrorInterceptors(error);
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * Upload file with multipart/form-data
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const uploadConfig = { ...config };

    // Remove Content-Type header to let browser set it with boundary
    if (uploadConfig.headers) {
      delete (uploadConfig.headers as any)['Content-Type'];
    }

    return this.request<T>(endpoint, {
      ...uploadConfig,
      method: 'POST',
      body: formData,
    });
  }
}

// Create and export default instance
export const apiClient = new ApiClient();

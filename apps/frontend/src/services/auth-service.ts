import { apiClient } from './api-client.js';
import type {
  User,
  UserRole,
  LoginFormData,
  LoginResponse,
  ApiResponse,
  PasswordChangeData,
} from '../types/index.js';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((state: AuthState) => void)[] = [];
  private tokenRefreshTimer: number | null = null;

  constructor() {
    this.initializeAuth();
    this.setupEventListeners();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');

    if (token && userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        this.scheduleTokenRefresh();
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Setup event listeners for auth events
   */
  private setupEventListeners(): void {
    // Listen for logout events from other tabs or interceptors
    window.addEventListener('auth:logout', () => {
      this.handleLogout();
    });

    // Listen for storage changes (logout from other tabs)
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_token' && !event.newValue) {
        this.handleLogout();
      }
    });

    // Listen for token expiration
    window.addEventListener('auth:token-expired', () => {
      this.handleLogout();
    });
  }

  /**
   * Add listener for auth state changes
   */
  addAuthStateListener(listener: (state: AuthState) => void): void {
    this.authStateListeners.push(listener);
  }

  /**
   * Remove auth state listener
   */
  removeAuthStateListener(listener: (state: AuthState) => void): void {
    const index = this.authStateListeners.indexOf(listener);
    if (index > -1) {
      this.authStateListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of auth state changes
   */
  private notifyAuthStateChange(
    isLoading: boolean = false,
    error: string | null = null
  ): void {
    const state: AuthState = {
      user: this.currentUser,
      isAuthenticated: this.isAuthenticated(),
      isLoading,
      error,
    };

    this.authStateListeners.forEach((listener) => listener(state));
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginFormData): Promise<User> {
    this.notifyAuthStateChange(true);

    try {
      const response: ApiResponse<LoginResponse> = await apiClient.post(
        '/auth/login',
        credentials
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error en el inicio de sesión');
      }

      const { token, user, expiresAt } = response.data;

      // Store auth data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_expires', expiresAt.toString());

      this.currentUser = user;
      this.scheduleTokenRefresh();
      this.notifyAuthStateChange();

      return user;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      this.notifyAuthStateChange(false, errorMessage);
      throw error;
    }
  }

  /**
   * Logout user and clear auth data
   */
  async logout(): Promise<void> {
    try {
      // Attempt to notify server of logout
      if (this.isAuthenticated()) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Error during server logout:', error);
    } finally {
      this.handleLogout();
    }
  }

  /**
   * Handle logout (clear local data and notify listeners)
   */
  private handleLogout(): void {
    this.clearAuthData();
    this.currentUser = null;

    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    this.notifyAuthStateChange();
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expires');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const expiresStr = localStorage.getItem('auth_expires');

    if (!token || !expiresStr) {
      return false;
    }

    const expiresAt = new Date(expiresStr);
    const now = new Date();

    if (now >= expiresAt) {
      this.handleLogout();
      return false;
    }

    return true;
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: UserRole): boolean {
    if (!this.currentUser) {
      return false;
    }

    // Admin has access to all roles
    if (this.currentUser.role === 'admin') {
      return true;
    }

    return this.currentUser.role === role;
  }

  /**
   * Check if current user is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Validate current token with server
   */
  async validateToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response: ApiResponse<User> = await apiClient.get('/auth/validate');

      if (response.success && response.data) {
        // Update user data if it changed
        this.currentUser = response.data;
        localStorage.setItem('auth_user', JSON.stringify(response.data));
        this.notifyAuthStateChange();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token validation failed:', error);
      this.handleLogout();
      return false;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const response: ApiResponse<LoginResponse> =
        await apiClient.post('/auth/refresh');

      if (response.success && response.data) {
        const { token, user, expiresAt } = response.data;

        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_expires', expiresAt.toString());

        this.currentUser = user;
        this.scheduleTokenRefresh();
        this.notifyAuthStateChange();

        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.handleLogout();
      return false;
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    const expiresStr = localStorage.getItem('auth_expires');
    if (!expiresStr) return;

    const expiresAt = new Date(expiresStr);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    // Refresh token 5 minutes before expiry
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60000);

    this.tokenRefreshTimer = window.setTimeout(() => {
      this.refreshToken();
    }, refreshTime);
  }

  /**
   * Change user password
   */
  async changePassword(passwordData: PasswordChangeData): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Usuario no autenticado');
    }

    const response: ApiResponse<void> = await apiClient.post(
      '/auth/change-password',
      passwordData
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al cambiar la contraseña');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    if (!this.isAuthenticated()) {
      throw new Error('Usuario no autenticado');
    }

    const response: ApiResponse<User> = await apiClient.put(
      '/auth/profile',
      userData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al actualizar el perfil');
    }

    // Update local user data
    this.currentUser = response.data;
    localStorage.setItem('auth_user', JSON.stringify(response.data));
    this.notifyAuthStateChange();

    return response.data;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.post(
      '/auth/forgot-password',
      { email }
    );

    if (!response.success) {
      throw new Error(
        response.message || 'Error al solicitar restablecimiento de contraseña'
      );
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.post(
      '/auth/reset-password',
      {
        token,
        password: newPassword,
      }
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al restablecer la contraseña');
    }
  }
}

// Create and export default instance
export const authService = new AuthService();

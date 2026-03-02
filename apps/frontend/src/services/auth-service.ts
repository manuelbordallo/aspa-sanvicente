import { apiClient } from './api-client.js';
import { config } from '../config/index.js';
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
  private _currentUser: User | null = null;
  private authStateListeners: ((state: AuthState) => void)[] = [];
  private tokenRefreshTimer: number | null = null;
  private instanceId: string;

  private get currentUser(): User | null {
    return this._currentUser;
  }

  private set currentUser(value: User | null) {
    console.log('[AuthService] currentUser setter called, instanceId:', this.instanceId, 'old:', this._currentUser?.email, 'new:', value?.email);
    console.trace('[AuthService] currentUser setter trace:');
    this._currentUser = value;
  }

  constructor() {
    this.instanceId = `AuthService-${Math.random().toString(36).substr(2, 9)}`;
    console.log('[AuthService] Constructor called, instanceId:', this.instanceId);
    this.initializeAuth();
    this.setupEventListeners();
    console.log('[AuthService] Constructor complete, instanceId:', this.instanceId, 'currentUser:', this.currentUser);
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const token = localStorage.getItem(config.auth.tokenKey);
    const userStr = localStorage.getItem('auth_user');

    console.log('[AuthService] initializeAuth called:', {
      hasToken: !!token,
      hasUserStr: !!userStr,
      tokenKey: config.auth.tokenKey,
      userStr: userStr?.substring(0, 100)
    });

    if (token && userStr) {
      try {
        this.currentUser = JSON.parse(userStr)?.user;
        console.log('[AuthService] User loaded from localStorage:', this.currentUser);
        this.scheduleTokenRefresh();
      } catch (error) {
        console.error('[AuthService] Error parsing stored user data:', error);
        this.clearAuthData();
      }
    } else {
      console.log('[AuthService] No stored auth data found');
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
    console.log('[AuthService] Adding auth state listener, instanceId:', this.instanceId, 'total listeners:', this.authStateListeners.length + 1);
    this.authStateListeners.push(listener);

    // Immediately notify the new listener of the current state
    const currentState: AuthState = {
      user: this.currentUser,
      isAuthenticated: this.isAuthenticated(),
      isLoading: false,
      error: null,
    };
    console.log('[AuthService] Notifying new listener of current state, instanceId:', this.instanceId, {
      user: currentState.user?.email,
      isAuthenticated: currentState.isAuthenticated
    });
    listener(currentState);
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

    console.log('[AuthService] Notifying auth state change, instanceId:', this.instanceId, {
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      user: state.user?.email,
      currentUser: this.currentUser?.email,
      listenersCount: this.authStateListeners.length
    });
    console.trace('[AuthService] notifyAuthStateChange called from:');

    this.authStateListeners.forEach((listener) => listener(state));
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginFormData): Promise<User> {
    this.notifyAuthStateChange(true);

    try {
      const response: ApiResponse<LoginResponse> = await apiClient.post(
        '/api/auth/login',
        credentials
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error en el inicio de sesión');
      }

      const { token, user, refreshToken } = response.data;

      // Decode JWT to get expiration time
      let expiresAt: number;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        expiresAt = payload.exp * 1000; // Convert to milliseconds
      } catch (error) {
        // Fallback: 1 hour from now
        expiresAt = Date.now() + 3600000;
      }

      // Store auth data
      localStorage.setItem(config.auth.tokenKey, token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_expires', expiresAt.toString());
      if (refreshToken) {
        localStorage.setItem('auth_refresh_token', refreshToken);
      }

      console.log('[AuthService] Login successful, user:', user);
      this.currentUser = user;
      console.log('[AuthService] currentUser set to:', this.currentUser);
      this.scheduleTokenRefresh();
      console.log('[AuthService] About to notify auth state change after login');
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
        await apiClient.post('/api/auth/logout');
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
    console.log('[AuthService] handleLogout called');
    console.trace('[AuthService] handleLogout trace:');
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
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expires');
    localStorage.removeItem('auth_refresh_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(config.auth.tokenKey);
    const expiresStr = localStorage.getItem('auth_expires');

    if (!token || !expiresStr) {
      return false;
    }

    const expiresAt = parseInt(expiresStr, 10);
    const now = Date.now();

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
      const response: ApiResponse<User> = await apiClient.get('/api/auth/validate');

      console.log('[AuthService] validateToken response:', response);

      if (response.success && response.data) {
        // Update user data if it changed
        this.currentUser = response.data;
        localStorage.setItem('auth_user', JSON.stringify(response.data));
        this.notifyAuthStateChange();
        return true;
      }

      // If validation fails but we have a valid token and user in localStorage,
      // don't logout - just return false
      console.warn('[AuthService] Token validation returned invalid response, keeping current user');
      return false;
    } catch (error) {
      console.error('Token validation failed:', error);
      // Only logout on network errors or 401/403
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        this.handleLogout();
      }
      return false;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('auth_refresh_token');

    if (!refreshToken) {
      return false;
    }

    try {
      const response: ApiResponse<LoginResponse> =
        await apiClient.post('/api/auth/refresh', { refreshToken });

      if (response.success && response.data) {
        const { token, user, refreshToken: newRefreshToken } = response.data;

        // Decode JWT to get expiration time
        let expiresAt: number;
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          expiresAt = payload.exp * 1000; // Convert to milliseconds
        } catch (error) {
          // Fallback: 1 hour from now
          expiresAt = Date.now() + 3600000;
        }

        localStorage.setItem(config.auth.tokenKey, token);
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_expires', expiresAt.toString());
        if (newRefreshToken) {
          localStorage.setItem('auth_refresh_token', newRefreshToken);
        }

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

    const expiresAt = parseInt(expiresStr, 10);
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;

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
      '/api/auth/change-password',
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
      '/api/auth/forgot-password',
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
      '/api/auth/reset-password',
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

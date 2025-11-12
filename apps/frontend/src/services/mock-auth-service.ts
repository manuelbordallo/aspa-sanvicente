import type {
  User,
  LoginFormData,
  PasswordChangeData,
} from '../types/index.js';
import type { AuthState } from './auth-service.js';

// Mock user data
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user' as const,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

interface MockSession {
  user: User;
  token: string;
  expiresAt: Date;
}

export class MockAuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((state: AuthState) => void)[] = [];

  constructor() {
    console.log('🔧 [Mock Auth] Mock authentication service initialized');
    console.log('📝 [Mock Auth] Available test credentials:');
    console.log('   Admin: admin@example.com / admin123');
    console.log('   User: user@example.com / user123');
    this.initializeAuth();
    this.setupEventListeners();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const sessionStr = localStorage.getItem('mock_auth_session');

    if (sessionStr) {
      try {
        const session: MockSession = JSON.parse(sessionStr);
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();

        if (now < expiresAt) {
          this.currentUser = session.user;
          console.log('[Mock Auth] Restored session for:', session.user.email);
        } else {
          console.log('[Mock Auth] Session expired, clearing data');
          this.clearAuthData();
        }
      } catch (error) {
        console.error('[Mock Auth] Error parsing stored session:', error);
        this.clearAuthData();
      }
    }
  }

  /**
   * Setup event listeners for auth events
   */
  private setupEventListeners(): void {
    // Listen for logout events from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'mock_auth_session' && !event.newValue) {
        this.handleLogout();
      }
    });
  }

  /**
   * Add listener for auth state changes
   */
  addAuthStateListener(listener: (state: AuthState) => void): void {
    console.log('[MockAuthService] Adding auth state listener, total listeners:', this.authStateListeners.length + 1);
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
   * Login with email and password (mock implementation)
   */
  async login(credentials: LoginFormData): Promise<User> {
    console.log('[Mock Auth] Login attempt for:', credentials.email);
    this.notifyAuthStateChange(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      // Find user by email
      const mockUser = MOCK_USERS.find(
        (u) =>
          u.email === credentials.email && u.password === credentials.password
      );

      if (!mockUser) {
        throw new Error('Credenciales inválidas');
      }

      // Create user object without password
      const { password, ...user } = mockUser;

      // Create mock session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8); // 8 hours expiry

      const session: MockSession = {
        user,
        token: `mock_token_${Date.now()}`,
        expiresAt,
      };

      // Store session in localStorage
      localStorage.setItem('mock_auth_session', JSON.stringify(session));

      // Also store in the same format as real auth for compatibility
      localStorage.setItem('auth_token', session.token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      localStorage.setItem('auth_expires', expiresAt.toISOString());

      this.currentUser = user;
      this.notifyAuthStateChange();

      console.log('[Mock Auth] Login successful for:', user.email);
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
    console.log('[Mock Auth] Logout');
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.handleLogout();
  }

  /**
   * Handle logout (clear local data and notify listeners)
   */
  private handleLogout(): void {
    this.clearAuthData();
    this.currentUser = null;
    this.notifyAuthStateChange();
  }

  /**
   * Clear authentication data from localStorage
   */
  private clearAuthData(): void {
    localStorage.removeItem('mock_auth_session');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expires');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const sessionStr = localStorage.getItem('mock_auth_session');

    if (!sessionStr) {
      return false;
    }

    try {
      const session: MockSession = JSON.parse(sessionStr);
      const expiresAt = new Date(session.expiresAt);
      const now = new Date();

      if (now >= expiresAt) {
        this.handleLogout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('[Mock Auth] Error checking authentication:', error);
      return false;
    }
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
  hasRole(role: string): boolean {
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
   * Validate current token (mock implementation)
   */
  async validateToken(): Promise<boolean> {
    console.log('[Mock Auth] Validating token');
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!this.isAuthenticated()) {
      return false;
    }

    // In mock mode, if session exists and not expired, it's valid
    return true;
  }

  /**
   * Refresh authentication token (mock implementation)
   */
  async refreshToken(): Promise<boolean> {
    console.log('[Mock Auth] Refreshing token');
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      const sessionStr = localStorage.getItem('mock_auth_session');
      if (!sessionStr) return false;

      const session: MockSession = JSON.parse(sessionStr);

      // Extend expiry time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8);

      const newSession: MockSession = {
        ...session,
        token: `mock_token_${Date.now()}`,
        expiresAt,
      };

      localStorage.setItem('mock_auth_session', JSON.stringify(newSession));
      localStorage.setItem('auth_token', newSession.token);
      localStorage.setItem('auth_expires', expiresAt.toISOString());

      console.log('[Mock Auth] Token refreshed');
      return true;
    } catch (error) {
      console.error('[Mock Auth] Error refreshing token:', error);
      return false;
    }
  }

  /**
   * Change user password (mock implementation)
   */
  async changePassword(passwordData: PasswordChangeData): Promise<void> {
    console.log('[Mock Auth] Change password (mock - no actual change)');
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!this.isAuthenticated()) {
      throw new Error('Usuario no autenticado');
    }

    // In mock mode, just validate the data structure
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (passwordData.newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    console.log('[Mock Auth] Password change simulated successfully');
  }

  /**
   * Update user profile (mock implementation)
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    console.log('[Mock Auth] Update profile:', userData);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!this.isAuthenticated() || !this.currentUser) {
      throw new Error('Usuario no autenticado');
    }

    // Update current user with new data
    const updatedUser: User = {
      ...this.currentUser,
      ...userData,
      id: this.currentUser.id, // Don't allow ID change
      role: this.currentUser.role, // Don't allow role change
      updatedAt: new Date(),
    };

    this.currentUser = updatedUser;

    // Update session in localStorage
    const sessionStr = localStorage.getItem('mock_auth_session');
    if (sessionStr) {
      const session: MockSession = JSON.parse(sessionStr);
      session.user = updatedUser;
      localStorage.setItem('mock_auth_session', JSON.stringify(session));
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }

    this.notifyAuthStateChange();

    console.log('[Mock Auth] Profile updated successfully');
    return updatedUser;
  }

  /**
   * Request password reset (mock implementation)
   */
  async requestPasswordReset(email: string): Promise<void> {
    console.log('[Mock Auth] Password reset requested for:', email);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In mock mode, just log the request
    console.log('[Mock Auth] Password reset email would be sent to:', email);
  }

  /**
   * Reset password with token (mock implementation)
   */
  async resetPassword(_token: string, newPassword: string): Promise<void> {
    console.log('[Mock Auth] Reset password with token (mock)');
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    console.log('[Mock Auth] Password reset simulated successfully');
  }

  /**
   * Get mock user credentials for display
   */
  getMockCredentials(): Array<{
    email: string;
    password: string;
    role: string;
  }> {
    return MOCK_USERS.map((u) => ({
      email: u.email,
      password: u.password,
      role: u.role,
    }));
  }
}

// Create and export default instance
export const mockAuthService = new MockAuthService();

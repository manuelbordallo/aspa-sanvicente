/**
 * Auth Service Factory
 * Creates and provides the appropriate auth service instance based on configuration
 */

import { AuthService, authService } from './auth-service.js';
import { MockAuthService, mockAuthService } from './mock-auth-service.js';
import { backendDetector } from './backend-detector.js';
import { config } from '../config/index.js';

type AuthServiceInstance = AuthService | MockAuthService;

class AuthServiceFactory {
  private serviceInstance: AuthServiceInstance | null = null;
  private mockMode: boolean = false;
  private initialized: boolean = false;

  /**
   * Get environment variable as boolean
   */
  private getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    return value === 'true' || value === true;
  }

  /**
   * Initialize the factory and determine which service to use
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Check if mock mode is explicitly enabled via environment variable
    const mockModeEnabled = this.getEnvBoolean('VITE_ENABLE_MOCK_MODE', false);

    if (mockModeEnabled) {
      this.mockMode = true;
      this.serviceInstance = mockAuthService;
      console.log(
        '[AuthServiceFactory] Mock mode enabled via environment variable'
      );
      this.initialized = true;
      return;
    }

    // Check backend availability
    const backendAvailable = await backendDetector.checkWithRetry(2);

    if (backendAvailable) {
      this.mockMode = false;
      this.serviceInstance = authService;
      if (config.debug) {
        console.log(
          '[AuthServiceFactory] Using real auth service - backend available'
        );
      }
    } else {
      this.mockMode = true;
      this.serviceInstance = mockAuthService;
      console.log(
        '[AuthServiceFactory] Using mock auth service - backend unavailable'
      );
    }

    this.initialized = true;
  }

  /**
   * Get the auth service instance
   * Initializes if not already initialized
   */
  async getAuthService(): Promise<AuthServiceInstance> {
    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.serviceInstance) {
      throw new Error('Auth service not initialized');
    }

    return this.serviceInstance;
  }

  /**
   * Get the auth service instance synchronously
   * Throws if not initialized
   */
  getAuthServiceSync(): AuthServiceInstance {
    if (!this.initialized || !this.serviceInstance) {
      throw new Error('Auth service not initialized. Call initialize() first.');
    }

    return this.serviceInstance;
  }

  /**
   * Check if currently in mock mode
   */
  isMockMode(): boolean {
    return this.mockMode;
  }

  /**
   * Check if factory is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Force switch to mock mode
   * Useful for testing or manual override
   */
  switchToMockMode(): void {
    this.mockMode = true;
    this.serviceInstance = mockAuthService;
    console.log('[AuthServiceFactory] Switched to mock mode');
  }

  /**
   * Force switch to real mode
   * Only works if backend is available
   */
  async switchToRealMode(): Promise<boolean> {
    const backendAvailable = await backendDetector.checkBackendAvailability();

    if (backendAvailable) {
      this.mockMode = false;
      this.serviceInstance = authService;
      console.log('[AuthServiceFactory] Switched to real mode');
      return true;
    }

    console.warn(
      '[AuthServiceFactory] Cannot switch to real mode - backend unavailable'
    );
    return false;
  }

  /**
   * Reset factory state
   * Useful for testing
   */
  reset(): void {
    this.serviceInstance = null;
    this.mockMode = false;
    this.initialized = false;
  }
}

// Create and export singleton instance
export const authServiceFactory = new AuthServiceFactory();

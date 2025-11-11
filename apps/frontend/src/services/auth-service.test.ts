import { expect } from '@esm-bundle/chai';
import { AuthService } from './auth-service.js';
import type { User } from '../types/index.js';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    authService = new AuthService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      expect(authService.isAuthenticated()).to.be.false;
    });

    it('should return true when valid token exists', () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_expires', futureDate.toISOString());

      expect(authService.isAuthenticated()).to.be.true;
    });

    it('should return false when token is expired', () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_expires', pastDate.toISOString());

      expect(authService.isAuthenticated()).to.be.false;
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is logged in', () => {
      expect(authService.getCurrentUser()).to.be.null;
    });

    it('should return user when logged in', () => {
      const mockUser: User = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_expires', futureDate.toISOString());

      // Create new instance to trigger initialization
      const newAuthService = new AuthService();
      const currentUser = newAuthService.getCurrentUser();

      expect(currentUser).to.not.be.null;
      expect(currentUser?.email).to.equal('test@example.com');
    });
  });

  describe('hasRole', () => {
    it('should return false when no user is logged in', () => {
      expect(authService.hasRole('user')).to.be.false;
      expect(authService.hasRole('admin')).to.be.false;
    });

    it('should return true for matching role', () => {
      const mockUser: User = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_expires', futureDate.toISOString());

      const newAuthService = new AuthService();
      expect(newAuthService.hasRole('user')).to.be.true;
    });

    it('should return true for admin accessing any role', () => {
      const mockAdmin: User = {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_user', JSON.stringify(mockAdmin));
      localStorage.setItem('auth_expires', futureDate.toISOString());

      const newAuthService = new AuthService();
      expect(newAuthService.hasRole('user')).to.be.true;
      expect(newAuthService.hasRole('admin')).to.be.true;
    });
  });

  describe('isAdmin', () => {
    it('should return false for non-admin users', () => {
      const mockUser: User = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_expires', futureDate.toISOString());

      const newAuthService = new AuthService();
      expect(newAuthService.isAdmin()).to.be.false;
    });

    it('should return true for admin users', () => {
      const mockAdmin: User = {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_user', JSON.stringify(mockAdmin));
      localStorage.setItem('auth_expires', futureDate.toISOString());

      const newAuthService = new AuthService();
      expect(newAuthService.isAdmin()).to.be.true;
    });
  });

  describe('logout', () => {
    it('should clear authentication data', async () => {
      const mockUser: User = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      localStorage.setItem('auth_expires', futureDate.toISOString());

      const newAuthService = new AuthService();
      expect(newAuthService.isAuthenticated()).to.be.true;

      await newAuthService.logout();

      expect(localStorage.getItem('auth_token')).to.be.null;
      expect(localStorage.getItem('auth_user')).to.be.null;
      expect(localStorage.getItem('auth_expires')).to.be.null;
      expect(newAuthService.getCurrentUser()).to.be.null;
    });
  });
});

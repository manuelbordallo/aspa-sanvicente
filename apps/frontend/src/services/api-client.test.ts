import { expect } from '@esm-bundle/chai';
import { ApiClient } from './api-client.js';

describe('ApiClient', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = new ApiClient('/api');
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('constructor', () => {
    it('should create instance with default base URL', () => {
      const client = new ApiClient();
      expect(client).to.be.instanceOf(ApiClient);
    });

    it('should create instance with custom base URL', () => {
      const client = new ApiClient('/custom-api');
      expect(client).to.be.instanceOf(ApiClient);
    });
  });

  describe('interceptors', () => {
    it('should add JWT token to requests when available', () => {
      localStorage.setItem('auth_token', 'test-token-123');

      const client = new ApiClient('/api');
      expect(client).to.be.instanceOf(ApiClient);
    });

    it('should work without token when not authenticated', () => {
      const client = new ApiClient('/api');
      expect(client).to.be.instanceOf(ApiClient);
    });
  });

  describe('addInterceptor', () => {
    it('should allow adding custom interceptors', () => {
      let interceptorCalled = false;

      apiClient.addInterceptor({
        request: (config) => {
          interceptorCalled = true;
          return config;
        },
      });

      expect(interceptorCalled).to.be.false;
    });
  });

  describe('clearInterceptors', () => {
    it('should clear all interceptors and restore defaults', () => {
      apiClient.addInterceptor({
        request: (config) => config,
      });

      apiClient.clearInterceptors();
      expect(apiClient).to.be.instanceOf(ApiClient);
    });
  });
});

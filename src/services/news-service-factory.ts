/**
 * News Service Factory
 * Creates and provides the appropriate news service instance based on configuration
 */

import { NewsService, newsService as realNewsService } from './news-service.js';
import { MockNewsService, mockNewsService } from './mock-news-service.js';
import { authServiceFactory } from './auth-service-factory.js';

type NewsServiceInstance = NewsService | MockNewsService;

class NewsServiceFactory {
  /**
   * Get the news service instance based on auth service mode
   */
  getNewsService(): NewsServiceInstance {
    // Use mock mode if auth service is in mock mode
    if (authServiceFactory.isMockMode()) {
      return mockNewsService;
    }
    return realNewsService;
  }
}

// Create and export singleton instance
export const newsServiceFactory = new NewsServiceFactory();

// Export a proxy that automatically delegates to the correct service
export const newsService = new Proxy({} as NewsServiceInstance, {
  get(_target, prop) {
    const service = newsServiceFactory.getNewsService();
    const value = (service as any)[prop];

    // If it's a function, bind it to the service
    if (typeof value === 'function') {
      return value.bind(service);
    }

    return value;
  },
});

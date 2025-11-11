/**
 * Notice Service Factory
 */

import {
  NoticeService,
  noticeService as realNoticeService,
} from './notice-service.js';
import { MockNoticeService, mockNoticeService } from './mock-notice-service.js';
import { authServiceFactory } from './auth-service-factory.js';

type NoticeServiceInstance = NoticeService | MockNoticeService;

class NoticeServiceFactory {
  getNoticeService(): NoticeServiceInstance {
    if (authServiceFactory.isMockMode()) {
      return mockNoticeService;
    }
    return realNoticeService;
  }
}

export const noticeServiceFactory = new NoticeServiceFactory();

export const noticeService = new Proxy({} as NoticeServiceInstance, {
  get(_target, prop) {
    const service = noticeServiceFactory.getNoticeService();
    const value = (service as any)[prop];
    if (typeof value === 'function') {
      return value.bind(service);
    }
    return value;
  },
});

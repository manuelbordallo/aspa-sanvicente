/**
 * Calendar Service Factory
 */

import {
  CalendarService,
  calendarService as realCalendarService,
} from './calendar-service.js';
import {
  MockCalendarService,
  mockCalendarService,
} from './mock-calendar-service.js';
import { authServiceFactory } from './auth-service-factory.js';

type CalendarServiceInstance = CalendarService | MockCalendarService;

class CalendarServiceFactory {
  getCalendarService(): CalendarServiceInstance {
    if (authServiceFactory.isMockMode()) {
      return mockCalendarService;
    }
    return realCalendarService;
  }
}

export const calendarServiceFactory = new CalendarServiceFactory();

export const calendarService = new Proxy({} as CalendarServiceInstance, {
  get(_target, prop) {
    const service = calendarServiceFactory.getCalendarService();
    const value = (service as any)[prop];
    if (typeof value === 'function') {
      return value.bind(service);
    }
    return value;
  },
});

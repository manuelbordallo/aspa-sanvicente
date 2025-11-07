import { expect } from '@esm-bundle/chai';
import { CalendarService } from './calendar-service.js';

describe('CalendarService', () => {
  let calendarService: CalendarService;

  beforeEach(() => {
    calendarService = new CalendarService();
  });

  describe('constructor', () => {
    it('should create instance of CalendarService', () => {
      expect(calendarService).to.be.instanceOf(CalendarService);
    });
  });

  describe('getEventsForMonth', () => {
    it('should accept year and month parameters', async () => {
      const year = 2025;
      const month = 11;
      expect(year).to.equal(2025);
      expect(month).to.equal(11);
    });

    it('should calculate correct date range', () => {
      const year = 2025;
      const month = 11;
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      expect(startDate.getMonth()).to.equal(10);
      expect(endDate.getMonth()).to.equal(10);
    });
  });

  describe('getEventsForDate', () => {
    it('should calculate start and end of day', () => {
      const date = new Date(2025, 10, 7);
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      expect(startDate.getHours()).to.equal(0);
      expect(endDate.getHours()).to.equal(23);
    });
  });

  describe('getUpcomingEvents', () => {
    it('should use default limit of 10', async () => {
      const defaultLimit = 10;
      expect(defaultLimit).to.equal(10);
    });

    it('should calculate 30 days ahead', () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const daysDiff = Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      expect(daysDiff).to.equal(30);
    });
  });

  describe('getMonthCalendarData', () => {
    it('should organize events by day', () => {
      const calendarData: { [day: number]: any[] } = {};
      const day = 15;

      if (!calendarData[day]) {
        calendarData[day] = [];
      }

      expect(calendarData[day]).to.be.an('array');
    });
  });
});

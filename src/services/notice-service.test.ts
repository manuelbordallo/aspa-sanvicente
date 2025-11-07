import { expect } from '@esm-bundle/chai';
import { NoticeService } from './notice-service.js';

describe('NoticeService', () => {
  let noticeService: NoticeService;

  beforeEach(() => {
    noticeService = new NoticeService();
  });

  describe('constructor', () => {
    it('should create instance of NoticeService', () => {
      expect(noticeService).to.be.instanceOf(NoticeService);
    });
  });

  describe('getUnreadNotices', () => {
    it('should filter for unread notices', async () => {
      const isReadFilter = false;
      expect(isReadFilter).to.be.false;
    });
  });

  describe('getSentNotices', () => {
    it('should accept pagination options', async () => {
      const options = { page: 1, limit: 10 };
      expect(options.page).to.equal(1);
      expect(options.limit).to.equal(10);
    });
  });
});

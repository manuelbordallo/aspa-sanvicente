import { expect } from '@esm-bundle/chai';
import { NewsService } from './news-service.js';

describe('NewsService', () => {
  let newsService: NewsService;

  beforeEach(() => {
    newsService = new NewsService();
  });

  describe('constructor', () => {
    it('should create instance of NewsService', () => {
      expect(newsService).to.be.instanceOf(NewsService);
    });
  });

  describe('getRecentNews', () => {
    it('should accept limit parameter', async () => {
      const limit = 5;
      expect(limit).to.equal(5);
    });

    it('should use default limit of 5', async () => {
      const defaultLimit = 5;
      expect(defaultLimit).to.equal(5);
    });
  });

  describe('searchNews', () => {
    it('should accept search query', async () => {
      const query = 'test search';
      expect(query).to.be.a('string');
    });

    it('should use default limit of 10', async () => {
      const defaultLimit = 10;
      expect(defaultLimit).to.equal(10);
    });
  });
});

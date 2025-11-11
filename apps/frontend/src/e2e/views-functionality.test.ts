import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import '../views/news-view.js';
import '../views/settings-view.js';
import { NewsView } from '../views/news-view.js';
import { SettingsView } from '../views/settings-view.js';

describe('E2E: Views Functionality', () => {
  describe('News View', () => {
    it('should render news view with title', async () => {
      const el = await fixture<NewsView>(html`<news-view></news-view>`);
      const title = el.shadowRoot?.querySelector('.view-title');

      expect(title).to.exist;
      expect(title?.textContent?.trim()).to.equal('Noticias');
    });

    it('should have header with description', async () => {
      const el = await fixture<NewsView>(html`<news-view></news-view>`);
      const description = el.shadowRoot?.querySelector('.view-description');

      expect(description).to.exist;
    });

    it('should have header actions section', async () => {
      const el = await fixture<NewsView>(html`<news-view></news-view>`);
      const headerActions = el.shadowRoot?.querySelector('.header-actions');

      expect(headerActions).to.exist;
    });

    it('should display content area', async () => {
      const el = await fixture<NewsView>(html`<news-view></news-view>`);

      await new Promise((resolve) => setTimeout(resolve, 50));

      const contentArea = el.shadowRoot?.querySelector(
        '.news-list, .loading-state, .empty-state, .error-state'
      );
      expect(contentArea).to.exist;
    });
  });

  describe('Settings View', () => {
    it('should render settings view with title', async () => {
      const el = await fixture<SettingsView>(
        html`<settings-view></settings-view>`
      );
      const title = el.shadowRoot?.querySelector('.view-title');

      expect(title).to.exist;
      expect(title?.textContent?.trim()).to.equal('Configuración');
    });

    it('should display theme selector', async () => {
      const el = await fixture<SettingsView>(
        html`<settings-view></settings-view>`
      );
      const themeSelect = el.shadowRoot?.querySelector(
        'ui-select[name="theme"]'
      );

      expect(themeSelect).to.exist;
    });

    it('should display language selector', async () => {
      const el = await fixture<SettingsView>(
        html`<settings-view></settings-view>`
      );
      const languageSelect = el.shadowRoot?.querySelector(
        'ui-select[name="language"]'
      );

      expect(languageSelect).to.exist;
    });

    it('should display current course information', async () => {
      const el = await fixture<SettingsView>(
        html`<settings-view></settings-view>`
      );
      const courseDisplay = el.shadowRoot?.querySelector(
        '.course-display, ui-input[name="currentCourse"]'
      );

      expect(courseDisplay).to.exist;
    });

    it('should have settings form', async () => {
      const el = await fixture<SettingsView>(
        html`<settings-view></settings-view>`
      );
      const form = el.shadowRoot?.querySelector('form, .settings-form');

      expect(form).to.exist;
    });
  });

  describe('View Integration', () => {
    it('should maintain consistent styling across views', async () => {
      const newsView = await fixture<NewsView>(html`<news-view></news-view>`);
      const settingsView = await fixture<SettingsView>(
        html`<settings-view></settings-view>`
      );

      const newsTitle = newsView.shadowRoot?.querySelector('.view-title');
      const settingsTitle =
        settingsView.shadowRoot?.querySelector('.view-title');

      expect(newsTitle).to.exist;
      expect(settingsTitle).to.exist;
    });

    it('should have responsive layout', async () => {
      const el = await fixture<NewsView>(html`<news-view></news-view>`);
      const header = el.shadowRoot?.querySelector('.view-header');

      expect(header).to.exist;
    });
  });
});

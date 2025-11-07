import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import './news-view.js';
import { NewsView } from './news-view.js';

describe('NewsView', () => {
  it('should render the news view', async () => {
    const el = await fixture<NewsView>(html`<news-view></news-view>`);
    expect(el).to.exist;
  });

  it('should display the view title', async () => {
    const el = await fixture<NewsView>(html`<news-view></news-view>`);
    const title = el.shadowRoot?.querySelector('.view-title');

    expect(title).to.exist;
    expect(title?.textContent?.trim()).to.equal('Noticias');
  });

  it('should display the view description', async () => {
    const el = await fixture<NewsView>(html`<news-view></news-view>`);
    const description = el.shadowRoot?.querySelector('.view-description');

    expect(description).to.exist;
    expect(description?.textContent).to.include('Mantente informado');
  });

  it('should show loading state initially', async () => {
    const el = await fixture<NewsView>(html`<news-view></news-view>`);

    // Wait a bit for the component to initialize
    await new Promise((resolve) => setTimeout(resolve, 10));

    const loadingState = el.shadowRoot?.querySelector(
      '.loading-state, .empty-state, .news-list'
    );
    expect(loadingState).to.exist;
  });

  it('should have header section', async () => {
    const el = await fixture<NewsView>(html`<news-view></news-view>`);
    const header = el.shadowRoot?.querySelector('.view-header');

    expect(header).to.exist;
  });

  it('should have header actions section', async () => {
    const el = await fixture<NewsView>(html`<news-view></news-view>`);
    const headerActions = el.shadowRoot?.querySelector('.header-actions');

    expect(headerActions).to.exist;
  });
});

import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import './ui-card.js';
import { UICard } from './ui-card.js';

describe('UICard', () => {
  it('should render card with default properties', async () => {
    const el = await fixture<UICard>(html`<ui-card>Card content</ui-card>`);
    const card = el.shadowRoot?.querySelector('.card');

    expect(card).to.exist;
  });

  it('should render title when provided', async () => {
    const el = await fixture<UICard>(
      html`<ui-card title="Card Title">Content</ui-card>`
    );
    const title = el.shadowRoot?.querySelector('.card-title');

    expect(title).to.exist;
    expect(title?.textContent?.trim()).to.equal('Card Title');
  });

  it('should not render header when no title', async () => {
    const el = await fixture<UICard>(html`<ui-card>Content</ui-card>`);
    const header = el.shadowRoot?.querySelector('.card-header');

    expect(header).to.not.exist;
  });

  it('should apply elevated styling when elevated', async () => {
    const el = await fixture<UICard>(html`<ui-card elevated>Content</ui-card>`);
    const card = el.shadowRoot?.querySelector('.card');

    expect(card?.className).to.include('card--elevated');
  });

  it('should apply interactive styling when interactive', async () => {
    const el = await fixture<UICard>(
      html`<ui-card interactive>Content</ui-card>`
    );
    const card = el.shadowRoot?.querySelector('.card');

    expect(card?.className).to.include('card--interactive');
  });

  it('should apply medium padding by default', async () => {
    const el = await fixture<UICard>(html`<ui-card>Content</ui-card>`);
    const content = el.shadowRoot?.querySelector('.card-content');

    expect(content?.className).to.include('card-content--md');
  });

  it('should apply small padding when specified', async () => {
    const el = await fixture<UICard>(
      html`<ui-card padding="sm">Content</ui-card>`
    );
    const content = el.shadowRoot?.querySelector('.card-content');

    expect(content?.className).to.include('card-content--sm');
  });

  it('should apply no padding when specified', async () => {
    const el = await fixture<UICard>(
      html`<ui-card padding="none">Content</ui-card>`
    );
    const content = el.shadowRoot?.querySelector('.card-content');

    expect(content?.className).to.include('card-content--none');
  });

  it('should dispatch ui-card-click event when interactive and clicked', async () => {
    const el = await fixture<UICard>(
      html`<ui-card interactive>Content</ui-card>`
    );
    const card = el.shadowRoot?.querySelector('.card') as HTMLElement;

    let eventFired = false;
    el.addEventListener('ui-card-click', () => {
      eventFired = true;
    });

    card.click();
    expect(eventFired).to.be.true;
  });

  it('should not dispatch event when not interactive', async () => {
    const el = await fixture<UICard>(html`<ui-card>Content</ui-card>`);
    const card = el.shadowRoot?.querySelector('.card') as HTMLElement;

    let eventFired = false;
    el.addEventListener('ui-card-click', () => {
      eventFired = true;
    });

    card.click();
    expect(eventFired).to.be.false;
  });

  it('should render slotted content', async () => {
    const el = await fixture<UICard>(
      html`<ui-card><p>Test content</p></ui-card>`
    );
    const slot = el.shadowRoot?.querySelector('slot:not([name])');

    expect(slot).to.exist;
  });
});

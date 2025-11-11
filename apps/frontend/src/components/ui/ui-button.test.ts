import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import './ui-button.js';
import { UIButton } from './ui-button.js';

describe('UIButton', () => {
  it('should render button with default properties', async () => {
    const el = await fixture<UIButton>(html`<ui-button>Click me</ui-button>`);
    const button = el.shadowRoot?.querySelector('button');

    expect(button).to.exist;
    expect(button?.textContent?.trim()).to.include('Click me');
  });

  it('should apply primary variant by default', async () => {
    const el = await fixture<UIButton>(html`<ui-button>Button</ui-button>`);
    const button = el.shadowRoot?.querySelector('button');

    expect(button?.className).to.include('button--primary');
  });

  it('should apply secondary variant when specified', async () => {
    const el = await fixture<UIButton>(
      html`<ui-button variant="secondary">Button</ui-button>`
    );
    const button = el.shadowRoot?.querySelector('button');

    expect(button?.className).to.include('button--secondary');
  });

  it('should apply danger variant when specified', async () => {
    const el = await fixture<UIButton>(
      html`<ui-button variant="danger">Delete</ui-button>`
    );
    const button = el.shadowRoot?.querySelector('button');

    expect(button?.className).to.include('button--danger');
  });

  it('should apply medium size by default', async () => {
    const el = await fixture<UIButton>(html`<ui-button>Button</ui-button>`);
    const button = el.shadowRoot?.querySelector('button');

    expect(button?.className).to.include('button--md');
  });

  it('should apply small size when specified', async () => {
    const el = await fixture<UIButton>(
      html`<ui-button size="sm">Small</ui-button>`
    );
    const button = el.shadowRoot?.querySelector('button');

    expect(button?.className).to.include('button--sm');
  });

  it('should apply large size when specified', async () => {
    const el = await fixture<UIButton>(
      html`<ui-button size="lg">Large</ui-button>`
    );
    const button = el.shadowRoot?.querySelector('button');

    expect(button?.className).to.include('button--lg');
  });

  it('should be disabled when disabled property is true', async () => {
    const el = await fixture<UIButton>(
      html`<ui-button disabled>Disabled</ui-button>`
    );
    const button = el.shadowRoot?.querySelector('button');

    expect(button?.disabled).to.be.true;
  });

  it('should show loading spinner when loading', async () => {
    const el = await fixture<UIButton>(
      html`<ui-button loading>Loading</ui-button>`
    );
    const spinner = el.shadowRoot?.querySelector('.loading-spinner');

    expect(spinner).to.exist;
  });

  it('should be disabled when loading', async () => {
    const el = await fixture<UIButton>(
      html`<ui-button loading>Loading</ui-button>`
    );
    const button = el.shadowRoot?.querySelector('button');

    expect(button?.disabled).to.be.true;
  });

  it('should dispatch ui-click event on click', async () => {
    const el = await fixture<UIButton>(html`<ui-button>Click</ui-button>`);
    const button = el.shadowRoot?.querySelector('button');

    let eventFired = false;
    el.addEventListener('ui-click', () => {
      eventFired = true;
    });

    button?.click();
    expect(eventFired).to.be.true;
  });

  it('should not dispatch event when disabled', async () => {
    const el = await fixture<UIButton>(
      html`<ui-button disabled>Click</ui-button>`
    );
    const button = el.shadowRoot?.querySelector('button');

    let eventFired = false;
    el.addEventListener('ui-click', () => {
      eventFired = true;
    });

    button?.click();
    expect(eventFired).to.be.false;
  });
});

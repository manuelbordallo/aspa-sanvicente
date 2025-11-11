import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import './ui-input.js';
import { UIInput } from './ui-input.js';

describe('UIInput', () => {
  it('should render input with default properties', async () => {
    const el = await fixture<UIInput>(html`<ui-input></ui-input>`);
    const input = el.shadowRoot?.querySelector('input');

    expect(input).to.exist;
    expect(input?.type).to.equal('text');
  });

  it('should render label when provided', async () => {
    const el = await fixture<UIInput>(
      html`<ui-input label="Email"></ui-input>`
    );
    const label = el.shadowRoot?.querySelector('.input-label');

    expect(label).to.exist;
    expect(label?.textContent?.trim()).to.equal('Email');
  });

  it('should show required indicator when required', async () => {
    const el = await fixture<UIInput>(
      html`<ui-input label="Email" required></ui-input>`
    );
    const label = el.shadowRoot?.querySelector('.input-label');

    expect(label?.className).to.include('input-label--required');
  });

  it('should render email input type', async () => {
    const el = await fixture<UIInput>(html`<ui-input type="email"></ui-input>`);
    const input = el.shadowRoot?.querySelector('input');

    expect(input?.type).to.equal('email');
  });

  it('should render password input type', async () => {
    const el = await fixture<UIInput>(
      html`<ui-input type="password"></ui-input>`
    );
    const input = el.shadowRoot?.querySelector('input');

    expect(input?.type).to.equal('password');
  });

  it('should display placeholder', async () => {
    const el = await fixture<UIInput>(
      html`<ui-input placeholder="Enter text"></ui-input>`
    );
    const input = el.shadowRoot?.querySelector('input');

    expect(input?.placeholder).to.equal('Enter text');
  });

  it('should display error message when provided', async () => {
    const el = await fixture<UIInput>(
      html`<ui-input errorMessage="Invalid input"></ui-input>`
    );
    const errorMsg = el.shadowRoot?.querySelector('.error-message');

    expect(errorMsg).to.exist;
    expect(errorMsg?.textContent?.trim()).to.equal('Invalid input');
  });

  it('should display helper text when no error', async () => {
    const el = await fixture<UIInput>(
      html`<ui-input helperText="Enter your email"></ui-input>`
    );
    const helperText = el.shadowRoot?.querySelector('.helper-text');

    expect(helperText).to.exist;
    expect(helperText?.textContent?.trim()).to.equal('Enter your email');
  });

  it('should apply error styling when error message exists', async () => {
    const el = await fixture<UIInput>(
      html`<ui-input errorMessage="Error"></ui-input>`
    );
    const input = el.shadowRoot?.querySelector('input');

    expect(input?.className).to.include('input--error');
  });

  it('should be disabled when disabled property is true', async () => {
    const el = await fixture<UIInput>(html`<ui-input disabled></ui-input>`);
    const input = el.shadowRoot?.querySelector('input');

    expect(input?.disabled).to.be.true;
  });

  it('should dispatch ui-input event on input', async () => {
    const el = await fixture<UIInput>(html`<ui-input></ui-input>`);
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;

    let eventDetail: any = null;
    el.addEventListener('ui-input', (e: Event) => {
      eventDetail = (e as CustomEvent).detail;
    });

    input.value = 'test';
    input.dispatchEvent(new Event('input'));

    await el.updateComplete;
    expect(eventDetail).to.not.be.null;
    expect(eventDetail.value).to.equal('test');
  });

  it('should apply small size', async () => {
    const el = await fixture<UIInput>(html`<ui-input size="sm"></ui-input>`);
    const input = el.shadowRoot?.querySelector('input');

    expect(input?.className).to.include('input--sm');
  });

  it('should apply large size', async () => {
    const el = await fixture<UIInput>(html`<ui-input size="lg"></ui-input>`);
    const input = el.shadowRoot?.querySelector('input');

    expect(input?.className).to.include('input--lg');
  });
});

import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import './login-form.js';
import { LoginForm } from './login-form.js';

describe('LoginForm', () => {
  it('should render login form', async () => {
    const el = await fixture<LoginForm>(html`<login-form></login-form>`);
    const form = el.shadowRoot?.querySelector('form');

    expect(form).to.exist;
  });

  it('should render email input', async () => {
    const el = await fixture<LoginForm>(html`<login-form></login-form>`);
    const emailInput = el.shadowRoot?.querySelector('ui-input[name="email"]');

    expect(emailInput).to.exist;
  });

  it('should render password input', async () => {
    const el = await fixture<LoginForm>(html`<login-form></login-form>`);
    const passwordInput = el.shadowRoot?.querySelector(
      'ui-input[name="password"]'
    );

    expect(passwordInput).to.exist;
  });

  it('should render submit button', async () => {
    const el = await fixture<LoginForm>(html`<login-form></login-form>`);
    const submitButton = el.shadowRoot?.querySelector(
      'ui-button[type="submit"]'
    );

    expect(submitButton).to.exist;
  });

  it('should display error message when provided', async () => {
    const el = await fixture<LoginForm>(
      html`<login-form errorMessage="Invalid credentials"></login-form>`
    );
    const errorMsg = el.shadowRoot?.querySelector('.error-message');

    expect(errorMsg).to.exist;
    expect(errorMsg?.textContent).to.include('Invalid credentials');
  });

  it('should show loading state on button when loading', async () => {
    const el = await fixture<LoginForm>(
      html`<login-form loading></login-form>`
    );
    const submitButton = el.shadowRoot?.querySelector(
      'ui-button[type="submit"]'
    );

    expect(submitButton?.hasAttribute('loading')).to.be.true;
  });

  it('should reset form data when reset is called', async () => {
    const el = await fixture<LoginForm>(html`<login-form></login-form>`);

    el.reset();
    await el.updateComplete;

    const emailInput = el.shadowRoot?.querySelector(
      'ui-input[name="email"]'
    ) as any;
    const passwordInput = el.shadowRoot?.querySelector(
      'ui-input[name="password"]'
    ) as any;

    expect(emailInput?.value).to.equal('');
    expect(passwordInput?.value).to.equal('');
  });

  it('should set error message when setError is called', async () => {
    const el = await fixture<LoginForm>(html`<login-form></login-form>`);

    el.setError('Test error');
    await el.updateComplete;

    const errorMsg = el.shadowRoot?.querySelector('.error-message');
    expect(errorMsg?.textContent).to.include('Test error');
  });

  it('should have form footer with text', async () => {
    const el = await fixture<LoginForm>(html`<login-form></login-form>`);
    const footer = el.shadowRoot?.querySelector('.form-footer');

    expect(footer).to.exist;
  });
});

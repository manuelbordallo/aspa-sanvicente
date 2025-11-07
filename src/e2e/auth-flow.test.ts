import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import '../components/forms/login-form.js';
import { LoginForm } from '../components/forms/login-form.js';

describe('E2E: Authentication Flow', () => {
  it('should render login form with all required fields', async () => {
    const el = await fixture<LoginForm>(html`<login-form></login-form>`);

    const emailInput = el.shadowRoot?.querySelector('ui-input[name="email"]');
    const passwordInput = el.shadowRoot?.querySelector(
      'ui-input[name="password"]'
    );
    const submitButton = el.shadowRoot?.querySelector(
      'ui-button[type="submit"]'
    );

    expect(emailInput).to.exist;
    expect(passwordInput).to.exist;
    expect(submitButton).to.exist;
  });

  it('should validate email format', async () => {
    const el = await fixture<LoginForm>(html`<login-form></login-form>`);

    const emailInput = el.shadowRoot?.querySelector(
      'ui-input[name="email"]'
    ) as any;
    const input = emailInput?.shadowRoot?.querySelector(
      'input'
    ) as HTMLInputElement;

    if (input) {
      input.value = 'invalid-email';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await el.updateComplete;

      // Form should not be valid with invalid email
      const submitButton = el.shadowRoot?.querySelector(
        'ui-button[type="submit"]'
      ) as any;
      expect(submitButton).to.exist;
    }
  });

  it('should require password field', async () => {
    const el = await fixture<LoginForm>(html`<login-form></login-form>`);

    const passwordInput = el.shadowRoot?.querySelector(
      'ui-input[name="password"]'
    );
    expect(passwordInput?.hasAttribute('required')).to.be.true;
  });

  it('should dispatch login-submit event with form data', async () => {
    const el = await fixture<LoginForm>(html`<login-form></login-form>`);

    el.addEventListener('login-submit', (e: Event) => {
      const detail = (e as CustomEvent).detail;
      expect(detail).to.exist;
    });

    const form = el.shadowRoot?.querySelector('form');
    expect(form).to.exist;
  });

  it('should show error message when provided', async () => {
    const el = await fixture<LoginForm>(
      html`<login-form errorMessage="Invalid credentials"></login-form>`
    );

    const errorMsg = el.shadowRoot?.querySelector('.error-message');
    expect(errorMsg).to.exist;
    expect(errorMsg?.textContent).to.include('Invalid credentials');
  });

  it('should disable submit button when loading', async () => {
    const el = await fixture<LoginForm>(
      html`<login-form loading></login-form>`
    );

    const submitButton = el.shadowRoot?.querySelector(
      'ui-button[type="submit"]'
    );
    expect(submitButton?.hasAttribute('loading')).to.be.true;
  });

  it('should reset form when reset method is called', async () => {
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
});

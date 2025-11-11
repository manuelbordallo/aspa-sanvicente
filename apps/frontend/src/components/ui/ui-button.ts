import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ui-button')
export class UIButton extends LitElement {
  @property() variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @property() size: 'sm' | 'md' | 'lg' = 'md';
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) loading = false;
  @property() type: 'button' | 'submit' | 'reset' = 'button';

  static styles = css`
    :host {
      display: inline-block;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border: none;
      border-radius: 0.375rem;
      font-weight: 500;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      font-family: inherit;
      outline: none;
      position: relative;
    }

    .button:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    .button:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Sizes */
    .button--sm {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .button--md {
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .button--lg {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      line-height: 1.5rem;
    }

    /* Variants */
    .button--primary {
      background-color: #3b82f6;
      color: white;
    }

    .button--primary:hover:not(:disabled) {
      background-color: #2563eb;
    }

    .button--primary:active:not(:disabled) {
      background-color: #1d4ed8;
    }

    .button--secondary {
      background-color: #f1f5f9;
      color: #475569;
      border: 1px solid #e2e8f0;
    }

    .button--secondary:hover:not(:disabled) {
      background-color: #e2e8f0;
      border-color: #cbd5e1;
    }

    .button--secondary:active:not(:disabled) {
      background-color: #cbd5e1;
    }

    .button--danger {
      background-color: #ef4444;
      color: white;
    }

    .button--danger:hover:not(:disabled) {
      background-color: #dc2626;
    }

    .button--danger:active:not(:disabled) {
      background-color: #b91c1c;
    }

    .button--ghost {
      background-color: transparent;
      color: #475569;
    }

    .button--ghost:hover:not(:disabled) {
      background-color: #f1f5f9;
    }

    .button--ghost:active:not(:disabled) {
      background-color: #e2e8f0;
    }

    .loading-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .button-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .button--loading .button-content {
      opacity: 0.7;
    }
  `;

  render() {
    const classes = [
      'button',
      `button--${this.variant}`,
      `button--${this.size}`,
      this.loading ? 'button--loading' : '',
    ].join(' ');

    return html`
      <button
        class=${classes}
        type=${this.type}
        ?disabled=${this.disabled || this.loading}
        @click=${this._handleClick}
      >
        ${this.loading ? html`<div class="loading-spinner"></div>` : ''}
        <div class="button-content">
          <slot></slot>
        </div>
      </button>
    `;
  }

  private _handleClick(event: Event) {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.dispatchEvent(
      new CustomEvent('ui-click', {
        bubbles: true,
        composed: true,
        detail: { originalEvent: event },
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-button': UIButton;
  }
}

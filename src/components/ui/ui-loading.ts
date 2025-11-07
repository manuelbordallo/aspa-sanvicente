import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ui-loading')
export class UILoading extends LitElement {
  @property() size: 'sm' | 'md' | 'lg' = 'md';
  @property() message = '';
  @property({ type: Boolean }) fullscreen = false;

  static styles = css`
    :host {
      display: block;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
    }

    .loading-container--fullscreen {
      min-height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.95);
      z-index: 9999;
    }

    .spinner {
      border-radius: 50%;
      border-style: solid;
      border-color: #e5e7eb;
      border-top-color: #3b82f6;
      animation: spin 1s linear infinite;
    }

    .spinner--sm {
      width: 1.5rem;
      height: 1.5rem;
      border-width: 2px;
    }

    .spinner--md {
      width: 2.5rem;
      height: 2.5rem;
      border-width: 3px;
    }

    .spinner--lg {
      width: 4rem;
      height: 4rem;
      border-width: 4px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-message {
      color: #6b7280;
      font-size: 0.875rem;
      text-align: center;
    }

    .loading-message--sm {
      font-size: 0.75rem;
    }

    .loading-message--lg {
      font-size: 1rem;
    }

    @media (prefers-color-scheme: dark) {
      .loading-container--fullscreen {
        background-color: rgba(17, 24, 39, 0.95);
      }

      .spinner {
        border-color: #374151;
        border-top-color: #3b82f6;
      }

      .loading-message {
        color: #9ca3af;
      }
    }
  `;

  render() {
    const containerClasses = [
      'loading-container',
      this.fullscreen ? 'loading-container--fullscreen' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const spinnerClasses = ['spinner', `spinner--${this.size}`].join(' ');

    const messageClasses = [
      'loading-message',
      `loading-message--${this.size}`,
    ].join(' ');

    return html`
      <div class=${containerClasses}>
        <div class=${spinnerClasses}></div>
        ${this.message
          ? html`<div class=${messageClasses}>${this.message}</div>`
          : ''}
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-loading': UILoading;
  }
}

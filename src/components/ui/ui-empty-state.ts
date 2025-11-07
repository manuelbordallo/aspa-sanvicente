import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ui-empty-state')
export class UIEmptyState extends LitElement {
  @property() icon = '';
  @property() title = '';
  @property() message = '';
  @property() actionText = '';
  @property({ type: Boolean }) compact = false;

  static styles = css`
    :host {
      display: block;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background: white;
      border-radius: 0.5rem;
      border: 2px dashed #e5e7eb;
    }

    .empty-state--compact {
      padding: 2rem 1rem;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
      line-height: 1;
    }

    .empty-icon--compact {
      font-size: 3rem;
    }

    .empty-icon svg {
      width: 4rem;
      height: 4rem;
      margin: 0 auto;
      color: #9ca3af;
    }

    .empty-icon--compact svg {
      width: 3rem;
      height: 3rem;
    }

    .empty-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .empty-title--compact {
      font-size: 1.125rem;
    }

    .empty-message {
      color: #6b7280;
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .empty-message--compact {
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .empty-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (prefers-color-scheme: dark) {
      .empty-state {
        background-color: #1f2937;
        border-color: #374151;
      }

      .empty-icon svg {
        color: #6b7280;
      }

      .empty-title {
        color: #f3f4f6;
      }

      .empty-message {
        color: #9ca3af;
      }
    }

    @media (max-width: 640px) {
      .empty-state {
        padding: 2rem 1rem;
      }

      .empty-icon {
        font-size: 3rem;
      }

      .empty-title {
        font-size: 1.125rem;
      }

      .empty-message {
        font-size: 0.875rem;
      }
    }
  `;

  render() {
    const stateClasses = [
      'empty-state',
      this.compact ? 'empty-state--compact' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const iconClasses = [
      'empty-icon',
      this.compact ? 'empty-icon--compact' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const titleClasses = [
      'empty-title',
      this.compact ? 'empty-title--compact' : '',
    ]
      .filter(Boolean)
      .join(' ');

    const messageClasses = [
      'empty-message',
      this.compact ? 'empty-message--compact' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class=${stateClasses}>
        ${this.icon
          ? html`<div class=${iconClasses}>${this.icon}</div>`
          : html`
              <div class=${iconClasses}>
                <slot name="icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </slot>
              </div>
            `}
        ${this.title ? html`<h3 class=${titleClasses}>${this.title}</h3>` : ''}
        ${this.message
          ? html`<p class=${messageClasses}>${this.message}</p>`
          : ''}

        <div class="empty-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-empty-state': UIEmptyState;
  }
}

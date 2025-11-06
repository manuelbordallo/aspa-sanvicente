import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ui-card')
export class UICard extends LitElement {
  @property() title = '';
  @property({ type: Boolean }) elevated = false;
  @property({ type: Boolean }) interactive = false;
  @property() padding: 'none' | 'sm' | 'md' | 'lg' = 'md';

  static styles = css`
    :host {
      display: block;
    }

    .card {
      background-color: white;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease-in-out;
    }

    .card--elevated {
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: none;
    }

    .card--interactive {
      cursor: pointer;
    }

    .card--interactive:hover {
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
      transform: translateY(-1px);
    }

    .card--interactive:active {
      transform: translateY(0);
    }

    .card-header {
      padding: 1rem 1.5rem 0 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      margin-bottom: 1rem;
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 1rem 0;
    }

    .card-content {
      color: #475569;
      line-height: 1.6;
    }

    .card-content--none {
      padding: 0;
    }

    .card-content--sm {
      padding: 0.75rem;
    }

    .card-content--md {
      padding: 1.5rem;
    }

    .card-content--lg {
      padding: 2rem;
    }

    .card-footer {
      padding: 0 1.5rem 1rem 1.5rem;
      border-top: 1px solid #f1f5f9;
      margin-top: 1rem;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .card {
        background-color: #1e293b;
        border-color: #334155;
        color: #e2e8f0;
      }

      .card-header {
        border-bottom-color: #334155;
      }

      .card-title {
        color: #f1f5f9;
      }

      .card-content {
        color: #cbd5e1;
      }

      .card-footer {
        border-top-color: #334155;
      }
    }

    /* Theme classes for explicit theming */
    :host([theme='dark']) .card {
      background-color: #1e293b;
      border-color: #334155;
      color: #e2e8f0;
    }

    :host([theme='dark']) .card-header {
      border-bottom-color: #334155;
    }

    :host([theme='dark']) .card-title {
      color: #f1f5f9;
    }

    :host([theme='dark']) .card-content {
      color: #cbd5e1;
    }

    :host([theme='dark']) .card-footer {
      border-top-color: #334155;
    }
  `;

  render() {
    const classes = [
      'card',
      this.elevated ? 'card--elevated' : '',
      this.interactive ? 'card--interactive' : '',
    ].join(' ');

    const contentClasses = [
      'card-content',
      `card-content--${this.padding}`,
    ].join(' ');

    return html`
      <div class=${classes} @click=${this._handleClick}>
        ${this.title
          ? html`
              <div class="card-header">
                <h3 class="card-title">${this.title}</h3>
              </div>
            `
          : ''}

        <div class=${contentClasses}>
          <slot></slot>
        </div>

        <slot name="footer">
          ${this._hasFooterContent()
            ? html`
                <div class="card-footer">
                  <slot name="footer"></slot>
                </div>
              `
            : ''}
        </slot>
      </div>
    `;
  }

  private _handleClick(event: Event) {
    if (this.interactive) {
      this.dispatchEvent(
        new CustomEvent('ui-card-click', {
          bubbles: true,
          composed: true,
          detail: { originalEvent: event },
        })
      );
    }
  }

  private _hasFooterContent(): boolean {
    const footerSlot = this.shadowRoot?.querySelector(
      'slot[name="footer"]'
    ) as HTMLSlotElement;
    return footerSlot?.assignedNodes().length > 0;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-card': UICard;
  }
}

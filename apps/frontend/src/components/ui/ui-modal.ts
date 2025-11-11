import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ui-modal')
export class UIModal extends LitElement {
  @property({ type: Boolean }) isOpen = false;
  @property() title = '';
  @property() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @property({ type: Boolean }) closable = true;
  @property({ type: Boolean }) closeOnBackdrop = true;
  @property({ type: Boolean }) closeOnEscape = true;

  static styles = css`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      display: none;
    }

    :host([is-open]) {
      display: flex;
    }

    .modal-backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
    }

    .modal-backdrop--open {
      opacity: 1;
    }

    .modal-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 1rem;
      position: relative;
      z-index: 1001;
    }

    .modal {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: scale(0.95);
      opacity: 0;
      transition: all 0.2s ease-in-out;
    }

    .modal--open {
      transform: scale(1);
      opacity: 1;
    }

    .modal--sm {
      width: 100%;
      max-width: 24rem;
    }

    .modal--md {
      width: 100%;
      max-width: 32rem;
    }

    .modal--lg {
      width: 100%;
      max-width: 48rem;
    }

    .modal--xl {
      width: 100%;
      max-width: 64rem;
    }

    .modal-header {
      padding: 1.5rem 1.5rem 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .modal-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.25rem;
      color: #6b7280;
      transition: all 0.2s ease-in-out;
    }

    .modal-close:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    .modal-close:focus {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex: 1;
    }

    .modal-footer {
      padding: 1rem 1.5rem 1.5rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .close-icon {
      width: 1.25rem;
      height: 1.25rem;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .modal {
        background-color: #1f2937;
        color: #f9fafb;
      }

      .modal-header {
        border-bottom-color: #374151;
      }

      .modal-title {
        color: #f9fafb;
      }

      .modal-close {
        color: #9ca3af;
      }

      .modal-close:hover {
        background-color: #374151;
        color: #d1d5db;
      }

      .modal-footer {
        border-top-color: #374151;
      }
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .modal-container {
        padding: 0.5rem;
        align-items: flex-end;
      }

      .modal {
        width: 100%;
        max-height: 95vh;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.closeOnEscape) {
      document.addEventListener('keydown', this._handleKeydown);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._handleKeydown);
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('isOpen')) {
      if (this.isOpen) {
        this._openModal();
      } else {
        this._closeModal();
      }
    }
  }

  render() {
    return html`
      <div
        class="modal-backdrop ${this.isOpen ? 'modal-backdrop--open' : ''}"
        @click=${this._handleBackdropClick}
      ></div>

      <div class="modal-container">
        <div
          class="modal modal--${this.size} ${this.isOpen ? 'modal--open' : ''}"
        >
          ${this.title || this.closable
            ? html`
                <div class="modal-header">
                  <h2 class="modal-title">${this.title}</h2>
                  ${this.closable
                    ? html`
                        <button
                          class="modal-close"
                          @click=${this.close}
                          aria-label="Cerrar modal"
                        >
                          <svg
                            class="close-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      `
                    : ''}
                </div>
              `
            : ''}

          <div class="modal-body">
            <slot></slot>
          </div>

          ${this._hasFooterContent()
            ? html`
                <div class="modal-footer">
                  <slot name="footer"></slot>
                </div>
              `
            : ''}
        </div>
      </div>
    `;
  }

  private _openModal() {
    document.body.style.overflow = 'hidden';

    // Force reflow to ensure animation works
    this.offsetHeight;
  }

  private _closeModal() {
    document.body.style.overflow = '';
  }

  private _handleBackdropClick(event: Event) {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.close();
    }
  }

  private _handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.isOpen && this.closeOnEscape) {
      this.close();
    }
  };

  private _hasFooterContent(): boolean {
    const footerSlot = this.shadowRoot?.querySelector(
      'slot[name="footer"]'
    ) as HTMLSlotElement;
    return footerSlot?.assignedNodes().length > 0;
  }

  open() {
    this.isOpen = true;
    this.dispatchEvent(
      new CustomEvent('ui-modal-open', {
        bubbles: true,
        composed: true,
      })
    );
  }

  close() {
    this.isOpen = false;
    this.dispatchEvent(
      new CustomEvent('ui-modal-close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-modal': UIModal;
  }
}

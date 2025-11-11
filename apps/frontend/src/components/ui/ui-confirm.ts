import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import './ui-modal.js';
import './ui-button.js';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

@customElement('ui-confirm')
export class UIConfirm extends LitElement {
  @property({ type: Boolean }) isOpen = false;
  @property() title = '';
  @property() message = '';
  @property() confirmText = 'Confirmar';
  @property() cancelText = 'Cancelar';
  @property() type: 'danger' | 'warning' | 'info' = 'info';

  @state() private isLoading = false;

  static styles = css`
    :host {
      display: contents;
    }

    .confirm-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .confirm-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .confirm-icon--danger {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .confirm-icon--warning {
      background-color: #fef3c7;
      color: #f59e0b;
    }

    .confirm-icon--info {
      background-color: #dbeafe;
      color: #3b82f6;
    }

    .confirm-icon svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    .confirm-message {
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 0;
    }

    .confirm-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      margin-top: 0.5rem;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .confirm-message {
        color: #d1d5db;
      }

      .confirm-icon--danger {
        background-color: #7f1d1d;
        color: #fca5a5;
      }

      .confirm-icon--warning {
        background-color: #78350f;
        color: #fcd34d;
      }

      .confirm-icon--info {
        background-color: #1e3a8a;
        color: #93c5fd;
      }
    }
  `;

  private onConfirm?: () => void | Promise<void>;
  private onCancel?: () => void;

  render() {
    return html`
      <ui-modal
        .isOpen=${this.isOpen}
        .title=${this.title}
        size="sm"
        .closable=${!this.isLoading}
        .closeOnBackdrop=${!this.isLoading}
        .closeOnEscape=${!this.isLoading}
        @ui-modal-close=${this.handleCancel}
      >
        <div class="confirm-content">
          <div class="confirm-icon confirm-icon--${this.type}">
            ${this.getIcon()}
          </div>
          <p class="confirm-message">${this.message}</p>
          <div class="confirm-actions">
            <ui-button
              variant="secondary"
              @click=${this.handleCancel}
              ?disabled=${this.isLoading}
            >
              ${this.cancelText}
            </ui-button>
            <ui-button
              variant=${this.type === 'danger' ? 'danger' : 'primary'}
              @click=${this.handleConfirm}
              ?loading=${this.isLoading}
              ?disabled=${this.isLoading}
            >
              ${this.confirmText}
            </ui-button>
          </div>
        </div>
      </ui-modal>
    `;
  }

  private getIcon() {
    switch (this.type) {
      case 'danger':
        return html`
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        `;
      case 'warning':
        return html`
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        `;
      case 'info':
        return html`
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        `;
    }
  }

  private async handleConfirm() {
    if (this.onConfirm) {
      this.isLoading = true;
      try {
        await this.onConfirm();
        this.close();
      } catch (error) {
        console.error('Confirmation action failed:', error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.dispatchEvent(
        new CustomEvent('confirm', {
          bubbles: true,
          composed: true,
        })
      );
      this.close();
    }
  }

  private handleCancel() {
    if (this.isLoading) return;

    if (this.onCancel) {
      this.onCancel();
    }

    this.dispatchEvent(
      new CustomEvent('cancel', {
        bubbles: true,
        composed: true,
      })
    );
    this.close();
  }

  open(options?: ConfirmOptions) {
    if (options) {
      this.title = options.title;
      this.message = options.message;
      this.confirmText = options.confirmText || 'Confirmar';
      this.cancelText = options.cancelText || 'Cancelar';
      this.type = options.type || 'info';
      this.onConfirm = options.onConfirm;
      this.onCancel = options.onCancel;
    }
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
    this.isLoading = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-confirm': UIConfirm;
  }
}

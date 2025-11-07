import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { notificationContext } from '../../contexts/index.js';
import type {
  NotificationContextValue,
  Notification,
} from '../../contexts/index.js';

@customElement('ui-toast')
export class UIToast extends LitElement {
  @consume({ context: notificationContext, subscribe: true })
  @state()
  private notificationState!: NotificationContextValue;

  static styles = css`
    :host {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 24rem;
      pointer-events: none;
    }

    .toast {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
      padding: 1rem;
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid;
      min-width: 20rem;
    }

    .toast--success {
      border-left-color: #10b981;
    }

    .toast--error {
      border-left-color: #ef4444;
    }

    .toast--warning {
      border-left-color: #f59e0b;
    }

    .toast--info {
      border-left-color: #3b82f6;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast--success .toast-icon {
      background-color: #d1fae5;
      color: #10b981;
    }

    .toast--error .toast-icon {
      background-color: #fee2e2;
      color: #ef4444;
    }

    .toast--warning .toast-icon {
      background-color: #fef3c7;
      color: #f59e0b;
    }

    .toast--info .toast-icon {
      background-color: #dbeafe;
      color: #3b82f6;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      font-size: 0.875rem;
      color: #111827;
      margin: 0 0 0.25rem 0;
    }

    .toast-message {
      font-size: 0.875rem;
      color: #6b7280;
      margin: 0;
      word-wrap: break-word;
    }

    .toast-close {
      flex-shrink: 0;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      color: #9ca3af;
      transition: all 0.2s ease-in-out;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toast-close:hover {
      background-color: #f3f4f6;
      color: #6b7280;
    }

    .close-icon {
      width: 1rem;
      height: 1rem;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast--removing {
      animation: slideOut 0.3s ease-in forwards;
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .toast {
        background-color: #1f2937;
      }

      .toast-title {
        color: #f9fafb;
      }

      .toast-message {
        color: #d1d5db;
      }

      .toast-close {
        color: #6b7280;
      }

      .toast-close:hover {
        background-color: #374151;
        color: #9ca3af;
      }
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      :host {
        top: auto;
        bottom: 1rem;
        left: 1rem;
        right: 1rem;
        max-width: none;
      }

      .toast {
        min-width: auto;
        width: 100%;
      }

      @keyframes slideIn {
        from {
          transform: translateY(100%);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateY(0);
          opacity: 1;
        }
        to {
          transform: translateY(100%);
          opacity: 0;
        }
      }
    }
  `;

  private handleClose(id: string) {
    const toast = this.shadowRoot?.querySelector(`[data-id="${id}"]`);
    if (toast) {
      toast.classList.add('toast--removing');
      setTimeout(() => {
        this.notificationState.removeNotification(id);
      }, 300);
    }
  }

  private getIcon(type: Notification['type']) {
    switch (type) {
      case 'success':
        return html`
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        `;
      case 'error':
        return html`
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
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

  render() {
    if (!this.notificationState?.notifications?.length) {
      return html``;
    }

    return html`
      ${this.notificationState.notifications.map(
        (notification) => html`
          <div
            class="toast toast--${notification.type}"
            data-id="${notification.id}"
            role="alert"
            aria-live="polite"
          >
            <div class="toast-icon">${this.getIcon(notification.type)}</div>
            <div class="toast-content">
              <p class="toast-title">${notification.title}</p>
              <p class="toast-message">${notification.message}</p>
            </div>
            <button
              class="toast-close"
              @click=${() => this.handleClose(notification.id)}
              aria-label="Cerrar notificación"
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
          </div>
        `
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-toast': UIToast;
  }
}

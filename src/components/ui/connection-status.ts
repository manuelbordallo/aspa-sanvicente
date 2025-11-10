import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { backendDetector } from '../../services/backend-detector.js';

export type ConnectionState = 'connected' | 'mock' | 'error' | 'checking';

@customElement('connection-status')
export class ConnectionStatus extends LitElement {
  @property({ type: Boolean }) connected = false;
  @property({ type: Boolean }) mockMode = false;
  @property({ type: Boolean }) showRetry = true;

  @state() private isRetrying = false;
  @state() private lastError: string | undefined;

  static styles = css`
    :host {
      display: block;
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
      transition: all 0.2s ease-in-out;
      cursor: default;
    }

    .status-badge:hover {
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    /* Connection states */
    .status-badge--connected {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #10b981;
    }

    .status-badge--mock {
      background-color: #fef3c7;
      color: #92400e;
      border: 1px solid #f59e0b;
    }

    .status-badge--error {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #ef4444;
    }

    .status-badge--checking {
      background-color: #dbeafe;
      color: #1e40af;
      border: 1px solid #3b82f6;
    }

    .status-indicator {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .status-indicator--connected {
      background-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .status-indicator--mock {
      background-color: #f59e0b;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
    }

    .status-indicator--error {
      background-color: #ef4444;
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
    }

    .status-indicator--checking {
      background-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .status-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .status-label {
      font-weight: 600;
      line-height: 1;
    }

    .status-detail {
      font-size: 0.75rem;
      opacity: 0.8;
      line-height: 1;
    }

    .retry-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 0.25rem;
      color: inherit;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease-in-out;
      margin-left: 0.25rem;
    }

    .retry-button:hover:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .retry-button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .retry-icon {
      width: 1rem;
      height: 1rem;
    }

    .retry-icon--spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .status-badge--connected {
        background-color: #064e3b;
        color: #d1fae5;
      }

      .status-badge--mock {
        background-color: #78350f;
        color: #fef3c7;
      }

      .status-badge--error {
        background-color: #7f1d1d;
        color: #fee2e2;
      }

      .status-badge--checking {
        background-color: #1e3a8a;
        color: #dbeafe;
      }
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      :host {
        top: auto;
        bottom: 1rem;
        left: 1rem;
        right: auto;
      }

      .status-badge {
        font-size: 0.75rem;
        padding: 0.375rem 0.625rem;
      }

      .status-detail {
        display: none;
      }
    }
  `;

  private statusListener = (available: boolean) => {
    this.connected = available;
    this.isRetrying = false;

    // Get last status for error details
    const lastStatus = backendDetector.getLastStatus();
    this.lastError = lastStatus?.error;
  };

  connectedCallback() {
    super.connectedCallback();

    // Subscribe to backend detector status changes
    backendDetector.addStatusListener(this.statusListener);

    // Initialize with current status
    this.connected = backendDetector.isBackendAvailable();
    const lastStatus = backendDetector.getLastStatus();
    this.lastError = lastStatus?.error;
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Unsubscribe from status changes
    backendDetector.removeStatusListener(this.statusListener);
  }

  private get connectionState(): ConnectionState {
    if (this.isRetrying) {
      return 'checking';
    }
    if (this.connected) {
      return 'connected';
    }
    if (this.mockMode) {
      return 'mock';
    }
    return 'error';
  }

  private get statusLabel(): string {
    switch (this.connectionState) {
      case 'connected':
        return 'Conectado';
      case 'mock':
        return 'Modo Mock';
      case 'error':
        return 'Sin conexión';
      case 'checking':
        return 'Verificando...';
    }
  }

  private get statusDetail(): string | undefined {
    switch (this.connectionState) {
      case 'connected':
        return 'Backend disponible';
      case 'mock':
        return 'Usando datos de prueba';
      case 'error':
        return this.lastError || 'Backend no disponible';
      case 'checking':
        return 'Intentando reconectar';
    }
  }

  private async handleRetry() {
    if (this.isRetrying) {
      return;
    }

    this.isRetrying = true;

    try {
      const available = await backendDetector.checkBackendAvailability();

      // Dispatch event to notify parent components
      this.dispatchEvent(
        new CustomEvent('connection-retry', {
          bubbles: true,
          composed: true,
          detail: { success: available },
        })
      );
    } catch (error) {
      console.error('[ConnectionStatus] Retry failed:', error);
    } finally {
      this.isRetrying = false;
    }
  }

  private getStatusIcon() {
    switch (this.connectionState) {
      case 'connected':
        return html`
          <svg
            class="retry-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        `;
      case 'mock':
        return html`
          <svg
            class="retry-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        `;
      case 'error':
        return html`
          <svg
            class="retry-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        `;
      case 'checking':
        return html`
          <svg
            class="retry-icon retry-icon--spinning"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        `;
    }
  }

  render() {
    const state = this.connectionState;
    const badgeClasses = `status-badge status-badge--${state}`;
    const indicatorClasses = `status-indicator status-indicator--${state}`;

    return html`
      <div class=${badgeClasses} role="status" aria-live="polite">
        <div class=${indicatorClasses}></div>
        <div class="status-text">
          <span class="status-label">${this.statusLabel}</span>
          ${this.statusDetail
            ? html`<span class="status-detail">${this.statusDetail}</span>`
            : ''}
        </div>
        ${this.showRetry && (state === 'error' || state === 'mock')
          ? html`
              <button
                class="retry-button"
                @click=${this.handleRetry}
                ?disabled=${this.isRetrying}
                aria-label="Reintentar conexión"
                title="Reintentar conexión"
              >
                ${this.getStatusIcon()}
              </button>
            `
          : this.getStatusIcon()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'connection-status': ConnectionStatus;
  }
}

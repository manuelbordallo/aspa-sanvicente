import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import {
  authService,
  authServiceFactory,
} from '../services/auth-service-factory.js';
import { mockAuthService } from '../services/mock-auth-service.js';
import type { LoginFormData } from '../types/index.js';
import '../components/forms/login-form.js';

@customElement('login-view')
export class LoginView extends LitElement {
  @state() private isLoading = false;
  @state() private errorMessage = '';
  @state() private isMockMode = false;

  @query('login-form') private loginForm!: any;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background-color: #f9fafb;
    }

    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1rem;
    }

    .login-card {
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      padding: 2rem;
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .login-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .login-subtitle {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .login-logo {
      width: 4rem;
      height: 4rem;
      margin: 0 auto 1rem;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      font-weight: 700;
    }

    .mock-mode-banner {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 0.375rem;
      padding: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
      color: #92400e;
    }

    .mock-mode-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .mock-mode-icon {
      font-size: 1rem;
    }

    .mock-credentials {
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid #fbbf24;
    }

    .mock-credentials-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .credential-item {
      margin: 0.25rem 0;
      font-family: monospace;
      font-size: 0.8125rem;
    }

    .credential-label {
      font-weight: 600;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      :host {
        background-color: #111827;
      }

      .login-card {
        background: #1f2937;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
      }

      .login-title {
        color: #f9fafb;
      }

      .login-subtitle {
        color: #9ca3af;
      }

      .mock-mode-banner {
        background: #422006;
        border-color: #92400e;
        color: #fef3c7;
      }

      .mock-credentials {
        border-top-color: #92400e;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();

    // Check if in mock mode
    if (authServiceFactory.isInitialized()) {
      this.isMockMode = authServiceFactory.isMockMode();
    }

    // Check if already authenticated and redirect
    if (authService.isAuthenticated()) {
      this.redirectToApp();
    }
  }

  render() {
    return html`
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <div class="login-logo">📚</div>
            <h1 class="login-title">Gestión Escolar</h1>
            <p class="login-subtitle">Inicia sesión para continuar</p>
          </div>

          ${this.renderMockModeBanner()}

          <login-form
            .loading=${this.isLoading}
            .errorMessage=${this.errorMessage}
            @login-submit=${this.handleLoginSubmit}
          ></login-form>
        </div>
      </div>
    `;
  }

  private renderMockModeBanner() {
    if (!this.isMockMode) {
      return null;
    }

    const credentials = mockAuthService.getMockCredentials();

    return html`
      <div class="mock-mode-banner">
        <div class="mock-mode-title">
          <span class="mock-mode-icon">⚠️</span>
          <span>Modo de Desarrollo</span>
        </div>
        <div>
          El backend no está disponible. Usando datos de prueba locales.
        </div>
        <div class="mock-credentials">
          <div class="mock-credentials-title">Credenciales de prueba:</div>
          ${credentials.map(
            (cred) => html`
              <div class="credential-item">
                <span class="credential-label">${cred.role}:</span>
                ${cred.email} / ${cred.password}
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private async handleLoginSubmit(event: CustomEvent<LoginFormData>) {
    console.log('[LoginView] Received login-submit event:', event.detail);
    const credentials = event.detail;

    this.isLoading = true;
    this.errorMessage = '';

    console.log('[LoginView] Attempting login with:', credentials);

    try {
      await authService.login(credentials);
      console.log('[LoginView] Login successful');

      // Clear form
      if (this.loginForm) {
        this.loginForm.reset();
      }

      // Redirect to app
      this.redirectToApp();
    } catch (error) {
      this.isLoading = false;

      // Handle specific error cases
      const errorMsg =
        error instanceof Error ? error.message : 'Error desconocido';

      // Improved error messages based on error type
      if (errorMsg.includes('401') || errorMsg.includes('credenciales')) {
        this.errorMessage = this.isMockMode
          ? 'Credenciales incorrectas. Usa las credenciales de prueba mostradas arriba.'
          : 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
      } else if (
        errorMsg.includes('network') ||
        errorMsg.includes('fetch') ||
        errorMsg.includes('Failed to fetch')
      ) {
        this.errorMessage = this.isMockMode
          ? 'Error de conexión en modo de desarrollo. Verifica que estés usando las credenciales de prueba.'
          : 'Error de conexión con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.';
      } else if (
        errorMsg.includes('timeout') ||
        errorMsg.includes('timed out')
      ) {
        this.errorMessage =
          'La solicitud tardó demasiado tiempo. El servidor puede estar sobrecargado o tu conexión es lenta. Por favor, intenta nuevamente.';
      } else if (errorMsg.includes('500') || errorMsg.includes('servidor')) {
        this.errorMessage =
          'Error del servidor. Por favor, intenta nuevamente en unos momentos.';
      } else {
        this.errorMessage =
          errorMsg || 'Error al iniciar sesión. Por favor, intenta nuevamente.';
      }

      // Set error on form
      if (this.loginForm) {
        this.loginForm.setError(this.errorMessage);
      }
    }
  }

  private redirectToApp() {
    console.log('[LoginView] Dispatching login-success event');
    // Dispatch event to notify app of successful login
    this.dispatchEvent(
      new CustomEvent('login-success', {
        bubbles: true,
        composed: true,
      })
    );
    console.log('[LoginView] login-success event dispatched');
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-view': LoginView;
  }
}

import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { authService } from '../services/auth-service.js';
import type { LoginFormData } from '../types/index.js';
import '../components/forms/login-form.js';

@customElement('login-view')
export class LoginView extends LitElement {
  @state() private isLoading = false;
  @state() private errorMessage = '';

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
    }
  `;

  connectedCallback() {
    super.connectedCallback();

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

          <login-form
            .loading=${this.isLoading}
            .errorMessage=${this.errorMessage}
            @login-submit=${this.handleLoginSubmit}
          ></login-form>
        </div>
      </div>
    `;
  }

  private async handleLoginSubmit(event: CustomEvent<LoginFormData>) {
    const credentials = event.detail;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await authService.login(credentials);

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

      if (errorMsg.includes('401') || errorMsg.includes('credenciales')) {
        this.errorMessage =
          'Credenciales incorrectas. Por favor, verifica tu email y contraseña.';
      } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
        this.errorMessage =
          'Error de conexión. Por favor, verifica tu conexión a internet.';
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
    // Dispatch event to notify app of successful login
    this.dispatchEvent(
      new CustomEvent('login-success', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-view': LoginView;
  }
}

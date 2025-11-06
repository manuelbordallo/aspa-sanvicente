import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('login-view')
export class LoginView extends LitElement {
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
  `;

  render() {
    return html`
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <h1 class="login-title">Gestión Escolar</h1>
            <p class="login-subtitle">Inicia sesión para continuar</p>
          </div>

          <div>
            <p>Vista de login - Por implementar en tarea posterior</p>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-view': LoginView;
  }
}

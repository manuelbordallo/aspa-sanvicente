import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ValidationService } from '../../utils/validators.js';
import type { LoginFormData, FormError } from '../../types/index.js';
import '../ui/ui-input.js';
import '../ui/ui-button.js';

@customElement('login-form')
export class LoginForm extends LitElement {
  @property({ type: Boolean }) loading = false;
  @property() errorMessage = '';

  @state() private _formData: LoginFormData = {
    email: '',
    password: '',
  };

  @state() private _errors: FormError[] = [];
  @state() private _touched: Record<string, boolean> = {};

  static styles = css`
    :host {
      display: block;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1rem;
    }

    .error-message {
      padding: 0.75rem;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.375rem;
      color: #dc2626;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .error-icon {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }

    .form-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .form-footer-text {
      color: #6b7280;
      font-size: 0.875rem;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .error-message {
        background-color: #450a0a;
        border-color: #7f1d1d;
        color: #fca5a5;
      }

      .form-footer {
        border-top-color: #374151;
      }

      .form-footer-text {
        color: #9ca3af;
      }
    }
  `;

  render() {
    return html`
      <form class="form" @submit=${this._handleSubmit} novalidate>
        ${this.errorMessage
          ? html`
              <div class="error-message">
                <svg class="error-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                ${this.errorMessage}
              </div>
            `
          : ''}

        <div class="form-group">
          <ui-input
            type="email"
            name="email"
            label="Correo electrónico"
            placeholder="tu@email.com"
            .value=${this._formData.email}
            .errorMessage=${this._getFieldError('email')}
            required
            autocomplete="email"
            @ui-input=${this._handleEmailInput}
            @ui-blur=${() => this._markFieldAsTouched('email')}
          ></ui-input>
        </div>

        <div class="form-group">
          <ui-input
            type="password"
            name="password"
            label="Contraseña"
            placeholder="Tu contraseña"
            .value=${this._formData.password}
            .errorMessage=${this._getFieldError('password')}
            required
            autocomplete="current-password"
            @ui-input=${this._handlePasswordInput}
            @ui-blur=${() => this._markFieldAsTouched('password')}
          ></ui-input>
        </div>

        <div class="form-actions">
          <ui-button
            type="submit"
            variant="primary"
            size="lg"
            .loading=${this.loading}
            .disabled=${!this._isFormValid()}
          >
            ${this.loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </ui-button>
        </div>

        <div class="form-footer">
          <p class="form-footer-text">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>
      </form>
    `;
  }

  private _handleEmailInput(event: CustomEvent) {
    this._formData = {
      ...this._formData,
      email: event.detail.value,
    };
    this._validateField('email');
  }

  private _handlePasswordInput(event: CustomEvent) {
    this._formData = {
      ...this._formData,
      password: event.detail.value,
    };
    this._validateField('password');
  }

  private _handleSubmit(event: Event) {
    event.preventDefault();

    if (this.loading) return;

    // Mark all fields as touched
    this._touched = {
      email: true,
      password: true,
    };

    // Validate all fields
    this._validateAllFields();

    if (this._isFormValid()) {
      this.dispatchEvent(
        new CustomEvent('login-submit', {
          bubbles: true,
          composed: true,
          detail: { ...this._formData },
        })
      );
    }
  }

  private _validateField(fieldName: keyof LoginFormData) {
    const errors: FormError[] = [];

    switch (fieldName) {
      case 'email':
        if (!this._formData.email) {
          errors.push({
            field: 'email',
            message: 'El correo electrónico es requerido',
          });
        } else if (!ValidationService.validateEmail(this._formData.email)) {
          errors.push({
            field: 'email',
            message: 'Ingresa un correo electrónico válido',
          });
        }
        break;

      case 'password':
        if (!this._formData.password) {
          errors.push({
            field: 'password',
            message: 'La contraseña es requerida',
          });
        } else if (this._formData.password.length < 6) {
          errors.push({
            field: 'password',
            message: 'La contraseña debe tener al menos 6 caracteres',
          });
        }
        break;
    }

    // Remove existing errors for this field
    this._errors = this._errors.filter((error) => error.field !== fieldName);

    // Add new errors
    this._errors = [...this._errors, ...errors];

    this.requestUpdate();
  }

  private _validateAllFields() {
    this._errors = [];
    this._validateField('email');
    this._validateField('password');
  }

  private _markFieldAsTouched(fieldName: string) {
    this._touched = {
      ...this._touched,
      [fieldName]: true,
    };
  }

  private _getFieldError(fieldName: string): string {
    if (!this._touched[fieldName]) return '';

    const error = this._errors.find((error) => error.field === fieldName);
    return error?.message || '';
  }

  private _isFormValid(): boolean {
    return !!(
      this._formData.email &&
      this._formData.password &&
      this._errors.length === 0 &&
      ValidationService.validateEmail(this._formData.email) &&
      this._formData.password.length >= 6
    );
  }

  reset() {
    this._formData = {
      email: '',
      password: '',
    };
    this._errors = [];
    this._touched = {};
    this.errorMessage = '';
  }

  setError(message: string) {
    this.errorMessage = message;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'login-form': LoginForm;
  }
}

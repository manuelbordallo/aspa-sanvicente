import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { authContext } from '../contexts/index.js';
import type { AuthContextValue } from '../contexts/index.js';
import { authService } from '../services/auth-service.js';
import { notificationService } from '../services/notification-service.js';
import { ValidationService } from '../utils/validators.js';
import type { User, PasswordChangeData, FormError } from '../types/index.js';
import '../components/ui/ui-input.js';
import '../components/ui/ui-button.js';
import '../components/ui/ui-card.js';
import '../components/ui/ui-confirm.js';

@customElement('profile-view')
export class ProfileView extends LitElement {
  @consume({ context: authContext, subscribe: true })
  @state()
  private authState!: AuthContextValue;

  @state() private isEditingProfile = false;
  @state() private isChangingPassword = false;
  @state() private profileLoading = false;
  @state() private passwordLoading = false;
  @state() private profileError = '';
  @state() private passwordError = '';
  @state() private profileSuccess = '';
  @state() private passwordSuccess = '';

  @state() private profileFormData = {
    firstName: '',
    lastName: '',
    email: '',
  };

  @state() private passwordFormData: PasswordChangeData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  @state() private profileErrors: FormError[] = [];
  @state() private passwordErrors: FormError[] = [];
  @state() private profileTouched: Record<string, boolean> = {};
  @state() private passwordTouched: Record<string, boolean> = {};

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .view-header {
      margin-bottom: 2rem;
    }

    .view-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 0.5rem;
    }

    .view-description {
      color: #6b7280;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    @media (min-width: 768px) {
      .profile-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    .card {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .card-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .info-row {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
    }

    .info-value {
      font-size: 1rem;
      color: #111827;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-actions {
      display: flex;
      gap: 0.75rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .message {
      padding: 0.75rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      margin-bottom: 1rem;
    }

    .message--success {
      background-color: #d1fae5;
      border: 1px solid #6ee7b7;
      color: #065f46;
    }

    .message--error {
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
    }

    .user-avatar-large {
      width: 5rem;
      height: 5rem;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 2rem;
      margin: 0 auto 1.5rem;
    }

    .user-role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .user-role-badge--admin {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .user-role-badge--user {
      background-color: #e0e7ff;
      color: #4338ca;
    }

    .logout-section {
      grid-column: 1 / -1;
    }

    .logout-card {
      background: #fef2f2;
      border: 1px solid #fecaca;
    }

    .logout-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .logout-text {
      flex: 1;
    }

    .logout-title {
      font-weight: 600;
      color: #991b1b;
      margin-bottom: 0.25rem;
    }

    .logout-description {
      font-size: 0.875rem;
      color: #7f1d1d;
    }

    .password-requirements {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.5rem;
      padding: 0.75rem;
      background-color: #f9fafb;
      border-radius: 0.375rem;
    }

    .password-requirements ul {
      margin: 0.5rem 0 0 1.25rem;
      padding: 0;
    }

    .password-requirements li {
      margin: 0.25rem 0;
    }

    @media (prefers-color-scheme: dark) {
      .view-title {
        color: #f9fafb;
      }

      .view-description {
        color: #9ca3af;
      }

      .card {
        background: #1f2937;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3);
      }

      .card-header {
        border-bottom-color: #374151;
      }

      .card-title {
        color: #f9fafb;
      }

      .info-label {
        color: #9ca3af;
      }

      .info-value {
        color: #f9fafb;
      }

      .password-requirements {
        background-color: #111827;
        color: #9ca3af;
      }
    }

    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }

      .view-title {
        font-size: 1.5rem;
      }

      .profile-grid {
        grid-template-columns: 1fr;
      }

      .card {
        padding: 1rem;
      }

      .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions ui-button {
        width: 100%;
      }

      .logout-content {
        flex-direction: column;
        align-items: stretch;
      }

      .logout-content ui-button {
        width: 100%;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.initializeProfileData();
  }

  private initializeProfileData() {
    if (this.authState?.user) {
      this.profileFormData = {
        firstName: this.authState.user.firstName,
        lastName: this.authState.user.lastName,
        email: this.authState.user.email,
      };
    }
  }

  private getUserInitials(): string {
    const user = this.authState?.user;
    if (!user) return 'U';

    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  }

  private handleEditProfile() {
    this.isEditingProfile = true;
    this.profileError = '';
    this.profileSuccess = '';
    this.initializeProfileData();
  }

  private handleCancelEditProfile() {
    this.isEditingProfile = false;
    this.profileErrors = [];
    this.profileTouched = {};
    this.initializeProfileData();
  }

  private handleProfileInput(
    field: keyof typeof this.profileFormData,
    value: string
  ) {
    this.profileFormData = {
      ...this.profileFormData,
      [field]: value,
    };
    this.validateProfileField(field);
  }

  private validateProfileField(field: keyof typeof this.profileFormData) {
    const errors: FormError[] = [];

    switch (field) {
      case 'firstName':
        if (!this.profileFormData.firstName.trim()) {
          errors.push({
            field: 'firstName',
            message: 'El nombre es requerido',
          });
        } else if (this.profileFormData.firstName.trim().length < 2) {
          errors.push({
            field: 'firstName',
            message: 'El nombre debe tener al menos 2 caracteres',
          });
        }
        break;

      case 'lastName':
        if (!this.profileFormData.lastName.trim()) {
          errors.push({
            field: 'lastName',
            message: 'Los apellidos son requeridos',
          });
        } else if (this.profileFormData.lastName.trim().length < 2) {
          errors.push({
            field: 'lastName',
            message: 'Los apellidos deben tener al menos 2 caracteres',
          });
        }
        break;

      case 'email':
        if (!this.profileFormData.email.trim()) {
          errors.push({
            field: 'email',
            message: 'El correo electrónico es requerido',
          });
        } else if (
          !ValidationService.validateEmail(this.profileFormData.email)
        ) {
          errors.push({ field: 'email', message: 'Formato de email inválido' });
        }
        break;
    }

    this.profileErrors = this.profileErrors.filter(
      (error) => error.field !== field
    );
    this.profileErrors = [...this.profileErrors, ...errors];
  }

  private async handleSaveProfile() {
    this.profileTouched = {
      firstName: true,
      lastName: true,
      email: true,
    };

    this.validateProfileField('firstName');
    this.validateProfileField('lastName');
    this.validateProfileField('email');

    if (this.profileErrors.length > 0) {
      return;
    }

    this.profileLoading = true;
    this.profileError = '';
    this.profileSuccess = '';

    try {
      await authService.updateProfile({
        firstName: this.profileFormData.firstName.trim(),
        lastName: this.profileFormData.lastName.trim(),
        email: this.profileFormData.email.trim(),
      });

      this.profileSuccess = 'Perfil actualizado correctamente';
      this.isEditingProfile = false;
      this.profileTouched = {};

      // Show success notification
      notificationService.success(
        'Perfil actualizado',
        'Tus datos se han actualizado correctamente.'
      );
    } catch (error) {
      this.profileError =
        error instanceof Error
          ? error.message
          : 'Error al actualizar el perfil';

      // Show error notification
      notificationService.error(
        'Error al actualizar perfil',
        this.profileError
      );
    } finally {
      this.profileLoading = false;
    }
  }

  private handleChangePassword() {
    this.isChangingPassword = true;
    this.passwordError = '';
    this.passwordSuccess = '';
    this.passwordFormData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }

  private handleCancelChangePassword() {
    this.isChangingPassword = false;
    this.passwordErrors = [];
    this.passwordTouched = {};
    this.passwordFormData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
  }

  private handlePasswordInput(field: keyof PasswordChangeData, value: string) {
    this.passwordFormData = {
      ...this.passwordFormData,
      [field]: value,
    };
    this.validatePasswordField(field);
  }

  private validatePasswordField(field: keyof PasswordChangeData) {
    const errors: FormError[] = [];

    switch (field) {
      case 'currentPassword':
        if (!this.passwordFormData.currentPassword) {
          errors.push({
            field: 'currentPassword',
            message: 'La contraseña actual es requerida',
          });
        }
        break;

      case 'newPassword':
        if (!this.passwordFormData.newPassword) {
          errors.push({
            field: 'newPassword',
            message: 'La nueva contraseña es requerida',
          });
        } else {
          const validation = ValidationService.validatePassword(
            this.passwordFormData.newPassword
          );
          if (!validation.isValid) {
            errors.push({
              field: 'newPassword',
              message: validation.errors[0],
            });
          }
        }
        break;

      case 'confirmPassword':
        if (!this.passwordFormData.confirmPassword) {
          errors.push({
            field: 'confirmPassword',
            message: 'Confirma tu nueva contraseña',
          });
        } else if (
          this.passwordFormData.newPassword !==
          this.passwordFormData.confirmPassword
        ) {
          errors.push({
            field: 'confirmPassword',
            message: 'Las contraseñas no coinciden',
          });
        }
        break;
    }

    this.passwordErrors = this.passwordErrors.filter(
      (error) => error.field !== field
    );
    this.passwordErrors = [...this.passwordErrors, ...errors];
  }

  private async handleSavePassword() {
    this.passwordTouched = {
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    };

    this.validatePasswordField('currentPassword');
    this.validatePasswordField('newPassword');
    this.validatePasswordField('confirmPassword');

    if (this.passwordErrors.length > 0) {
      return;
    }

    this.passwordLoading = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    try {
      await authService.changePassword(this.passwordFormData);

      this.passwordSuccess = 'Contraseña cambiada correctamente';
      this.isChangingPassword = false;
      this.passwordTouched = {};
      this.passwordFormData = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      };

      // Show success notification
      notificationService.success(
        'Contraseña actualizada',
        'Tu contraseña se ha cambiado correctamente.'
      );
    } catch (error) {
      this.passwordError =
        error instanceof Error
          ? error.message
          : 'Error al cambiar la contraseña';

      // Show error notification
      notificationService.error(
        'Error al cambiar contraseña',
        this.passwordError
      );
    } finally {
      this.passwordLoading = false;
    }
  }

  private async handleLogout() {
    // Create confirmation dialog
    const confirm = document.createElement('ui-confirm');
    document.body.appendChild(confirm);

    confirm.open({
      title: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      confirmText: 'Cerrar sesión',
      cancelText: 'Cancelar',
      type: 'info',
      onConfirm: async () => {
        try {
          await authService.logout();
          window.location.href = '/login';
        } catch (error) {
          console.error('Error during logout:', error);
          notificationService.error(
            'Error',
            'No se pudo cerrar la sesión. Intenta nuevamente.'
          );
        } finally {
          document.body.removeChild(confirm);
        }
      },
      onCancel: () => {
        document.body.removeChild(confirm);
      },
    });
  }

  private getProfileFieldError(field: string): string {
    if (!this.profileTouched[field]) return '';
    const error = this.profileErrors.find((error) => error.field === field);
    return error?.message || '';
  }

  private getPasswordFieldError(field: string): string {
    if (!this.passwordTouched[field]) return '';
    const error = this.passwordErrors.find((error) => error.field === field);
    return error?.message || '';
  }

  render() {
    const user = this.authState?.user;

    if (!user) {
      return html`
        <div class="view-header">
          <h1 class="view-title">Perfil</h1>
          <p class="view-description">Cargando información del usuario...</p>
        </div>
      `;
    }

    return html`
      <div class="view-header">
        <h1 class="view-title">Perfil</h1>
        <p class="view-description">Gestiona tu información personal</p>
      </div>

      <div class="profile-grid">
        ${this.renderProfileCard(user)} ${this.renderPasswordCard()}
        ${this.renderLogoutCard()}
      </div>
    `;
  }

  private renderProfileCard(user: User) {
    return html`
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Información Personal</h2>
          ${!this.isEditingProfile
            ? html`
                <ui-button
                  variant="secondary"
                  size="sm"
                  @click=${this.handleEditProfile}
                >
                  Editar
                </ui-button>
              `
            : ''}
        </div>

        <div class="card-body">
          ${this.profileSuccess
            ? html`<div class="message message--success">
                ${this.profileSuccess}
              </div>`
            : ''}
          ${this.profileError
            ? html`<div class="message message--error">
                ${this.profileError}
              </div>`
            : ''}
          ${!this.isEditingProfile
            ? html`
                <div class="user-avatar-large">${this.getUserInitials()}</div>

                <div class="info-row">
                  <span class="info-label">Nombre</span>
                  <span class="info-value">${user.firstName}</span>
                </div>

                <div class="info-row">
                  <span class="info-label">Apellidos</span>
                  <span class="info-value">${user.lastName}</span>
                </div>

                <div class="info-row">
                  <span class="info-label">Correo electrónico</span>
                  <span class="info-value">${user.email}</span>
                </div>

                <div class="info-row">
                  <span class="info-label">Rol</span>
                  <span class="user-role-badge user-role-badge--${user.role}">
                    ${user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                </div>
              `
            : html`
                <div class="form-group">
                  <ui-input
                    type="text"
                    name="firstName"
                    label="Nombre"
                    .value=${this.profileFormData.firstName}
                    .errorMessage=${this.getProfileFieldError('firstName')}
                    required
                    @ui-input=${(e: CustomEvent) =>
                      this.handleProfileInput('firstName', e.detail.value)}
                    @blur=${() => (this.profileTouched.firstName = true)}
                  ></ui-input>
                </div>

                <div class="form-group">
                  <ui-input
                    type="text"
                    name="lastName"
                    label="Apellidos"
                    .value=${this.profileFormData.lastName}
                    .errorMessage=${this.getProfileFieldError('lastName')}
                    required
                    @ui-input=${(e: CustomEvent) =>
                      this.handleProfileInput('lastName', e.detail.value)}
                    @blur=${() => (this.profileTouched.lastName = true)}
                  ></ui-input>
                </div>

                <div class="form-group">
                  <ui-input
                    type="email"
                    name="email"
                    label="Correo electrónico"
                    .value=${this.profileFormData.email}
                    .errorMessage=${this.getProfileFieldError('email')}
                    required
                    @ui-input=${(e: CustomEvent) =>
                      this.handleProfileInput('email', e.detail.value)}
                    @blur=${() => (this.profileTouched.email = true)}
                  ></ui-input>
                </div>

                <div class="form-actions">
                  <ui-button
                    variant="primary"
                    .loading=${this.profileLoading}
                    @click=${this.handleSaveProfile}
                  >
                    Guardar cambios
                  </ui-button>
                  <ui-button
                    variant="secondary"
                    .disabled=${this.profileLoading}
                    @click=${this.handleCancelEditProfile}
                  >
                    Cancelar
                  </ui-button>
                </div>
              `}
        </div>
      </div>
    `;
  }

  private renderPasswordCard() {
    return html`
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Cambiar Contraseña</h2>
          ${!this.isChangingPassword
            ? html`
                <ui-button
                  variant="secondary"
                  size="sm"
                  @click=${this.handleChangePassword}
                >
                  Cambiar
                </ui-button>
              `
            : ''}
        </div>

        <div class="card-body">
          ${this.passwordSuccess
            ? html`<div class="message message--success">
                ${this.passwordSuccess}
              </div>`
            : ''}
          ${this.passwordError
            ? html`<div class="message message--error">
                ${this.passwordError}
              </div>`
            : ''}
          ${!this.isChangingPassword
            ? html`
                <div class="info-row">
                  <span class="info-label">Contraseña</span>
                  <span class="info-value">••••••••</span>
                </div>
                <p
                  style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;"
                >
                  Mantén tu contraseña segura y cámbiala regularmente.
                </p>
              `
            : html`
                <div class="form-group">
                  <ui-input
                    type="password"
                    name="currentPassword"
                    label="Contraseña actual"
                    .value=${this.passwordFormData.currentPassword}
                    .errorMessage=${this.getPasswordFieldError(
                      'currentPassword'
                    )}
                    required
                    autocomplete="current-password"
                    @ui-input=${(e: CustomEvent) =>
                      this.handlePasswordInput(
                        'currentPassword',
                        e.detail.value
                      )}
                    @blur=${() => (this.passwordTouched.currentPassword = true)}
                  ></ui-input>
                </div>

                <div class="form-group">
                  <ui-input
                    type="password"
                    name="newPassword"
                    label="Nueva contraseña"
                    .value=${this.passwordFormData.newPassword}
                    .errorMessage=${this.getPasswordFieldError('newPassword')}
                    required
                    autocomplete="new-password"
                    @ui-input=${(e: CustomEvent) =>
                      this.handlePasswordInput('newPassword', e.detail.value)}
                    @blur=${() => (this.passwordTouched.newPassword = true)}
                  ></ui-input>
                </div>

                <div class="form-group">
                  <ui-input
                    type="password"
                    name="confirmPassword"
                    label="Confirmar nueva contraseña"
                    .value=${this.passwordFormData.confirmPassword}
                    .errorMessage=${this.getPasswordFieldError(
                      'confirmPassword'
                    )}
                    required
                    autocomplete="new-password"
                    @ui-input=${(e: CustomEvent) =>
                      this.handlePasswordInput(
                        'confirmPassword',
                        e.detail.value
                      )}
                    @blur=${() => (this.passwordTouched.confirmPassword = true)}
                  ></ui-input>
                </div>

                <div class="password-requirements">
                  <strong>Requisitos de contraseña:</strong>
                  <ul>
                    <li>Mínimo 8 caracteres</li>
                    <li>Al menos una letra mayúscula</li>
                    <li>Al menos una letra minúscula</li>
                    <li>Al menos un número</li>
                  </ul>
                </div>

                <div class="form-actions">
                  <ui-button
                    variant="primary"
                    .loading=${this.passwordLoading}
                    @click=${this.handleSavePassword}
                  >
                    Cambiar contraseña
                  </ui-button>
                  <ui-button
                    variant="secondary"
                    .disabled=${this.passwordLoading}
                    @click=${this.handleCancelChangePassword}
                  >
                    Cancelar
                  </ui-button>
                </div>
              `}
        </div>
      </div>
    `;
  }

  private renderLogoutCard() {
    return html`
      <div class="logout-section">
        <div class="card logout-card">
          <div class="logout-content">
            <div class="logout-text">
              <div class="logout-title">Cerrar sesión</div>
              <div class="logout-description">
                Cierra tu sesión de forma segura en este dispositivo
              </div>
            </div>
            <ui-button variant="danger" @click=${this.handleLogout}>
              Cerrar sesión
            </ui-button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'profile-view': ProfileView;
  }
}

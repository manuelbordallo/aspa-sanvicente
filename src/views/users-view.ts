import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { userService, authService } from '../services/index.js';
import type { User, UserRole, UserFormData } from '../types/index.js';

// Import UI components
import '../components/ui/ui-card.js';
import '../components/ui/ui-button.js';
import '../components/ui/ui-modal.js';
import '../components/ui/ui-input.js';
import '../components/ui/ui-select.js';
import type { SelectOption } from '../components/ui/ui-select.js';

@customElement('users-view')
export class UsersView extends LitElement {
  @state() private users: User[] = [];
  @state() private loading: boolean = false;
  @state() private isAdmin: boolean = false;
  @state() private error: string | null = null;
  @state() private selectedUser: User | null = null;
  @state() private isEditModalOpen: boolean = false;
  @state() private editFormData: Partial<UserFormData> = {};
  @state() private saving: boolean = false;
  @state() private notification: {
    message: string;
    type: 'success' | 'error';
  } | null = null;

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
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

    .access-denied {
      background: white;
      border-radius: 0.5rem;
      padding: 3rem 2rem;
      text-align: center;
      border: 2px solid #fee2e2;
      background-color: #fef2f2;
    }

    .access-denied-icon {
      width: 4rem;
      height: 4rem;
      margin: 0 auto 1rem;
      color: #ef4444;
    }

    .access-denied-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #991b1b;
      margin-bottom: 0.5rem;
    }

    .access-denied-message {
      color: #dc2626;
    }

    .notification {
      padding: 0.75rem 1rem;
      border-radius: 0.375rem;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }

    .notification--success {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #a7f3d0;
    }

    .notification--error {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
    }

    .loading-spinner {
      width: 3rem;
      height: 3rem;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .error-container {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      border-radius: 0.5rem;
      padding: 1rem;
      color: #991b1b;
    }

    .users-grid {
      display: grid;
      gap: 1rem;
    }

    .user-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1.25rem;
      transition: all 0.2s ease-in-out;
    }

    .user-card:hover {
      border-color: #d1d5db;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .user-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin-bottom: 0.25rem;
    }

    .user-email {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .user-role-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .user-role-badge--admin {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .user-role-badge--user {
      background-color: #f3f4f6;
      color: #374151;
    }

    .user-card-body {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .user-detail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
    }

    .user-detail-icon {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }

    .user-card-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      padding-top: 0.75rem;
      border-top: 1px solid #e5e7eb;
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      background: white;
      border-radius: 0.5rem;
      border: 2px dashed #e5e7eb;
    }

    .empty-state-icon {
      width: 4rem;
      height: 4rem;
      margin: 0 auto 1rem;
      color: #9ca3af;
    }

    .empty-state-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .empty-state-message {
      color: #6b7280;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .view-title {
        color: #f9fafb;
      }

      .view-description {
        color: #9ca3af;
      }

      .user-card {
        background-color: #1f2937;
        border-color: #374151;
      }

      .user-card:hover {
        border-color: #4b5563;
      }

      .user-name {
        color: #f9fafb;
      }

      .user-email {
        color: #9ca3af;
      }

      .user-detail {
        color: #9ca3af;
      }

      .user-card-actions {
        border-top-color: #374151;
      }

      .empty-state {
        background-color: #1f2937;
        border-color: #374151;
      }

      .empty-state-title {
        color: #f3f4f6;
      }

      .empty-state-message {
        color: #9ca3af;
      }
    }

    /* Responsive */
    @media (min-width: 768px) {
      .users-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .users-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.isAdmin = authService.isAdmin();

    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  private async loadUsers() {
    try {
      this.loading = true;
      this.error = null;

      const response = await userService.getUsers();
      this.users = response.data;
    } catch (error) {
      console.error('Error loading users:', error);
      this.error =
        error instanceof Error ? error.message : 'Error al cargar los usuarios';
    } finally {
      this.loading = false;
    }
  }

  private openEditModal(user: User) {
    this.selectedUser = user;
    this.editFormData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    };
    this.isEditModalOpen = true;
  }

  private closeEditModal() {
    this.isEditModalOpen = false;
    this.selectedUser = null;
    this.editFormData = {};
  }

  private handleFormInput(event: CustomEvent) {
    const { name, value } = event.detail;
    this.editFormData = {
      ...this.editFormData,
      [name]: value,
    };
  }

  private async saveUser() {
    if (!this.selectedUser) return;

    try {
      this.saving = true;

      await userService.updateUser(this.selectedUser.id, this.editFormData);

      this.showNotification('Usuario actualizado correctamente', 'success');
      this.closeEditModal();
      await this.loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      this.showNotification(
        error instanceof Error
          ? error.message
          : 'Error al actualizar el usuario',
        'error'
      );
    } finally {
      this.saving = false;
    }
  }

  private async changeUserRole(user: User, newRole: UserRole) {
    if (user.role === newRole) return;

    try {
      await userService.changeUserRole(user.id, newRole);
      this.showNotification(
        'Rol de usuario actualizado correctamente',
        'success'
      );
      await this.loadUsers();
    } catch (error) {
      console.error('Error changing user role:', error);
      this.showNotification(
        error instanceof Error
          ? error.message
          : 'Error al cambiar el rol del usuario',
        'error'
      );
    }
  }

  private showNotification(message: string, type: 'success' | 'error') {
    this.notification = { message, type };

    setTimeout(() => {
      this.notification = null;
    }, 3000);
  }

  private getRoleOptions(): SelectOption[] {
    return [
      { value: 'user', label: 'Usuario' },
      { value: 'admin', label: 'Administrador' },
    ];
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  private renderAccessDenied() {
    return html`
      <div class="access-denied">
        <svg
          class="access-denied-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <h2 class="access-denied-title">Acceso Denegado</h2>
        <p class="access-denied-message">
          Solo los administradores pueden acceder a la gestión de usuarios.
        </p>
      </div>
    `;
  }

  private renderLoading() {
    return html`
      <div class="loading-container">
        <div class="loading-spinner"></div>
      </div>
    `;
  }

  private renderError() {
    return html`
      <div class="error-container">
        <strong>Error:</strong> ${this.error}
        <ui-button
          variant="secondary"
          size="sm"
          @ui-click=${this.loadUsers}
          style="margin-left: 1rem;"
        >
          Reintentar
        </ui-button>
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <svg
          class="empty-state-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 class="empty-state-title">No hay usuarios</h3>
        <p class="empty-state-message">
          No se encontraron usuarios en el sistema.
        </p>
      </div>
    `;
  }

  private renderUserCard(user: User) {
    const currentUser = authService.getCurrentUser();
    const isCurrentUser = currentUser?.id === user.id;

    return html`
      <div class="user-card">
        <div class="user-card-header">
          <div class="user-info">
            <div class="user-name">
              ${user.firstName} ${user.lastName} ${isCurrentUser ? '(Tú)' : ''}
            </div>
            <div class="user-email">${user.email}</div>
          </div>
          <span class="user-role-badge user-role-badge--${user.role}">
            ${user.role === 'admin' ? 'Administrador' : 'Usuario'}
          </span>
        </div>

        <div class="user-card-body">
          <div class="user-detail">
            <svg
              class="user-detail-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>Registrado: ${this.formatDate(user.createdAt)}</span>
          </div>
        </div>

        <div class="user-card-actions">
          <ui-button
            variant="secondary"
            size="sm"
            @ui-click=${() => this.openEditModal(user)}
          >
            Editar
          </ui-button>
          ${user.role === 'user'
            ? html`
                <ui-button
                  variant="primary"
                  size="sm"
                  @ui-click=${() => this.changeUserRole(user, 'admin')}
                >
                  Hacer Admin
                </ui-button>
              `
            : !isCurrentUser
              ? html`
                  <ui-button
                    variant="secondary"
                    size="sm"
                    @ui-click=${() => this.changeUserRole(user, 'user')}
                  >
                    Quitar Admin
                  </ui-button>
                `
              : ''}
        </div>
      </div>
    `;
  }

  private renderEditModal() {
    if (!this.selectedUser) return '';

    return html`
      <ui-modal
        ?isOpen=${this.isEditModalOpen}
        title="Editar Usuario"
        size="md"
        @ui-modal-close=${this.closeEditModal}
      >
        <div class="edit-form">
          <div class="form-row">
            <ui-input
              name="firstName"
              label="Nombre"
              .value=${this.editFormData.firstName || ''}
              required
              ?disabled=${this.saving}
              @ui-input=${this.handleFormInput}
            ></ui-input>

            <ui-input
              name="lastName"
              label="Apellidos"
              .value=${this.editFormData.lastName || ''}
              required
              ?disabled=${this.saving}
              @ui-input=${this.handleFormInput}
            ></ui-input>
          </div>

          <ui-input
            name="email"
            label="Correo electrónico"
            type="email"
            .value=${this.editFormData.email || ''}
            required
            ?disabled=${this.saving}
            @ui-input=${this.handleFormInput}
          ></ui-input>

          <ui-select
            name="role"
            label="Rol"
            .value=${this.editFormData.role || 'user'}
            .options=${this.getRoleOptions()}
            required
            ?disabled=${this.saving}
            @ui-change=${this.handleFormInput}
          ></ui-select>
        </div>

        <div slot="footer" class="modal-actions">
          <ui-button
            variant="secondary"
            ?disabled=${this.saving}
            @ui-click=${this.closeEditModal}
          >
            Cancelar
          </ui-button>
          <ui-button
            variant="primary"
            ?loading=${this.saving}
            @ui-click=${this.saveUser}
          >
            Guardar Cambios
          </ui-button>
        </div>
      </ui-modal>
    `;
  }

  render() {
    // Check admin access first
    if (!this.isAdmin) {
      return html`
        <div class="view-header">
          <h1 class="view-title">Usuarios</h1>
          <p class="view-description">
            Gestiona todos los usuarios del sistema
          </p>
        </div>
        ${this.renderAccessDenied()}
      `;
    }

    return html`
      <div class="view-header">
        <h1 class="view-title">Usuarios</h1>
        <p class="view-description">Gestiona todos los usuarios del sistema</p>
      </div>

      ${this.notification
        ? html`
            <div class="notification notification--${this.notification.type}">
              ${this.notification.message}
            </div>
          `
        : ''}
      ${this.loading
        ? this.renderLoading()
        : this.error
          ? this.renderError()
          : this.users.length === 0
            ? this.renderEmptyState()
            : html`
                <div class="users-grid">
                  ${this.users.map((user) => this.renderUserCard(user))}
                </div>
              `}
      ${this.renderEditModal()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'users-view': UsersView;
  }
}

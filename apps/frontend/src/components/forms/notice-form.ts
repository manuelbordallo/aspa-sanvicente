import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { NoticeFormData, FormError, User } from '../../types/index.js';
import '../ui/ui-input.js';
import '../ui/ui-button.js';

@customElement('notice-form')
export class NoticeForm extends LitElement {
  @property({ type: Boolean }) loading = false;
  @property({ type: Array }) availableUsers: User[] = [];

  @state() private _formData: NoticeFormData = {
    content: '',
    recipients: [],
  };

  @state() private _errors: FormError[] = [];
  @state() private _touched: Record<string, boolean> = {};
  @state() private _selectedUsers: User[] = [];
  @state() private _userSearchQuery = '';

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

    .textarea {
      width: 100%;
      min-height: 8rem;
      padding: 0.625rem 0.875rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-family: inherit;
      line-height: 1.5;
      resize: vertical;
      transition: all 0.2s ease-in-out;
      outline: none;
    }

    .textarea:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .textarea--error {
      border-color: #ef4444;
    }

    .form-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .form-label--required::after {
      content: ' *';
      color: #ef4444;
    }

    .recipients-section {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .recipients-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .recipients-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .select-all-button {
      background: none;
      border: none;
      color: #3b82f6;
      font-size: 0.75rem;
      cursor: pointer;
      text-decoration: underline;
    }

    .select-all-button:hover {
      color: #2563eb;
    }

    .user-search {
      margin-bottom: 1rem;
    }

    .users-list {
      max-height: 12rem;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
    }

    .user-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background-color 0.2s ease-in-out;
    }

    .user-item:last-child {
      border-bottom: none;
    }

    .user-item:hover {
      background-color: #f9fafb;
    }

    .user-item--selected {
      background-color: #dbeafe;
    }

    .user-checkbox {
      width: 1rem;
      height: 1rem;
      accent-color: #3b82f6;
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #111827;
    }

    .user-email {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .user-role {
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 0.25rem;
      background-color: #f3f4f6;
      color: #374151;
    }

    .user-role--admin {
      background-color: #dbeafe;
      color: #1d4ed8;
    }

    .selected-users {
      margin-top: 1rem;
    }

    .selected-users-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .selected-users-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .selected-user-tag {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.75rem;
      background-color: #dbeafe;
      color: #1d4ed8;
      border-radius: 1rem;
      font-size: 0.75rem;
    }

    .remove-user-button {
      background: none;
      border: none;
      color: #1d4ed8;
      cursor: pointer;
      padding: 0;
      width: 1rem;
      height: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .remove-user-button:hover {
      color: #1e40af;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .error-message {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #ef4444;
    }

    .helper-text {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
      font-size: 0.875rem;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .textarea {
        background-color: #374151;
        border-color: #4b5563;
        color: #f9fafb;
      }

      .form-label,
      .recipients-title,
      .selected-users-title {
        color: #d1d5db;
      }

      .recipients-section {
        border-color: #374151;
      }

      .users-list {
        border-color: #374151;
      }

      .user-item {
        border-bottom-color: #374151;
      }

      .user-item:hover {
        background-color: #374151;
      }

      .user-name {
        color: #f9fafb;
      }

      .user-email {
        color: #9ca3af;
      }

      .user-role {
        background-color: #374151;
        color: #d1d5db;
      }

      .form-actions {
        border-top-color: #374151;
      }

      .helper-text,
      .empty-state {
        color: #9ca3af;
      }
    }
  `;

  render() {
    return html`
      <form class="form" @submit=${this._handleSubmit} novalidate>
        <div class="form-group">
          <label class="form-label form-label--required">Mensaje</label>
          <textarea
            class="textarea ${this._getFieldError('content')
              ? 'textarea--error'
              : ''}"
            name="content"
            placeholder="Escribe el mensaje del aviso..."
            .value=${this._formData.content}
            @input=${this._handleContentInput}
            @blur=${() => this._markFieldAsTouched('content')}
          ></textarea>
          ${this._getFieldError('content')
            ? html`<div class="error-message">
                ${this._getFieldError('content')}
              </div>`
            : html`<div class="helper-text">
                Mensaje que recibirán los usuarios seleccionados
              </div>`}
        </div>

        <div class="form-group">
          <div class="recipients-section">
            <div class="recipients-header">
              <span class="recipients-title">Destinatarios *</span>
              <button
                type="button"
                class="select-all-button"
                @click=${this._toggleSelectAll}
              >
                ${this._selectedUsers.length === this.availableUsers.length
                  ? 'Deseleccionar todos'
                  : 'Seleccionar todos'}
              </button>
            </div>

            <div class="user-search">
              <ui-input
                type="search"
                placeholder="Buscar usuarios..."
                .value=${this._userSearchQuery}
                @ui-input=${this._handleUserSearch}
              ></ui-input>
            </div>

            ${this._renderUsersList()}
            ${this._selectedUsers.length > 0 ? this._renderSelectedUsers() : ''}
          </div>
          ${this._getFieldError('recipients')
            ? html`<div class="error-message">
                ${this._getFieldError('recipients')}
              </div>`
            : ''}
        </div>

        <div class="form-actions">
          <ui-button
            type="button"
            variant="secondary"
            @ui-click=${this._handleCancel}
          >
            Cancelar
          </ui-button>

          <ui-button
            type="submit"
            variant="primary"
            .loading=${this.loading}
            .disabled=${!this._isFormValid()}
          >
            ${this.loading ? 'Enviando...' : 'Enviar aviso'}
          </ui-button>
        </div>
      </form>
    `;
  }

  private _renderUsersList() {
    const filteredUsers = this._getFilteredUsers();

    if (filteredUsers.length === 0) {
      return html`
        <div class="empty-state">
          ${this._userSearchQuery
            ? 'No se encontraron usuarios'
            : 'No hay usuarios disponibles'}
        </div>
      `;
    }

    return html`
      <div class="users-list">
        ${filteredUsers.map((user) => this._renderUserItem(user))}
      </div>
    `;
  }

  private _renderUserItem(user: User) {
    const isSelected = this._selectedUsers.some(
      (selected) => selected.id === user.id
    );

    return html`
      <div
        class="user-item ${isSelected ? 'user-item--selected' : ''}"
        @click=${() => this._toggleUserSelection(user)}
      >
        <input
          type="checkbox"
          class="user-checkbox"
          .checked=${isSelected}
          @change=${() => this._toggleUserSelection(user)}
        />
        <div class="user-info">
          <div class="user-name">${user.firstName} ${user.lastName}</div>
          <div class="user-email">${user.email}</div>
        </div>
        <span
          class="user-role ${user.role === 'admin' ? 'user-role--admin' : ''}"
        >
          ${user.role === 'admin' ? 'Administrador' : 'Usuario'}
        </span>
      </div>
    `;
  }

  private _renderSelectedUsers() {
    return html`
      <div class="selected-users">
        <div class="selected-users-title">
          Usuarios seleccionados (${this._selectedUsers.length})
        </div>
        <div class="selected-users-list">
          ${this._selectedUsers.map(
            (user) => html`
              <div class="selected-user-tag">
                ${user.firstName} ${user.lastName}
                <button
                  type="button"
                  class="remove-user-button"
                  @click=${() => this._removeUser(user)}
                  title="Remover usuario"
                >
                  ×
                </button>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _getFilteredUsers(): User[] {
    if (!this._userSearchQuery) {
      return this.availableUsers;
    }

    const query = this._userSearchQuery.toLowerCase();
    return this.availableUsers.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }

  private _handleContentInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this._formData = {
      ...this._formData,
      content: target.value,
    };
    this._validateField('content');
  }

  private _handleUserSearch(event: CustomEvent) {
    this._userSearchQuery = event.detail.value;
  }

  private _toggleUserSelection(user: User) {
    const isSelected = this._selectedUsers.some(
      (selected) => selected.id === user.id
    );

    if (isSelected) {
      this._removeUser(user);
    } else {
      this._selectedUsers = [...this._selectedUsers, user];
      this._updateRecipientsFormData();
    }
  }

  private _removeUser(user: User) {
    this._selectedUsers = this._selectedUsers.filter(
      (selected) => selected.id !== user.id
    );
    this._updateRecipientsFormData();
  }

  private _toggleSelectAll() {
    if (this._selectedUsers.length === this.availableUsers.length) {
      this._selectedUsers = [];
    } else {
      this._selectedUsers = [...this.availableUsers];
    }
    this._updateRecipientsFormData();
  }

  private _updateRecipientsFormData() {
    this._formData = {
      ...this._formData,
      recipients: this._selectedUsers.map((user) => user.id),
    };
    this._validateField('recipients');
  }

  private _handleSubmit(event: Event) {
    event.preventDefault();

    if (this.loading) return;

    // Mark all fields as touched
    this._touched = {
      content: true,
      recipients: true,
    };

    // Validate all fields
    this._validateAllFields();

    if (this._isFormValid()) {
      this.dispatchEvent(
        new CustomEvent('notice-submit', {
          bubbles: true,
          composed: true,
          detail: {
            formData: { ...this._formData },
            selectedUsers: [...this._selectedUsers],
          },
        })
      );
    }
  }

  private _handleCancel() {
    this.dispatchEvent(
      new CustomEvent('notice-cancel', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _validateField(fieldName: keyof NoticeFormData) {
    const errors: FormError[] = [];

    switch (fieldName) {
      case 'content':
        if (!this._formData.content.trim()) {
          errors.push({
            field: 'content',
            message: 'El mensaje es requerido',
          });
        }
        break;

      case 'recipients':
        if (this._formData.recipients.length === 0) {
          errors.push({
            field: 'recipients',
            message: 'Debes seleccionar al menos un destinatario',
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
    this._validateField('content');
    this._validateField('recipients');
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
      this._formData.content.trim() &&
      this._formData.recipients.length > 0 &&
      this._errors.length === 0
    );
  }

  reset() {
    this._formData = {
      content: '',
      recipients: [],
    };
    this._errors = [];
    this._touched = {};
    this._selectedUsers = [];
    this._userSearchQuery = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'notice-form': NoticeForm;
  }
}

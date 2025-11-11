import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { settingsService, authService } from '../services/index.js';
import { notificationService } from '../services/notification-service.js';
import type { AppSettings, Theme } from '../types/index.js';
import type { LanguageOption } from '../services/settings-service.js';

// Import UI components
import '../components/ui/ui-card.js';
import '../components/ui/ui-select.js';
import '../components/ui/ui-input.js';
import '../components/ui/ui-button.js';
import '../components/ui/ui-confirm.js';

@customElement('settings-view')
export class SettingsView extends LitElement {
  @state() private settings: AppSettings = settingsService.getSettings();
  @state() private isAdmin: boolean = false;
  @state() private saving: boolean = false;
  @state() private notification: {
    message: string;
    type: 'success' | 'error';
  } | null = null;
  @state() private courseEditValue: string = '';
  @state() private isEditingCourse: boolean = false;

  static styles = css`
    :host {
      display: block;
      padding: 1.5rem;
      max-width: 800px;
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

    .settings-grid {
      display: grid;
      gap: 1.5rem;
    }

    .setting-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .setting-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .setting-label {
      font-weight: 500;
      color: #374151;
      font-size: 0.875rem;
    }

    .setting-description {
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .admin-only {
      opacity: 0.6;
      pointer-events: none;
    }

    .admin-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      background-color: #fef3c7;
      color: #92400e;
      padding: 0.125rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .course-display {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.875rem;
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #374151;
    }

    .course-value {
      flex: 1;
      font-weight: 500;
    }

    .course-edit-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
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

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .view-title {
        color: #f9fafb;
      }

      .view-description {
        color: #9ca3af;
      }

      .setting-label {
        color: #f3f4f6;
      }

      .setting-description {
        color: #9ca3af;
      }

      .course-display {
        background-color: #374151;
        border-color: #4b5563;
        color: #f3f4f6;
      }

      .actions {
        border-top-color: #374151;
      }

      .admin-badge {
        background-color: #451a03;
        color: #fbbf24;
      }
    }

    /* Theme classes for explicit theming */
    :host([theme='dark']) .view-title {
      color: #f9fafb;
    }

    :host([theme='dark']) .view-description {
      color: #9ca3af;
    }

    :host([theme='dark']) .setting-label {
      color: #f3f4f6;
    }

    :host([theme='dark']) .setting-description {
      color: #9ca3af;
    }

    :host([theme='dark']) .course-display {
      background-color: #374151;
      border-color: #4b5563;
      color: #f3f4f6;
    }

    :host([theme='dark']) .actions {
      border-top-color: #374151;
    }

    :host([theme='dark']) .admin-badge {
      background-color: #451a03;
      color: #fbbf24;
    }

    @media (max-width: 768px) {
      :host {
        padding: 1rem;
      }

      .view-title {
        font-size: 1.5rem;
      }

      .course-edit-actions {
        flex-direction: column;
      }

      .course-edit-actions ui-button {
        width: 100%;
      }

      .actions {
        flex-direction: column;
      }

      .actions ui-button {
        width: 100%;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.isAdmin = authService.isAdmin();
    this.courseEditValue = this.settings.currentCourse;

    // Listen for settings changes
    settingsService.addSettingsListener(this.handleSettingsChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    settingsService.removeSettingsListener(this.handleSettingsChange);
  }

  private handleSettingsChange = (newSettings: AppSettings) => {
    this.settings = newSettings;
    if (!this.isEditingCourse) {
      this.courseEditValue = newSettings.currentCourse;
    }
  };

  private handleThemeChange(event: CustomEvent) {
    const theme = event.detail.value as Theme;
    this.updateSetting('theme', theme);
  }

  private handleLanguageChange(event: CustomEvent) {
    const language = event.detail.value;
    this.updateSetting('language', language);
  }

  private handleCourseInput(event: CustomEvent) {
    this.courseEditValue = event.detail.value;
  }

  private startEditingCourse() {
    this.isEditingCourse = true;
    this.courseEditValue = this.settings.currentCourse;
  }

  private cancelEditingCourse() {
    this.isEditingCourse = false;
    this.courseEditValue = this.settings.currentCourse;
  }

  private async saveCourse() {
    if (this.courseEditValue.trim()) {
      await this.updateSetting('currentCourse', this.courseEditValue.trim());
      this.isEditingCourse = false;
    }
  }

  private async updateSetting(key: keyof AppSettings, value: any) {
    try {
      this.saving = true;
      settingsService.updateSettings({ [key]: value });
      this.showNotification('Configuración guardada correctamente', 'success');
    } catch (error) {
      console.error('Error updating setting:', error);
      this.showNotification('Error al guardar la configuración', 'error');
    } finally {
      this.saving = false;
    }
  }

  private async resetSettings() {
    // Create confirmation dialog
    const confirm = document.createElement('ui-confirm');
    document.body.appendChild(confirm);

    confirm.open({
      title: 'Restablecer configuración',
      message:
        '¿Estás seguro de que deseas restablecer toda la configuración a los valores por defecto?',
      confirmText: 'Restablecer',
      cancelText: 'Cancelar',
      type: 'warning',
      onConfirm: async () => {
        try {
          this.saving = true;
          settingsService.resetSettings();
          this.showNotification(
            'Configuración restablecida a valores por defecto',
            'success'
          );
        } catch (error) {
          console.error('Error resetting settings:', error);
          this.showNotification(
            'Error al restablecer la configuración',
            'error'
          );
        } finally {
          this.saving = false;
          document.body.removeChild(confirm);
        }
      },
      onCancel: () => {
        document.body.removeChild(confirm);
      },
    });
  }

  private showNotification(message: string, type: 'success' | 'error') {
    if (type === 'success') {
      notificationService.success('Configuración', message);
    } else {
      notificationService.error('Error', message);
    }
  }

  private getThemeOptions() {
    return settingsService.getThemeOptions();
  }

  private getLanguageOptions(): LanguageOption[] {
    return settingsService.getLanguageOptions();
  }

  render() {
    return html`
      <div class="view-header">
        <h1 class="view-title">Configuración</h1>
        <p class="view-description">Personaliza tu experiencia de uso</p>
      </div>

      ${this.notification
        ? html`
            <div class="notification notification--${this.notification.type}">
              ${this.notification.message}
            </div>
          `
        : ''}

      <div class="settings-grid">
        <!-- Appearance Settings -->
        <ui-card title="Apariencia" elevated>
          <div class="setting-section">
            <div class="setting-item">
              <label class="setting-label">Tema visual</label>
              <ui-select
                name="theme"
                .value=${this.settings.theme}
                .options=${this.getThemeOptions()}
                ?disabled=${this.saving}
                @ui-change=${this.handleThemeChange}
              ></ui-select>
              <div class="setting-description">
                Elige entre tema claro, oscuro o automático según tu sistema
              </div>
            </div>
          </div>
        </ui-card>

        <!-- Language Settings -->
        <ui-card title="Idioma" elevated>
          <div class="setting-section">
            <div class="setting-item">
              <label class="setting-label">Idioma de la interfaz</label>
              <ui-select
                name="language"
                .value=${this.settings.language}
                .options=${this.getLanguageOptions()}
                ?disabled=${this.saving}
                @ui-change=${this.handleLanguageChange}
              ></ui-select>
              <div class="setting-description">
                Selecciona el idioma para la interfaz de usuario
              </div>
            </div>
          </div>
        </ui-card>

        <!-- Course Settings -->
        <ui-card title="Curso Académico" elevated>
          <div class="setting-section">
            <div class="setting-item">
              <label class="setting-label">
                Curso actual
                ${!this.isAdmin
                  ? html`<span class="admin-badge">Solo administradores</span>`
                  : ''}
              </label>

              ${this.isEditingCourse && this.isAdmin
                ? html`
                    <ui-input
                      name="currentCourse"
                      .value=${this.courseEditValue}
                      placeholder="Ej: 2025-2026"
                      ?disabled=${this.saving}
                      @ui-input=${this.handleCourseInput}
                    ></ui-input>
                    <div class="course-edit-actions">
                      <ui-button
                        variant="primary"
                        size="sm"
                        ?loading=${this.saving}
                        @ui-click=${this.saveCourse}
                      >
                        Guardar
                      </ui-button>
                      <ui-button
                        variant="secondary"
                        size="sm"
                        ?disabled=${this.saving}
                        @ui-click=${this.cancelEditingCourse}
                      >
                        Cancelar
                      </ui-button>
                    </div>
                  `
                : html`
                    <div
                      class="course-display ${!this.isAdmin
                        ? 'admin-only'
                        : ''}"
                    >
                      <span class="course-value"
                        >${this.settings.currentCourse}</span
                      >
                      ${this.isAdmin
                        ? html`
                            <ui-button
                              variant="ghost"
                              size="sm"
                              ?disabled=${this.saving}
                              @ui-click=${this.startEditingCourse}
                            >
                              Editar
                            </ui-button>
                          `
                        : ''}
                    </div>
                  `}

              <div class="setting-description">
                Período académico actual (ej: 2025-2026)
                ${!this.isAdmin
                  ? ' - Solo los administradores pueden modificar este valor'
                  : ''}
              </div>
            </div>
          </div>
        </ui-card>
      </div>

      <div class="actions">
        <ui-button
          variant="secondary"
          ?loading=${this.saving}
          @ui-click=${this.resetSettings}
        >
          Restablecer valores por defecto
        </ui-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-view': SettingsView;
  }
}

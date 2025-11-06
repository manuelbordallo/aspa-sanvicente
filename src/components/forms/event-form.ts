import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type {
  EventFormData,
  FormError,
  CalendarEvent,
} from '../../types/index.js';
import '../ui/ui-input.js';
import '../ui/ui-button.js';

@customElement('event-form')
export class EventForm extends LitElement {
  @property({ type: Boolean }) loading = false;
  @property() mode: 'create' | 'edit' = 'create';
  @property({ type: Object }) initialData?: CalendarEvent;

  @state() private _formData: EventFormData = {
    title: '',
    description: '',
    date: new Date(),
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

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
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

    .date-time-inputs {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1rem;
      align-items: end;
    }

    .time-input {
      width: 8rem;
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

    .date-preview {
      margin-top: 0.5rem;
      padding: 0.75rem;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: #475569;
    }

    .date-preview-label {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .date-preview-value {
      font-family: monospace;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .textarea {
        background-color: #374151;
        border-color: #4b5563;
        color: #f9fafb;
      }

      .form-label {
        color: #d1d5db;
      }

      .form-actions {
        border-top-color: #374151;
      }

      .helper-text {
        color: #9ca3af;
      }

      .date-preview {
        background-color: #1f2937;
        border-color: #374151;
        color: #d1d5db;
      }
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .date-time-inputs {
        grid-template-columns: 1fr;
      }

      .time-input {
        width: 100%;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.initialData) {
      this._formData = {
        title: this.initialData.title,
        description: this.initialData.description,
        date: new Date(this.initialData.date),
      };
    }
  }

  render() {
    return html`
      <form class="form" @submit=${this._handleSubmit} novalidate>
        <div class="form-group">
          <ui-input
            name="title"
            label="Título del evento"
            placeholder="Nombre del evento"
            .value=${this._formData.title}
            .errorMessage=${this._getFieldError('title')}
            required
            maxlength="100"
            @ui-input=${this._handleTitleInput}
            @ui-blur=${() => this._markFieldAsTouched('title')}
          ></ui-input>
        </div>

        <div class="form-group">
          <label class="form-label form-label--required">Fecha y hora</label>
          <div class="date-time-inputs">
            <ui-input
              type="date"
              name="date"
              .value=${this._formatDateForInput(this._formData.date)}
              .errorMessage=${this._getFieldError('date')}
              required
              @ui-input=${this._handleDateInput}
              @ui-blur=${() => this._markFieldAsTouched('date')}
            ></ui-input>

            <div class="time-input">
              <ui-input
                type="time"
                name="time"
                .value=${this._formatTimeForInput(this._formData.date)}
                @ui-input=${this._handleTimeInput}
              ></ui-input>
            </div>
          </div>

          ${this._getFieldError('date')
            ? html`<div class="error-message">
                ${this._getFieldError('date')}
              </div>`
            : ''}

          <div class="date-preview">
            <div class="date-preview-label">Fecha y hora del evento:</div>
            <div class="date-preview-value">
              ${this._formatDateTimePreview(this._formData.date)}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label form-label--required">Descripción</label>
          <textarea
            class="textarea ${this._getFieldError('description')
              ? 'textarea--error'
              : ''}"
            name="description"
            placeholder="Descripción detallada del evento"
            .value=${this._formData.description}
            @input=${this._handleDescriptionInput}
            @blur=${() => this._markFieldAsTouched('description')}
          ></textarea>
          ${this._getFieldError('description')
            ? html`<div class="error-message">
                ${this._getFieldError('description')}
              </div>`
            : html`<div class="helper-text">
                Proporciona detalles sobre el evento, ubicación, requisitos,
                etc.
              </div>`}
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
            ${this.loading
              ? this.mode === 'create'
                ? 'Creando...'
                : 'Guardando...'
              : this.mode === 'create'
                ? 'Crear evento'
                : 'Guardar cambios'}
          </ui-button>
        </div>
      </form>
    `;
  }

  private _handleTitleInput(event: CustomEvent) {
    this._formData = {
      ...this._formData,
      title: event.detail.value,
    };
    this._validateField('title');
  }

  private _handleDateInput(event: CustomEvent) {
    const dateValue = event.detail.value;
    if (dateValue) {
      const currentTime = this._formData.date;
      const newDate = new Date(dateValue);
      newDate.setHours(currentTime.getHours(), currentTime.getMinutes());

      this._formData = {
        ...this._formData,
        date: newDate,
      };
      this._validateField('date');
    }
  }

  private _handleTimeInput(event: CustomEvent) {
    const timeValue = event.detail.value;
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const newDate = new Date(this._formData.date);
      newDate.setHours(hours, minutes);

      this._formData = {
        ...this._formData,
        date: newDate,
      };
    }
  }

  private _handleDescriptionInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this._formData = {
      ...this._formData,
      description: target.value,
    };
    this._validateField('description');
  }

  private _handleSubmit(event: Event) {
    event.preventDefault();

    if (this.loading) return;

    // Mark all fields as touched
    this._touched = {
      title: true,
      date: true,
      description: true,
    };

    // Validate all fields
    this._validateAllFields();

    if (this._isFormValid()) {
      this.dispatchEvent(
        new CustomEvent('event-submit', {
          bubbles: true,
          composed: true,
          detail: {
            formData: { ...this._formData },
            mode: this.mode,
          },
        })
      );
    }
  }

  private _handleCancel() {
    this.dispatchEvent(
      new CustomEvent('event-cancel', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _validateField(fieldName: keyof EventFormData) {
    const errors: FormError[] = [];

    switch (fieldName) {
      case 'title':
        if (!this._formData.title.trim()) {
          errors.push({
            field: 'title',
            message: 'El título es requerido',
          });
        } else if (this._formData.title.length > 100) {
          errors.push({
            field: 'title',
            message: 'El título no puede exceder 100 caracteres',
          });
        }
        break;

      case 'date':
        if (!this._formData.date) {
          errors.push({
            field: 'date',
            message: 'La fecha es requerida',
          });
        } else if (this._formData.date < new Date()) {
          errors.push({
            field: 'date',
            message: 'La fecha no puede ser en el pasado',
          });
        }
        break;

      case 'description':
        if (!this._formData.description.trim()) {
          errors.push({
            field: 'description',
            message: 'La descripción es requerida',
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
    this._validateField('title');
    this._validateField('date');
    this._validateField('description');
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
      this._formData.title.trim() &&
      this._formData.description.trim() &&
      this._formData.date &&
      this._formData.date >= new Date() &&
      this._errors.length === 0
    );
  }

  private _formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private _formatTimeForInput(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  private _formatDateTimePreview(date: Date): string {
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  reset() {
    this._formData = {
      title: '',
      description: '',
      date: new Date(),
    };
    this._errors = [];
    this._touched = {};
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'event-form': EventForm;
  }
}

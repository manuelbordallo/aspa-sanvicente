import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { NewsFormData, FormError, News } from '../../types/index.js';
import '../ui/ui-input.js';
import '../ui/ui-button.js';

@customElement('news-form')
export class NewsForm extends LitElement {
  @property({ type: Boolean }) loading = false;
  @property() mode: 'create' | 'edit' = 'create';
  @property({ type: Object }) initialData?: News;

  @state() private _formData: NewsFormData = {
    title: '',
    content: '',
    summary: '',
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

    .textarea--error:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .textarea--content {
      min-height: 12rem;
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

    .char-counter {
      font-size: 0.75rem;
      color: #6b7280;
      text-align: right;
      margin-top: 0.25rem;
    }

    .char-counter--warning {
      color: #f59e0b;
    }

    .char-counter--error {
      color: #ef4444;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .textarea {
        background-color: #374151;
        border-color: #4b5563;
        color: #f9fafb;
      }

      .textarea:focus {
        border-color: #60a5fa;
        box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
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

      .char-counter {
        color: #9ca3af;
      }

      .char-counter--warning {
        color: #fbbf24;
      }
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    if (this.initialData) {
      this._formData = {
        title: this.initialData.title,
        content: this.initialData.content,
        summary: this.initialData.summary,
      };
    }
  }

  render() {
    return html`
      <form class="form" @submit=${this._handleSubmit} novalidate>
        <div class="form-group">
          <ui-input
            name="title"
            label="Título"
            placeholder="Título de la noticia"
            .value=${this._formData.title}
            .errorMessage=${this._getFieldError('title')}
            required
            maxlength="100"
            @ui-input=${this._handleTitleInput}
            @ui-blur=${() => this._markFieldAsTouched('title')}
          ></ui-input>
          ${this._renderCharCounter(this._formData.title, 100)}
        </div>

        <div class="form-group">
          <label class="form-label form-label--required">Resumen</label>
          <textarea
            class="textarea ${this._getFieldError('summary')
              ? 'textarea--error'
              : ''}"
            name="summary"
            placeholder="Breve resumen de la noticia (máximo 300 caracteres)"
            .value=${this._formData.summary}
            maxlength="300"
            rows="3"
            @input=${this._handleSummaryInput}
            @blur=${() => this._markFieldAsTouched('summary')}
          ></textarea>
          ${this._getFieldError('summary')
            ? html`<div class="error-message">
                ${this._getFieldError('summary')}
              </div>`
            : html`<div class="helper-text">
                Escribe un resumen que aparecerá en el listado de noticias
              </div>`}
          ${this._renderCharCounter(this._formData.summary, 300)}
        </div>

        <div class="form-group">
          <label class="form-label form-label--required">Contenido</label>
          <textarea
            class="textarea textarea--content ${this._getFieldError('content')
              ? 'textarea--error'
              : ''}"
            name="content"
            placeholder="Contenido completo de la noticia"
            .value=${this._formData.content}
            @input=${this._handleContentInput}
            @blur=${() => this._markFieldAsTouched('content')}
          ></textarea>
          ${this._getFieldError('content')
            ? html`<div class="error-message">
                ${this._getFieldError('content')}
              </div>`
            : html`<div class="helper-text">
                Contenido completo que se mostrará al abrir la noticia
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
                ? 'Crear noticia'
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

  private _handleSummaryInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this._formData = {
      ...this._formData,
      summary: target.value,
    };
    this._validateField('summary');
  }

  private _handleContentInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this._formData = {
      ...this._formData,
      content: target.value,
    };
    this._validateField('content');
  }

  private _handleSubmit(event: Event) {
    event.preventDefault();

    if (this.loading) return;

    // Mark all fields as touched
    this._touched = {
      title: true,
      summary: true,
      content: true,
    };

    // Validate all fields
    this._validateAllFields();

    if (this._isFormValid()) {
      this.dispatchEvent(
        new CustomEvent('news-submit', {
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
      new CustomEvent('news-cancel', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _validateField(fieldName: keyof NewsFormData) {
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

      case 'summary':
        if (!this._formData.summary.trim()) {
          errors.push({
            field: 'summary',
            message: 'El resumen es requerido',
          });
        } else if (this._formData.summary.length > 300) {
          errors.push({
            field: 'summary',
            message: 'El resumen no puede exceder 300 caracteres',
          });
        }
        break;

      case 'content':
        if (!this._formData.content.trim()) {
          errors.push({
            field: 'content',
            message: 'El contenido es requerido',
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
    this._validateField('summary');
    this._validateField('content');
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
      this._formData.summary.trim() &&
      this._formData.content.trim() &&
      this._errors.length === 0
    );
  }

  private _renderCharCounter(text: string, maxLength: number) {
    const length = text.length;
    const percentage = (length / maxLength) * 100;

    let className = 'char-counter';
    if (percentage >= 90) {
      className += ' char-counter--error';
    } else if (percentage >= 75) {
      className += ' char-counter--warning';
    }

    return html` <div class=${className}>${length}/${maxLength}</div> `;
  }

  reset() {
    this._formData = {
      title: '',
      content: '',
      summary: '',
    };
    this._errors = [];
    this._touched = {};
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'news-form': NewsForm;
  }
}

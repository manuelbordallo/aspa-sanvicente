import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@customElement('ui-select')
export class UISelect extends LitElement {
  @property() name = '';
  @property() value = '';
  @property() placeholder = 'Seleccionar...';
  @property() label = '';
  @property() helperText = '';
  @property() errorMessage = '';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;
  @property() size: 'sm' | 'md' | 'lg' = 'md';
  @property({ type: Array }) options: SelectOption[] = [];

  static styles = css`
    :host {
      display: block;
    }

    .select-wrapper {
      position: relative;
    }

    .select-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .select-label--required::after {
      content: ' *';
      color: #ef4444;
    }

    .select {
      width: 100%;
      border-radius: 0.375rem;
      border: 1px solid #d1d5db;
      background-color: white;
      font-size: 0.875rem;
      transition: all 0.2s ease-in-out;
      outline: none;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem;
    }

    .select:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .select:disabled {
      background-color: #f9fafb;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .select--error {
      border-color: #ef4444;
    }

    .select--error:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .select--sm {
      padding: 0.5rem 2.5rem 0.5rem 0.75rem;
    }

    .select--md {
      padding: 0.625rem 2.5rem 0.625rem 0.875rem;
    }

    .select--lg {
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      font-size: 1rem;
    }

    .helper-text {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #6b7280;
    }

    .error-message {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #ef4444;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .select-label {
        color: #f3f4f6;
      }

      .select {
        background-color: #374151;
        border-color: #4b5563;
        color: #f3f4f6;
      }

      .select:disabled {
        background-color: #1f2937;
        color: #6b7280;
      }

      .helper-text {
        color: #9ca3af;
      }
    }

    /* Theme classes for explicit theming */
    :host([theme='dark']) .select-label {
      color: #f3f4f6;
    }

    :host([theme='dark']) .select {
      background-color: #374151;
      border-color: #4b5563;
      color: #f3f4f6;
    }

    :host([theme='dark']) .select:disabled {
      background-color: #1f2937;
      color: #6b7280;
    }

    :host([theme='dark']) .helper-text {
      color: #9ca3af;
    }
  `;

  render() {
    const selectClasses = [
      'select',
      `select--${this.size}`,
      this.errorMessage ? 'select--error' : '',
    ].join(' ');

    return html`
      <div class="select-wrapper">
        ${this.label
          ? html`
              <label
                class="select-label ${this.required
                  ? 'select-label--required'
                  : ''}"
                for=${this.name}
              >
                ${this.label}
              </label>
            `
          : ''}

        <select
          class=${selectClasses}
          name=${this.name}
          .value=${this.value}
          ?required=${this.required}
          ?disabled=${this.disabled}
          @change=${this._handleChange}
          @focus=${this._handleFocus}
          @blur=${this._handleBlur}
        >
          ${this.placeholder
            ? html`
                <option value="" disabled ?selected=${!this.value}>
                  ${this.placeholder}
                </option>
              `
            : ''}
          ${this.options.map(
            (option) => html`
              <option
                value=${option.value}
                ?selected=${option.value === this.value}
                ?disabled=${option.disabled}
              >
                ${option.label}
              </option>
            `
          )}
        </select>

        ${this.errorMessage
          ? html`<div class="error-message">${this.errorMessage}</div>`
          : this.helperText
            ? html`<div class="helper-text">${this.helperText}</div>`
            : ''}
      </div>
    `;
  }

  private _handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.value = target.value;

    this.dispatchEvent(
      new CustomEvent('ui-change', {
        bubbles: true,
        composed: true,
        detail: { value: this.value, name: this.name },
      })
    );
  }

  private _handleFocus() {
    // Focus handling can be added here if needed
  }

  private _handleBlur() {
    // Blur handling can be added here if needed
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-select': UISelect;
  }
}

import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('ui-input')
export class UIInput extends LitElement {
  @property() type:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'search' = 'text';
  @property() name = '';
  @property() value = '';
  @property() placeholder = '';
  @property() label = '';
  @property() helperText = '';
  @property() errorMessage = '';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readonly = false;
  @property() size: 'sm' | 'md' | 'lg' = 'md';

  static styles = css`
    :host {
      display: block;
    }

    .input-wrapper {
      position: relative;
    }

    .input-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
    }

    .input-label--required::after {
      content: ' *';
      color: #ef4444;
    }

    .input {
      width: 100%;
      border-radius: 0.375rem;
      border: 1px solid #d1d5db;
      background-color: white;
      font-size: 0.875rem;
      transition: all 0.2s ease-in-out;
      outline: none;
    }

    .input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .input:disabled {
      background-color: #f9fafb;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .input--error {
      border-color: #ef4444;
    }

    .input--error:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .input--sm {
      padding: 0.5rem 0.75rem;
    }

    .input--md {
      padding: 0.625rem 0.875rem;
    }

    .input--lg {
      padding: 0.75rem 1rem;
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
  `;

  render() {
    const inputClasses = [
      'input',
      `input--${this.size}`,
      this.errorMessage ? 'input--error' : '',
    ].join(' ');

    return html`
      <div class="input-wrapper">
        ${this.label
          ? html`
              <label
                class="input-label ${this.required
                  ? 'input-label--required'
                  : ''}"
                for=${this.name}
              >
                ${this.label}
              </label>
            `
          : ''}

        <input
          class=${inputClasses}
          type=${this.type}
          name=${this.name}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          @input=${this._handleInput}
          @focus=${this._handleFocus}
          @blur=${this._handleBlur}
        />

        ${this.errorMessage
          ? html`<div class="error-message">${this.errorMessage}</div>`
          : this.helperText
            ? html`<div class="helper-text">${this.helperText}</div>`
            : ''}
      </div>
    `;
  }

  private _handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.value = target.value;

    this.dispatchEvent(
      new CustomEvent('ui-input', {
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
    'ui-input': UIInput;
  }
}

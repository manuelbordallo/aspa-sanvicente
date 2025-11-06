import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('school-app')
export class SchoolApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }
  `;

  @state() private initialized = false;

  connectedCallback() {
    super.connectedCallback();
    this.initialized = true;
  }

  render() {
    if (!this.initialized) {
      return html`
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-lg">Cargando...</div>
        </div>
      `;
    }

    return html`
      <div class="min-h-screen bg-gray-50">
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
              <h1 class="text-2xl font-bold text-gray-900">Gestión Escolar</h1>
            </div>
          </div>
        </header>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="card p-6">
            <h2 class="text-xl font-semibold mb-4">Bienvenido</h2>
            <p class="text-gray-600">
              La aplicación de gestión escolar está configurada correctamente.
            </p>
          </div>
        </main>
      </div>
    `;
  }
}

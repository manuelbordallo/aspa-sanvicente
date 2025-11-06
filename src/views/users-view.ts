import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('users-view')
export class UsersView extends LitElement {
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

    .placeholder {
      background: white;
      border-radius: 0.5rem;
      padding: 2rem;
      text-align: center;
      border: 2px dashed #e5e7eb;
    }
  `;

  render() {
    return html`
      <div class="view-header">
        <h1 class="view-title">Usuarios</h1>
        <p class="view-description">Gestiona todos los usuarios del sistema</p>
      </div>

      <div class="placeholder">
        <p>Vista de usuarios - Por implementar en tarea posterior</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'users-view': UsersView;
  }
}

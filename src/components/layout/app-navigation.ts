import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { UserRole } from '../../types/index.js';

interface NavigationItem {
  id: string;
  icon: string;
  label: string;
  roles: UserRole[];
  section?: 'main' | 'settings' | 'user';
}

@customElement('app-navigation')
export class AppNavigation extends LitElement {
  @property() currentView: string = 'news';
  @property() userRole: UserRole = 'user';
  @property({ type: Boolean }) isMobile = false;
  @property({ type: Boolean }) isCollapsed = false;

  @state() private _mobileMenuOpen = false;

  private navigationItems: NavigationItem[] = [
    {
      id: 'news',
      icon: 'newspaper',
      label: 'Noticias',
      roles: ['user', 'admin'],
      section: 'main',
    },
    {
      id: 'notices',
      icon: 'bell',
      label: 'Avisos',
      roles: ['user', 'admin'],
      section: 'main',
    },
    {
      id: 'calendar',
      icon: 'calendar',
      label: 'Calendario',
      roles: ['user', 'admin'],
      section: 'main',
    },
    {
      id: 'users',
      icon: 'users',
      label: 'Usuarios',
      roles: ['admin'],
      section: 'main',
    },
    {
      id: 'settings',
      icon: 'cog',
      label: 'Configuración',
      roles: ['user', 'admin'],
      section: 'settings',
    },
    {
      id: 'profile',
      icon: 'user',
      label: 'Perfil',
      roles: ['user', 'admin'],
      section: 'user',
    },
  ];

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .navigation {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: white;
      border-right: 1px solid #e5e7eb;
      transition: all 0.3s ease-in-out;
    }

    .navigation--collapsed {
      width: 4rem;
    }

    .navigation--expanded {
      width: 16rem;
    }

    .nav-header {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-logo {
      width: 2rem;
      height: 2rem;
      background-color: #3b82f6;
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      flex-shrink: 0;
    }

    .nav-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      white-space: nowrap;
      overflow: hidden;
      opacity: 1;
      transition: opacity 0.2s ease-in-out;
    }

    .navigation--collapsed .nav-title {
      opacity: 0;
      width: 0;
    }

    .nav-content {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: 2rem;
    }

    .nav-section:last-child {
      margin-bottom: 0;
    }

    .nav-section--settings {
      margin-top: auto;
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
    }

    .nav-items {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin-bottom: 0.25rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: #6b7280;
      text-decoration: none;
      border-radius: 0.375rem;
      margin: 0 0.5rem;
      transition: all 0.2s ease-in-out;
      cursor: pointer;
      border: none;
      background: none;
      width: calc(100% - 1rem);
      text-align: left;
      font-size: 0.875rem;
    }

    .nav-link:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    .nav-link--active {
      background-color: #dbeafe;
      color: #1d4ed8;
    }

    .nav-link--active:hover {
      background-color: #bfdbfe;
    }

    .nav-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }

    .nav-label {
      white-space: nowrap;
      overflow: hidden;
      opacity: 1;
      transition: opacity 0.2s ease-in-out;
    }

    .navigation--collapsed .nav-label {
      opacity: 0;
      width: 0;
    }

    .nav-toggle {
      position: absolute;
      top: 1rem;
      right: -0.75rem;
      width: 1.5rem;
      height: 1.5rem;
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 10;
      transition: all 0.2s ease-in-out;
    }

    .nav-toggle:hover {
      background-color: #f9fafb;
    }

    .nav-toggle-icon {
      width: 0.75rem;
      height: 0.75rem;
      transition: transform 0.2s ease-in-out;
    }

    .navigation--collapsed .nav-toggle-icon {
      transform: rotate(180deg);
    }

    /* Mobile styles */
    .mobile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 40;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease-in-out;
    }

    .mobile-overlay--open {
      opacity: 1;
      visibility: visible;
    }

    .mobile-nav {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 16rem;
      z-index: 50;
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
    }

    .mobile-nav--open {
      transform: translateX(0);
    }

    .mobile-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .mobile-close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.25rem;
      color: #6b7280;
    }

    .mobile-close:hover {
      background-color: #f3f4f6;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .navigation {
        background-color: #1f2937;
        border-right-color: #374151;
      }

      .nav-header {
        border-bottom-color: #374151;
      }

      .nav-title {
        color: #f9fafb;
      }

      .nav-link {
        color: #9ca3af;
      }

      .nav-link:hover {
        background-color: #374151;
        color: #d1d5db;
      }

      .nav-link--active {
        background-color: #1e40af;
        color: #dbeafe;
      }

      .nav-link--active:hover {
        background-color: #1d4ed8;
      }

      .nav-section--settings {
        border-top-color: #374151;
      }

      .nav-toggle {
        background-color: #1f2937;
        border-color: #374151;
      }

      .nav-toggle:hover {
        background-color: #374151;
      }
    }

    /* Hide desktop toggle on mobile */
    @media (max-width: 768px) {
      .nav-toggle {
        display: none;
      }
    }
  `;

  render() {
    if (this.isMobile) {
      return this._renderMobileNavigation();
    }

    return this._renderDesktopNavigation();
  }

  private _renderDesktopNavigation() {
    const navClasses = [
      'navigation',
      this.isCollapsed ? 'navigation--collapsed' : 'navigation--expanded',
    ].join(' ');

    return html`
      <nav class=${navClasses}>
        <div class="nav-header">
          <div class="nav-logo">S</div>
          <h1 class="nav-title">Escuela</h1>
        </div>

        <div class="nav-content">
          ${this._renderMainNavigation()} ${this._renderSettingsNavigation()}
        </div>

        <button class="nav-toggle" @click=${this._toggleCollapse}>
          <svg
            class="nav-toggle-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </nav>
    `;
  }

  private _renderMobileNavigation() {
    return html`
      <div
        class="mobile-overlay ${this._mobileMenuOpen
          ? 'mobile-overlay--open'
          : ''}"
        @click=${this._closeMobileMenu}
      ></div>

      <nav
        class="mobile-nav navigation ${this._mobileMenuOpen
          ? 'mobile-nav--open'
          : ''}"
      >
        <div class="mobile-header">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="nav-logo">S</div>
            <h1 class="nav-title">Escuela</h1>
          </div>
          <button class="mobile-close" @click=${this._closeMobileMenu}>
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="nav-content">
          ${this._renderMainNavigation()} ${this._renderSettingsNavigation()}
        </div>
      </nav>
    `;
  }

  private _renderMainNavigation() {
    const mainItems = this.navigationItems.filter(
      (item) => item.section === 'main' && this._hasPermission(item)
    );

    return html`
      <div class="nav-section">
        <ul class="nav-items">
          ${mainItems.map((item) => this._renderNavItem(item))}
        </ul>
      </div>
    `;
  }

  private _renderSettingsNavigation() {
    const settingsItems = this.navigationItems.filter(
      (item) =>
        (item.section === 'settings' || item.section === 'user') &&
        this._hasPermission(item)
    );

    return html`
      <div class="nav-section nav-section--settings">
        <ul class="nav-items">
          ${settingsItems.map((item) => this._renderNavItem(item))}
        </ul>
      </div>
    `;
  }

  private _renderNavItem(item: NavigationItem) {
    const isActive = this.currentView === item.id;
    const linkClasses = ['nav-link', isActive ? 'nav-link--active' : ''].join(
      ' '
    );

    return html`
      <li class="nav-item">
        <button
          class=${linkClasses}
          @click=${() => this._handleNavigation(item.id)}
        >
          ${this._renderIcon(item.icon)}
          <span class="nav-label">${item.label}</span>
        </button>
      </li>
    `;
  }

  private _renderIcon(iconName: string) {
    const icons: Record<string, ReturnType<typeof html>> = {
      newspaper: html`<svg
        class="nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
      </svg>`,
      bell: html`<svg
        class="nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>`,
      calendar: html`<svg
        class="nav-icon"
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
      </svg>`,
      users: html`<svg
        class="nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>`,
      cog: html`<svg
        class="nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>`,
      user: html`<svg
        class="nav-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>`,
    };

    return icons[iconName] || icons.user;
  }

  private _hasPermission(item: NavigationItem): boolean {
    return item.roles.includes(this.userRole) || this.userRole === 'admin';
  }

  private _handleNavigation(viewId: string) {
    if (this.isMobile) {
      this._closeMobileMenu();
    }

    this.dispatchEvent(
      new CustomEvent('navigation-change', {
        bubbles: true,
        composed: true,
        detail: { view: viewId },
      })
    );
  }

  private _toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.dispatchEvent(
      new CustomEvent('navigation-toggle', {
        bubbles: true,
        composed: true,
        detail: { collapsed: this.isCollapsed },
      })
    );
  }

  openMobileMenu() {
    this._mobileMenuOpen = true;
  }

  private _closeMobileMenu() {
    this._mobileMenuOpen = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-navigation': AppNavigation;
  }
}

import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { provide } from '@lit/context';
// Import contexts
import {
  authContext,
  settingsContext,
  notificationContext,
  appStateContext,
} from '../contexts/index.js';
import type {
  AuthContextValue,
  SettingsContextValue,
  NotificationContextValue,
  AppStateContextValue,
  Notification,
} from '../contexts/index.js';

// Import services
import {
  authService,
  authServiceFactory,
} from '../services/auth-service-factory.js';
import { themeService } from '../services/theme-service.js';
import { notificationService } from '../services/notification-service.js';
import { backendDetector } from '../services/backend-detector.js';
import type { AuthState } from '../services/auth-service.js';

// Import router
import { createAppRouter, routes, SimpleRouter } from '../router/index.js';
import type { RouteConfig } from '../router/index.js';

// Import types
import type { Theme } from '../types/index.js';

// Import components
import '../components/layout/index.js';
import '../components/ui/ui-loading.js';
import '../components/ui/ui-toast.js';
// Views are lazy loaded via router

@customElement('school-app')
export class SchoolApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--bg-color, #f9fafb);
      color: var(--text-color, #111827);
    }

    .app-container {
      display: flex;
      min-height: 100vh;
    }

    .app-sidebar {
      flex-shrink: 0;
      transition: all 0.3s ease-in-out;
    }

    .app-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .app-header {
      background-color: var(--header-bg, white);
      border-bottom: 1px solid var(--border-color, #e5e7eb);
      padding: 0 1.5rem;
      height: 4rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 30;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .mobile-menu-button {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 0.375rem;
      color: var(--text-secondary, #6b7280);
    }

    .mobile-menu-button:hover {
      background-color: var(--hover-bg, #f3f4f6);
    }

    .header-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary, #111827);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-secondary, #6b7280);
    }

    .user-avatar {
      width: 2rem;
      height: 2rem;
      background-color: var(--primary-color, #3b82f6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .app-content {
      flex: 1;
      overflow-y: auto;
      position: relative;
    }

    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      flex-direction: column;
      gap: 1rem;
    }

    .loading-spinner {
      width: 2rem;
      height: 2rem;
      border: 2px solid var(--border-color, #e5e7eb);
      border-top: 2px solid var(--primary-color, #3b82f6);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .loading-text {
      color: var(--text-secondary, #6b7280);
      font-size: 0.875rem;
    }

    .error-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      flex-direction: column;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
    }

    .error-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--error-color, #dc2626);
    }

    .error-message {
      color: var(--text-secondary, #6b7280);
      max-width: 400px;
    }

    .retry-button {
      background-color: var(--primary-color, #3b82f6);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .retry-button:hover {
      background-color: var(--primary-hover, #2563eb);
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .mobile-menu-button {
        display: block;
      }

      .app-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 40;
        transform: translateX(-100%);
        transition: transform 0.3s ease-in-out;
      }

      .app-sidebar--mobile-open {
        transform: translateX(0);
      }

      .app-main {
        width: 100%;
      }

      .header-title {
        font-size: 1.125rem;
      }

      .user-info {
        display: none;
      }
    }

    /* Theme variables */
    :host(.light) {
      --bg-color: #f9fafb;
      --header-bg: white;
      --text-primary: #111827;
      --text-secondary: #6b7280;
      --border-color: #e5e7eb;
      --hover-bg: #f3f4f6;
      --primary-color: #3b82f6;
      --primary-hover: #2563eb;
      --error-color: #dc2626;
    }

    :host(.dark) {
      --bg-color: #111827;
      --header-bg: #1f2937;
      --text-primary: #f9fafb;
      --text-secondary: #9ca3af;
      --border-color: #374151;
      --hover-bg: #374151;
      --primary-color: #3b82f6;
      --primary-hover: #2563eb;
      --error-color: #f87171;
    }
  `;

  // Context providers

  @provide({ context: authContext })
  @state()
  private authState!: AuthContextValue;

  @provide({ context: settingsContext })
  @state()
  private settingsState!: SettingsContextValue;

  @provide({ context: notificationContext })
  @state()
  private notificationState!: NotificationContextValue;

  @provide({ context: appStateContext })
  @state()
  private appState!: AppStateContextValue;

  // Component state
  @state() private initialized = false;
  @state() private isMobile = false;
  @state() private currentPageTitle = 'Noticias';
  @state() private currentRouteComponent = 'news-view';
  @state() private routeLoading = false;
  @state() private backendAvailable = false;
  @state() private mockMode = false;
  @state() private connectionError: string | null = null;

  @query('app-navigation') private navigation!: any;

  private router!: SimpleRouter;
  private resizeObserver?: ResizeObserver;

  constructor() {
    super();

    // Initialize context states
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    };

    this.settingsState = {
      theme: 'system',
      language: 'es',
      currentCourse: '2025-2026',
    };

    this.notificationState = {
      notifications: [],
      addNotification: this.addNotification.bind(this),
      removeNotification: this.removeNotification.bind(this),
      clearNotifications: this.clearNotifications.bind(this),
    };

    this.appState = {
      currentView: 'news',
      isMobileMenuOpen: false,
      isNavigationCollapsed: false,
      isLoading: false,
    };
  }

  async connectedCallback() {
    super.connectedCallback();

    // Initialize theme
    this.initializeTheme();

    // Setup auth listener
    this.setupAuthListener();

    // Setup resize observer for mobile detection
    this.setupResizeObserver();

    // Setup route guards listener
    this.setupRouteGuardsListener();

    // Setup notification service listener
    this.setupNotificationListener();

    // Initialize router
    this.initializeRouter();

    // Load initial settings
    await this.loadSettings();

    // Detect backend availability and initialize auth service
    await this.initializeBackendDetection();

    // Validate authentication
    await this.validateAuth();

    this.initialized = true;
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Cleanup
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    authService.removeAuthStateListener(this.handleAuthStateChange);
    themeService.removeThemeListener(this.handleThemeChange);
    notificationService.removeListener(this.handleNotification);
    backendDetector.removeStatusListener(this.handleBackendStatusChange);
  }

  private initializeTheme(): void {
    const theme = themeService.getCurrentTheme();
    this.settingsState = { ...this.settingsState, theme };
    this.updateThemeClass();

    // Listen for theme changes
    themeService.addThemeListener(this.handleThemeChange.bind(this));
  }

  private setupAuthListener(): void {
    authService.addAuthStateListener(this.handleAuthStateChange.bind(this));
  }

  private setupRouteGuardsListener(): void {
    // Listen for unauthorized route access attempts
    window.addEventListener('route:unauthorized', ((event: CustomEvent) => {
      const { requiredRoles } = event.detail;
      const roleNames = requiredRoles
        .map((r: string) => (r === 'admin' ? 'Administrador' : 'Usuario'))
        .join(', ');

      this.addNotification({
        type: 'error',
        title: 'Acceso Denegado',
        message: `No tienes permisos para acceder a esta sección. Se requiere rol: ${roleNames}`,
        duration: 5000,
      });
    }) as EventListener);
  }

  private setupNotificationListener(): void {
    // Connect notification service to context
    notificationService.addListener(this.handleNotification);
  }

  private handleNotification = (
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): void => {
    this.addNotification(notification);
  };

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.checkMobileView();
    });
    this.resizeObserver.observe(document.body);
    this.checkMobileView();
  }

  private checkMobileView(): void {
    this.isMobile = window.innerWidth < 768;

    // Close mobile menu when switching to desktop
    if (!this.isMobile && this.appState.isMobileMenuOpen) {
      this.appState = { ...this.appState, isMobileMenuOpen: false };
    }
  }

  private initializeRouter(): void {
    this.router = createAppRouter();

    // Listen for route changes
    this.router.addListener((route: RouteConfig | null) => {
      if (route) {
        this.appState = { ...this.appState, currentView: route.name };
        this.currentPageTitle = route.title || route.name;
        this.currentRouteComponent = route.component;
        this.routeLoading = this.router.isLoading();
        this.requestUpdate();
      }
    });
  }

  private async loadSettings(): Promise<void> {
    try {
      // Load settings from localStorage
      const savedLanguage = localStorage.getItem('app_language') || 'es';
      const savedCourse =
        localStorage.getItem('app_current_course') || '2025-2026';

      this.settingsState = {
        ...this.settingsState,
        language: savedLanguage,
        currentCourse: savedCourse,
      };
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  private async initializeBackendDetection(): Promise<void> {
    try {
      // Initialize auth service factory (which checks backend availability)
      await authServiceFactory.initialize();

      // Get backend status
      this.backendAvailable = backendDetector.isBackendAvailable();
      this.mockMode = authServiceFactory.isMockMode();

      // Setup backend status listener
      backendDetector.addStatusListener(this.handleBackendStatusChange);

      // Log mode for debugging
      if (this.mockMode) {
        console.log(
          '[SchoolApp] Running in mock mode - backend unavailable or mock mode enabled'
        );
        this.connectionError = null; // Clear any connection errors in mock mode
      } else {
        console.log('[SchoolApp] Running in real mode - backend available');
        this.connectionError = null;
      }
    } catch (error) {
      console.error('[SchoolApp] Error during backend detection:', error);
      // Fallback to mock mode on error
      this.mockMode = true;
      this.backendAvailable = false;
      this.connectionError =
        'No se pudo conectar con el servidor. Usando modo de desarrollo.';
    }
  }

  private handleBackendStatusChange = (available: boolean): void => {
    this.backendAvailable = available;

    if (available && this.mockMode) {
      // Backend became available while in mock mode
      this.addNotification({
        type: 'success',
        title: 'Conexión Restaurada',
        message: 'El servidor está disponible nuevamente.',
        duration: 5000,
      });
    } else if (!available && !this.mockMode) {
      // Backend became unavailable while in real mode
      this.addNotification({
        type: 'warning',
        title: 'Conexión Perdida',
        message: 'No se puede conectar con el servidor.',
        duration: 5000,
      });
    }
  };

  private async validateAuth(): Promise<void> {
    try {
      // Get the appropriate auth service (real or mock)
      const currentAuthService = await authServiceFactory.getAuthService();

      if (currentAuthService.isAuthenticated()) {
        const isValid = await currentAuthService.validateToken();
        if (!isValid) {
          this.navigateToLogin();
        }
      } else {
        // Only redirect to login if not already on login page
        if (window.location.pathname !== '/login') {
          this.navigateToLogin();
        }
      }
    } catch (error) {
      console.error('Auth validation error:', error);
      // Don't treat auth validation errors as fatal - show login instead
      this.connectionError = null;
      this.navigateToLogin();
    }
  }

  private navigateToLogin(): void {
    if (window.location.pathname !== '/login') {
      this.router.navigate('/login');
    }
  }

  private handleLoginSuccess(): void {
    // Navigate to home after successful login
    this.router.navigate('/');
  }

  private handleAuthStateChange = (authState: AuthState): void => {
    this.authState = {
      user: authState.user,
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      error: authState.error,
    };

    // Redirect to login if not authenticated and not already on login page
    if (!authState.isAuthenticated && !authState.isLoading) {
      if (window.location.pathname !== '/login') {
        this.navigateToLogin();
      }
    }

    // Redirect to home if authenticated and on login page
    if (authState.isAuthenticated && window.location.pathname === '/login') {
      this.router.navigate('/');
    }
  };

  private handleThemeChange = (theme: Theme): void => {
    this.settingsState = { ...this.settingsState, theme };
    this.updateThemeClass();
  };

  private updateThemeClass(): void {
    const effectiveTheme = themeService.getEffectiveTheme();
    this.classList.remove('light', 'dark');
    this.classList.add(effectiveTheme);
  }

  private addNotification(
    notification: Omit<Notification, 'id' | 'createdAt'>
  ): void {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    this.notificationState = {
      ...this.notificationState,
      notifications: [...this.notificationState.notifications, newNotification],
    };

    // Auto-remove notification after duration
    if (notification.duration !== 0) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, duration);
    }
  }

  private removeNotification(id: string): void {
    this.notificationState = {
      ...this.notificationState,
      notifications: this.notificationState.notifications.filter(
        (n) => n.id !== id
      ),
    };
  }

  private clearNotifications(): void {
    this.notificationState = {
      ...this.notificationState,
      notifications: [],
    };
  }

  private handleNavigationChange(event: CustomEvent): void {
    const { view } = event.detail;
    const route = routes.find((r) => r.name === view);

    if (route) {
      this.router.navigate(route.path);
    }
  }

  private handleNavigationToggle(event: CustomEvent): void {
    const { collapsed } = event.detail;
    this.appState = { ...this.appState, isNavigationCollapsed: collapsed };
  }

  private toggleMobileMenu(): void {
    this.appState = {
      ...this.appState,
      isMobileMenuOpen: !this.appState.isMobileMenuOpen,
    };

    if (this.navigation && this.appState.isMobileMenuOpen) {
      this.navigation.openMobileMenu();
    }
  }

  private async retryConnection(): Promise<void> {
    // Show loading state
    this.authState = { ...this.authState, isLoading: true };
    this.connectionError = null;

    try {
      // Re-initialize backend detection
      await this.initializeBackendDetection();

      // If backend is now available, reload the page
      if (this.backendAvailable && !this.mockMode) {
        window.location.reload();
      } else {
        // Still in mock mode, navigate to login
        this.authState = { ...this.authState, isLoading: false };
        this.navigateToLogin();
      }
    } catch (error) {
      console.error('Retry connection error:', error);
      this.authState = { ...this.authState, isLoading: false };
      this.connectionError =
        'No se pudo restablecer la conexión. Intenta nuevamente.';
    }
  }

  private getUserInitials(): string {
    const user = this.authState.user;
    if (!user) return 'U';

    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || 'U';
  }

  private renderCurrentView() {
    console.log(
      '[SchoolApp] renderCurrentView called, component:',
      this.currentRouteComponent,
      'loading:',
      this.routeLoading
    );

    // Show loading state while route is loading
    if (this.routeLoading) {
      return html`<ui-loading
        size="lg"
        message="Cargando vista..."
      ></ui-loading>`;
    }

    switch (this.currentRouteComponent) {
      case 'login-view':
        return html`<login-view
          @login-success=${this.handleLoginSuccess}
        ></login-view>`;
      case 'news-view':
        console.log('[SchoolApp] Rendering news-view');
        return html`<news-view></news-view>`;
      case 'notices-view':
        return html`<notices-view></notices-view>`;
      case 'calendar-view':
        return html`<calendar-view></calendar-view>`;
      case 'users-view':
        return html`<users-view></users-view>`;
      case 'settings-view':
        return html`<settings-view></settings-view>`;
      case 'profile-view':
        return html`<profile-view></profile-view>`;
      default:
        return html`<news-view></news-view>`;
    }
  }

  render() {
    // Show loading only during initial setup
    if (!this.initialized && this.authState.isLoading) {
      return this.renderLoading();
    }

    // Show error only if there's a critical error and not in mock mode
    if (this.authState.error && !this.mockMode) {
      return this.renderError();
    }

    // If connection error but in mock mode, show login
    if (this.connectionError && this.mockMode) {
      return html`<login-view></login-view>`;
    }

    // Show login view if not authenticated
    if (!this.authState.isAuthenticated) {
      return html`<login-view></login-view>`;
    }

    return this.renderApp();
  }

  private renderLoading() {
    return html`
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">Cargando aplicación...</div>
      </div>
    `;
  }

  private renderError() {
    // Determine error message
    let errorTitle = 'Error de conexión';
    let errorMessage =
      this.connectionError ||
      this.authState.error ||
      'Ha ocurrido un error inesperado';

    // If in mock mode, don't show as error - show login instead
    if (this.mockMode && !this.authState.error) {
      return html`<login-view></login-view>`;
    }

    // Show specific error messages based on error type
    if (
      errorMessage.includes('fetch') ||
      errorMessage.includes('Network') ||
      errorMessage.includes('Timeout')
    ) {
      errorTitle = 'No se puede conectar con el servidor';
      errorMessage =
        'El servidor no está disponible. Por favor, verifica tu conexión o intenta más tarde.';
    }

    return html`
      <div class="error-container">
        <div class="error-title">${errorTitle}</div>
        <div class="error-message">${errorMessage}</div>
        ${this.mockMode
          ? html`
              <div class="error-message" style="margin-top: 1rem;">
                <strong>Modo de desarrollo activo:</strong> Puedes continuar
                usando la aplicación con datos de prueba.
              </div>
              <button
                class="retry-button"
                @click=${() => this.navigateToLogin()}
              >
                Ir al Login
              </button>
            `
          : html`
              <button
                class="retry-button"
                @click=${() => this.retryConnection()}
              >
                Reintentar Conexión
              </button>
            `}
      </div>
    `;
  }

  private renderApp() {
    const sidebarClasses = [
      'app-sidebar',
      this.isMobile && this.appState.isMobileMenuOpen
        ? 'app-sidebar--mobile-open'
        : '',
    ]
      .filter(Boolean)
      .join(' ');

    return html`
      <div class="app-container">
        <div class=${sidebarClasses}>
          <app-navigation
            .currentView=${this.appState.currentView}
            .userRole=${this.authState.user?.role || 'user'}
            .isMobile=${this.isMobile}
            .isCollapsed=${this.appState.isNavigationCollapsed}
            @navigation-change=${this.handleNavigationChange}
            @navigation-toggle=${this.handleNavigationToggle}
          ></app-navigation>
        </div>

        <div class="app-main">
          <header class="app-header">
            <div class="header-left">
              <button
                class="mobile-menu-button"
                @click=${this.toggleMobileMenu}
                aria-label="Abrir menú"
              >
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 class="header-title">${this.currentPageTitle}</h1>
            </div>

            <div class="header-right">
              <div class="user-info">
                <span
                  >${this.authState.user?.firstName}
                  ${this.authState.user?.lastName}</span
                >
                <div class="user-avatar">${this.getUserInitials()}</div>
              </div>
            </div>
          </header>

          <main class="app-content">${this.renderCurrentView()}</main>
        </div>
      </div>

      <!-- Toast notifications -->
      <ui-toast></ui-toast>
    `;
  }
}

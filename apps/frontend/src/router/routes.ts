import { html, TemplateResult } from 'lit';
import type { UserRole } from '../types/index.js';
import { authService } from '../services/auth-service-factory.js';

export interface RouteConfig {
  path: string;
  name: string;
  component: string;
  requiresAuth?: boolean;
  allowedRoles?: UserRole[];
  title?: string;
  lazyLoad?: () => Promise<any>;
}

// Lazy load view components
const lazyLoadViews = {
  'news-view': () => import('../views/news-view.js'),
  'notices-view': () => import('../views/notices-view.js'),
  'calendar-view': () => import('../views/calendar-view.js'),
  'users-view': () => import('../views/users-view.js'),
  'settings-view': () => import('../views/settings-view.js'),
  'profile-view': () => import('../views/profile-view.js'),
  'login-view': () => import('../views/login-view.js'),
};

export const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: 'news-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Noticias',
    lazyLoad: lazyLoadViews['news-view'],
  },
  {
    path: '/news',
    name: 'news',
    component: 'news-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Noticias',
    lazyLoad: lazyLoadViews['news-view'],
  },
  {
    path: '/notices',
    name: 'notices',
    component: 'notices-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Avisos',
    lazyLoad: lazyLoadViews['notices-view'],
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: 'calendar-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Calendario',
    lazyLoad: lazyLoadViews['calendar-view'],
  },
  {
    path: '/users',
    name: 'users',
    component: 'users-view',
    requiresAuth: true,
    allowedRoles: ['admin'],
    title: 'Usuarios',
    lazyLoad: lazyLoadViews['users-view'],
  },
  {
    path: '/settings',
    name: 'settings',
    component: 'settings-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Configuración',
    lazyLoad: lazyLoadViews['settings-view'],
  },
  {
    path: '/profile',
    name: 'profile',
    component: 'profile-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Perfil',
    lazyLoad: lazyLoadViews['profile-view'],
  },
  {
    path: '/login',
    name: 'login',
    component: 'login-view',
    requiresAuth: false,
    title: 'Iniciar Sesión',
    lazyLoad: lazyLoadViews['login-view'],
  },
];

export class RouteGuard {
  static canActivate(route: RouteConfig): boolean {
    // Check authentication requirement
    if (route.requiresAuth && !authService.isAuthenticated()) {
      return false;
    }

    // Check role permissions
    if (route.allowedRoles && route.allowedRoles.length > 0) {
      const user = authService.getCurrentUser();
      if (!user) {
        return false;
      }

      // Admin has access to all routes
      if (user.role === 'admin') {
        return true;
      }

      // Check if user role is in allowed roles
      return route.allowedRoles.includes(user.role);
    }

    return true;
  }

  static getRedirectPath(route: RouteConfig): string {
    if (route.requiresAuth && !authService.isAuthenticated()) {
      return '/login';
    }

    if (route.allowedRoles && !this.canActivate(route)) {
      // Dispatch event for unauthorized access
      window.dispatchEvent(
        new CustomEvent('route:unauthorized', {
          detail: {
            attemptedRoute: route.path,
            requiredRoles: route.allowedRoles,
          },
        })
      );

      // Redirect to home if user doesn't have permission
      return '/';
    }

    return route.path;
  }

  /**
   * Check if current user can access a specific route by path
   */
  static canAccessPath(path: string): boolean {
    const route = routes.find((r) => r.path === path);
    if (!route) return false;
    return this.canActivate(route);
  }

  /**
   * Check if current user has a specific role
   */
  static hasRole(role: UserRole): boolean {
    return authService.hasRole(role);
  }

  /**
   * Check if current user is authenticated
   */
  static isAuthenticated(): boolean {
    return authService.isAuthenticated();
  }
}

export class SimpleRouter {
  private currentRoute: RouteConfig | null = null;
  private listeners: ((route: RouteConfig | null) => void)[] = [];
  private loadedComponents: Set<string> = new Set();
  private loadingRoute = false;

  constructor() {
    this.setupEventListeners();
    this.handleRouteChange();
  }

  private setupEventListeners(): void {
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });
  }

  private async handleRouteChange(): Promise<void> {
    console.log(
      '[Router] handleRouteChange called, path:',
      window.location.pathname
    );
    console.log('[Router] Current state:', {
      loadingRoute: this.loadingRoute,
      currentRoute: this.currentRoute?.name,
      loadedComponents: Array.from(this.loadedComponents),
    });

    if (this.loadingRoute) {
      console.log('[Router] Already loading a route, skipping');
      return;
    }

    const path = window.location.pathname;
    const route = this.findRoute(path);
    console.log(
      '[Router] Found route:',
      route?.name,
      'component:',
      route?.component
    );

    if (route) {
      // Check route guard
      if (!RouteGuard.canActivate(route)) {
        console.log('[Router] Route guard failed for:', route.name);
        const redirectPath = RouteGuard.getRedirectPath(route);
        if (redirectPath !== route.path) {
          // Prevent infinite redirect loop
          if (window.location.pathname !== redirectPath) {
            console.log('[Router] Redirecting to:', redirectPath);
            this.navigate(redirectPath);
          }
          return;
        }
      }

      // Update document title
      if (route.title) {
        document.title = `${route.title} - Gestión Escolar`;
      }

      // Lazy load component if needed
      if (route.lazyLoad && !this.loadedComponents.has(route.component)) {
        console.log(
          '[Router] Starting lazy load for component:',
          route.component
        );
        this.loadingRoute = true;
        try {
          await route.lazyLoad();
          console.log('[Router] Component module loaded:', route.component);

          // Verify component registration with customElements.get()
          const isRegistered = customElements.get(route.component);
          if (isRegistered) {
            console.log(
              '[Router] Component successfully registered:',
              route.component
            );
            this.loadedComponents.add(route.component);
          } else {
            console.error(
              '[Router] Component failed to register:',
              route.component
            );
            console.error(
              '[Router] The component module was loaded but the custom element was not defined'
            );
            throw new Error(
              `Component ${route.component} failed to register after module load`
            );
          }
        } catch (error) {
          console.error(
            `[Router] Error loading component ${route.component}:`,
            error
          );
          if (error instanceof Error) {
            console.error('[Router] Error name:', error.name);
            console.error('[Router] Error message:', error.message);
            console.error('[Router] Error stack:', error.stack);
          }
          // Dispatch error event for UI to handle
          window.dispatchEvent(
            new CustomEvent('route:load-error', {
              detail: {
                component: route.component,
                route: route.path,
                error: error instanceof Error ? error.message : String(error),
              },
            })
          );
        } finally {
          this.loadingRoute = false;
          console.log('[Router] Lazy load complete for:', route.component);
        }
      } else if (this.loadedComponents.has(route.component)) {
        console.log('[Router] Component already loaded:', route.component);
      } else {
        console.log('[Router] No lazy load needed for:', route.component);
      }

      this.currentRoute = route;
      console.log('[Router] Current route set to:', route.name);
    } else {
      console.log('[Router] No route found for path:', path);
      // Default to news if route not found and authenticated
      if (authService.isAuthenticated()) {
        if (window.location.pathname !== '/news') {
          console.log(
            '[Router] Redirecting to /news (authenticated, no route found)'
          );
          this.navigate('/news');
        }
        return;
      } else {
        if (window.location.pathname !== '/login') {
          console.log(
            '[Router] Redirecting to /login (not authenticated, no route found)'
          );
          this.navigate('/login');
        }
        return;
      }
    }

    console.log('[Router] Notifying listeners');
    this.notifyListeners();
  }

  private findRoute(path: string): RouteConfig | null {
    // Handle root path
    if (path === '/') {
      return routes.find((r) => r.name === 'home') || null;
    }

    return routes.find((r) => r.path === path) || null;
  }

  navigate(path: string): void {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      this.handleRouteChange().catch((error) => {
        console.error('Navigation error:', error);
      });
    }
  }

  isLoading(): boolean {
    return this.loadingRoute;
  }

  getCurrentRoute(): RouteConfig | null {
    return this.currentRoute;
  }

  renderCurrentRoute(): TemplateResult {
    if (!this.currentRoute) {
      return html`<div>Ruta no encontrada</div>`;
    }

    // Create the component element dynamically
    const element = document.createElement(this.currentRoute.component);
    return html`${element}`;
  }

  addListener(listener: (route: RouteConfig | null) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (route: RouteConfig | null) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.currentRoute));
  }
}

export function createAppRouter(): SimpleRouter {
  return new SimpleRouter();
}

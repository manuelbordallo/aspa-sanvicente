import { html, TemplateResult } from 'lit';
import type { UserRole } from '../types/index.js';
import { authService } from '../services/auth-service.js';

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
    if (this.loadingRoute) return;

    const path = window.location.pathname;
    const route = this.findRoute(path);

    if (route) {
      // Check route guard
      if (!RouteGuard.canActivate(route)) {
        const redirectPath = RouteGuard.getRedirectPath(route);
        if (redirectPath !== route.path) {
          // Prevent infinite redirect loop
          if (window.location.pathname !== redirectPath) {
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
        this.loadingRoute = true;
        try {
          await route.lazyLoad();
          this.loadedComponents.add(route.component);
        } catch (error) {
          console.error(`Error loading component ${route.component}:`, error);
        } finally {
          this.loadingRoute = false;
        }
      }

      this.currentRoute = route;
    } else {
      // Default to news if route not found and authenticated
      if (authService.isAuthenticated()) {
        if (window.location.pathname !== '/news') {
          this.navigate('/news');
        }
        return;
      } else {
        if (window.location.pathname !== '/login') {
          this.navigate('/login');
        }
        return;
      }
    }

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

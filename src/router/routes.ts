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
}

export const routes: RouteConfig[] = [
  {
    path: '/',
    name: 'home',
    component: 'news-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Noticias',
  },
  {
    path: '/news',
    name: 'news',
    component: 'news-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Noticias',
  },
  {
    path: '/notices',
    name: 'notices',
    component: 'notices-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Avisos',
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: 'calendar-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Calendario',
  },
  {
    path: '/users',
    name: 'users',
    component: 'users-view',
    requiresAuth: true,
    allowedRoles: ['admin'],
    title: 'Usuarios',
  },
  {
    path: '/settings',
    name: 'settings',
    component: 'settings-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Configuración',
  },
  {
    path: '/profile',
    name: 'profile',
    component: 'profile-view',
    requiresAuth: true,
    allowedRoles: ['user', 'admin'],
    title: 'Perfil',
  },
  {
    path: '/login',
    name: 'login',
    component: 'login-view',
    requiresAuth: false,
    title: 'Iniciar Sesión',
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
      // Redirect to home if user doesn't have permission
      return '/';
    }

    return route.path;
  }
}

export class SimpleRouter {
  private currentRoute: RouteConfig | null = null;
  private listeners: ((route: RouteConfig | null) => void)[] = [];

  constructor() {
    this.setupEventListeners();
    this.handleRouteChange();
  }

  private setupEventListeners(): void {
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });
  }

  private handleRouteChange(): void {
    const path = window.location.pathname;
    const route = this.findRoute(path);

    if (route) {
      // Check route guard
      if (!RouteGuard.canActivate(route)) {
        const redirectPath = RouteGuard.getRedirectPath(route);
        if (redirectPath !== route.path) {
          this.navigate(redirectPath);
          return;
        }
      }

      // Update document title
      if (route.title) {
        document.title = `${route.title} - Gestión Escolar`;
      }

      this.currentRoute = route;
    } else {
      // Default to news if route not found and authenticated
      if (authService.isAuthenticated()) {
        this.navigate('/news');
        return;
      } else {
        this.navigate('/login');
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
      this.handleRouteChange();
    }
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

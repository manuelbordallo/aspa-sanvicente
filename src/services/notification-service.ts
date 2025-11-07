import type { Notification } from '../contexts/index.js';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  title: string;
  message: string;
  type?: NotificationType;
  duration?: number;
}

class NotificationService {
  private listeners: Set<
    (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  > = new Set();

  /**
   * Show a notification
   */
  show(options: NotificationOptions): void {
    const notification = {
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration,
    };

    this.listeners.forEach((listener) => listener(notification));
  }

  /**
   * Show a success notification
   */
  success(title: string, message: string, duration?: number): void {
    this.show({ type: 'success', title, message, duration });
  }

  /**
   * Show an error notification
   */
  error(title: string, message: string, duration?: number): void {
    this.show({ type: 'error', title, message, duration });
  }

  /**
   * Show a warning notification
   */
  warning(title: string, message: string, duration?: number): void {
    this.show({ type: 'warning', title, message, duration });
  }

  /**
   * Show an info notification
   */
  info(title: string, message: string, duration?: number): void {
    this.show({ type: 'info', title, message, duration });
  }

  /**
   * Show a loading notification (doesn't auto-dismiss)
   */
  loading(title: string, message: string): void {
    this.show({ type: 'info', title, message, duration: 0 });
  }

  /**
   * Add a listener for notifications
   */
  addListener(
    listener: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  ): void {
    this.listeners.add(listener);
  }

  /**
   * Remove a listener
   */
  removeListener(
    listener: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  ): void {
    this.listeners.delete(listener);
  }

  /**
   * Handle API errors with appropriate notifications
   */
  handleApiError(error: any, defaultMessage = 'Ha ocurrido un error'): void {
    let title = 'Error';
    let message = defaultMessage;

    if (error?.message) {
      message = error.message;
    }

    if (error?.status === 401) {
      title = 'No autorizado';
      message = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    } else if (error?.status === 403) {
      title = 'Acceso denegado';
      message = 'No tienes permisos para realizar esta acción.';
    } else if (error?.status === 404) {
      title = 'No encontrado';
      message = 'El recurso solicitado no existe.';
    } else if (error?.status === 500) {
      title = 'Error del servidor';
      message = 'Ha ocurrido un error en el servidor. Intenta nuevamente.';
    }

    this.error(title, message);
  }

  /**
   * Show a confirmation for successful operations
   */
  operationSuccess(operation: string): void {
    this.success('Operación exitosa', `${operation} completado correctamente.`);
  }

  /**
   * Show a notification for failed operations
   */
  operationFailed(operation: string, error?: any): void {
    const message = error?.message || `No se pudo completar ${operation}.`;
    this.error('Operación fallida', message);
  }
}

export const notificationService = new NotificationService();

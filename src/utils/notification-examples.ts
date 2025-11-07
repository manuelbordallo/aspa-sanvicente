/**
 * Examples of using the notification system
 *
 * This file demonstrates how to use notifications and confirmations
 * throughout the application.
 */

import { notificationService } from '../services/notification-service.js';
import { handleAsyncOperation, withConfirmation } from './async-handler.js';

// ============================================================================
// Basic Notifications
// ============================================================================

/**
 * Show a success notification
 */
export function showSuccessExample() {
  notificationService.success(
    'Operación exitosa',
    'Los datos se han guardado correctamente.'
  );
}

/**
 * Show an error notification
 */
export function showErrorExample() {
  notificationService.error('Error', 'No se pudo completar la operación.');
}

/**
 * Show a warning notification
 */
export function showWarningExample() {
  notificationService.warning(
    'Advertencia',
    'Esta acción no se puede deshacer.'
  );
}

/**
 * Show an info notification
 */
export function showInfoExample() {
  notificationService.info(
    'Información',
    'Los cambios se aplicarán en unos minutos.'
  );
}

/**
 * Show a loading notification (doesn't auto-dismiss)
 */
export function showLoadingExample() {
  notificationService.loading(
    'Procesando',
    'Por favor espera mientras procesamos tu solicitud...'
  );
}

// ============================================================================
// Async Operations with Notifications
// ============================================================================

/**
 * Example: Save data with automatic loading and success notifications
 */
export async function saveDataExample() {
  const result = await handleAsyncOperation(
    async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { id: '123', name: 'Test' };
    },
    {
      loadingMessage: 'Guardando datos...',
      successMessage: 'Datos guardados correctamente',
      errorMessage: 'Error al guardar los datos',
      showLoading: true,
      showSuccess: true,
      showError: true,
    }
  );

  if (result.success) {
    console.log('Data saved:', result.data);
  }
}

/**
 * Example: Delete with confirmation and notifications
 */
export async function deleteWithConfirmationExample() {
  const result = await withConfirmation(
    async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    {
      title: 'Eliminar elemento',
      message: '¿Estás seguro de que deseas eliminar este elemento?',
      confirmText: 'Eliminar',
      type: 'danger',
    },
    {
      successMessage: 'Elemento eliminado correctamente',
      errorMessage: 'Error al eliminar el elemento',
    }
  );

  if (result.cancelled) {
    console.log('User cancelled the operation');
  } else if (result.success) {
    console.log('Item deleted successfully');
  }
}

// ============================================================================
// Manual Confirmation Dialogs
// ============================================================================

/**
 * Example: Show a confirmation dialog manually
 */
export function showConfirmationExample() {
  const confirm = document.createElement('ui-confirm');
  document.body.appendChild(confirm);

  confirm.open({
    title: 'Confirmar acción',
    message: '¿Deseas continuar con esta acción?',
    confirmText: 'Continuar',
    cancelText: 'Cancelar',
    type: 'warning',
    onConfirm: async () => {
      console.log('User confirmed');
      // Perform action
      notificationService.success('Confirmado', 'Acción completada');
      document.body.removeChild(confirm);
    },
    onCancel: () => {
      console.log('User cancelled');
      document.body.removeChild(confirm);
    },
  });
}

// ============================================================================
// API Error Handling
// ============================================================================

/**
 * Example: Handle API errors with appropriate notifications
 */
export async function handleApiErrorExample() {
  try {
    // Simulate API call that fails
    const error = new Error('Unauthorized');
    (error as any).apiError = {
      message: 'Tu sesión ha expirado',
      code: 'UNAUTHORIZED',
      status: 401,
    };
    throw error;
  } catch (error) {
    notificationService.handleApiError(error);
  }
}

// ============================================================================
// Custom Duration Notifications
// ============================================================================

/**
 * Example: Show notification with custom duration
 */
export function customDurationExample() {
  // Show for 10 seconds
  notificationService.show({
    type: 'info',
    title: 'Información importante',
    message: 'Este mensaje permanecerá visible por 10 segundos.',
    duration: 10000,
  });
}

/**
 * Example: Show notification that doesn't auto-dismiss
 */
export function persistentNotificationExample() {
  notificationService.show({
    type: 'warning',
    title: 'Acción requerida',
    message: 'Este mensaje permanecerá hasta que lo cierres manualmente.',
    duration: 0, // 0 means it won't auto-dismiss
  });
}

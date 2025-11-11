import { notificationService } from '../services/notification-service.js';

export interface AsyncOperationOptions {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  showLoading?: boolean;
  showSuccess?: boolean;
  showError?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

/**
 * Handle async operations with automatic loading states and notifications
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions = {}
): Promise<{ success: boolean; data?: T; error?: any }> {
  const {
    loadingMessage,
    successMessage,
    errorMessage = 'Ha ocurrido un error',
    showLoading = false,
    showSuccess = true,
    showError = true,
    onSuccess,
    onError,
  } = options;

  try {
    // Show loading notification if requested
    if (showLoading && loadingMessage) {
      notificationService.loading('Procesando', loadingMessage);
    }

    // Execute the operation
    const data = await operation();

    // Show success notification
    if (showSuccess && successMessage) {
      notificationService.success('Éxito', successMessage);
    }

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }

    return { success: true, data };
  } catch (error) {
    console.error('Async operation failed:', error);

    // Show error notification
    if (showError) {
      if (error && typeof error === 'object' && 'apiError' in error) {
        notificationService.handleApiError(
          (error as any).apiError,
          errorMessage
        );
      } else {
        notificationService.error('Error', errorMessage);
      }
    }

    // Call error callback
    if (onError) {
      onError(error);
    }

    return { success: false, error };
  }
}

/**
 * Create a confirmation dialog and execute operation if confirmed
 */
export async function withConfirmation<T>(
  operation: () => Promise<T>,
  confirmOptions: {
    title: string;
    message: string;
    confirmText?: string;
    type?: 'danger' | 'warning' | 'info';
  },
  asyncOptions?: AsyncOperationOptions
): Promise<{ success: boolean; data?: T; error?: any; cancelled?: boolean }> {
  return new Promise((resolve) => {
    // Create and show confirmation dialog
    const confirm = document.createElement('ui-confirm');
    document.body.appendChild(confirm);

    confirm.open({
      ...confirmOptions,
      onConfirm: async () => {
        const result = await handleAsyncOperation(operation, asyncOptions);
        document.body.removeChild(confirm);
        resolve(result);
      },
      onCancel: () => {
        document.body.removeChild(confirm);
        resolve({ success: false, cancelled: true });
      },
    });
  });
}

/**
 * Debounce function for async operations
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timeout) {
      clearTimeout(timeout);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve, reject) => {
        timeout = setTimeout(async () => {
          try {
            const result = await func(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            pendingPromise = null;
            timeout = null;
          }
        }, wait);
      });
    }

    return pendingPromise;
  };
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1, error);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError;
}

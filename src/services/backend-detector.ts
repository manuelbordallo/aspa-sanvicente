/**
 * Backend Detector Service
 * Detects backend availability and manages connection status
 */

import { config } from '../config/index.js';

export interface BackendStatus {
  available: boolean;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}

type StatusListener = (available: boolean) => void;

export class BackendDetectorService {
  private available: boolean = false;
  private lastStatus: BackendStatus | null = null;
  private listeners: Set<StatusListener> = new Set();
  private detectionTimeout: number;
  private maxRetries: number = 3;
  private baseBackoffDelay: number = 1000; // 1 second

  constructor(detectionTimeout?: number) {
    // Use environment variable or default to 2 seconds for quick detection
    this.detectionTimeout =
      detectionTimeout ||
      this.getEnvNumber('VITE_BACKEND_DETECTION_TIMEOUT', 2000);
  }

  /**
   * Get environment variable as number
   */
  private getEnvNumber(key: string, defaultValue: number): number {
    const value = import.meta.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Check if backend is available with health check
   */
  async checkBackendAvailability(): Promise<boolean> {
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.detectionTimeout
      );

      // Try to reach the backend health endpoint or root
      const healthEndpoint = `${config.api.baseUrl}/health`;
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;
      const isAvailable = response.ok;

      this.updateStatus({
        available: isAvailable,
        lastChecked: new Date(),
        responseTime,
        error: isAvailable ? undefined : `HTTP ${response.status}`,
      });

      return isAvailable;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      let errorMessage = 'Unknown error';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error';
        } else {
          errorMessage = error.message;
        }
      }

      this.updateStatus({
        available: false,
        lastChecked: new Date(),
        responseTime,
        error: errorMessage,
      });

      return false;
    }
  }

  /**
   * Check backend availability with retry logic and exponential backoff
   */
  async checkWithRetry(retries?: number): Promise<boolean> {
    const maxAttempts = retries !== undefined ? retries : this.maxRetries;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const isAvailable = await this.checkBackendAvailability();

      if (isAvailable) {
        if (config.debug) {
          console.log(
            `[BackendDetector] Backend available on attempt ${attempt + 1}`
          );
        }
        return true;
      }

      // If not the last attempt, wait with exponential backoff
      if (attempt < maxAttempts - 1) {
        const backoffDelay = this.baseBackoffDelay * Math.pow(2, attempt);
        if (config.debug) {
          console.log(
            `[BackendDetector] Attempt ${attempt + 1} failed. Retrying in ${backoffDelay}ms...`
          );
        }
        await this.sleep(backoffDelay);
      }
    }

    if (config.debug) {
      console.log(
        `[BackendDetector] Backend unavailable after ${maxAttempts} attempts`
      );
    }

    return false;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update status and notify listeners
   */
  private updateStatus(status: BackendStatus): void {
    const previousAvailability = this.available;
    this.available = status.available;
    this.lastStatus = status;

    // Notify listeners if availability changed
    if (previousAvailability !== this.available) {
      this.notifyListeners(this.available);
    }
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(available: boolean): void {
    this.listeners.forEach((listener) => {
      try {
        listener(available);
      } catch (error) {
        console.error('[BackendDetector] Error in status listener:', error);
      }
    });
  }

  /**
   * Get current backend availability status
   */
  isBackendAvailable(): boolean {
    return this.available;
  }

  /**
   * Get last status check result
   */
  getLastStatus(): BackendStatus | null {
    return this.lastStatus;
  }

  /**
   * Add a listener for status changes
   */
  addStatusListener(listener: StatusListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove a status listener
   */
  removeStatusListener(listener: StatusListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Remove all status listeners
   */
  clearListeners(): void {
    this.listeners.clear();
  }

  /**
   * Get number of registered listeners
   */
  getListenerCount(): number {
    return this.listeners.size;
  }
}

// Create and export singleton instance
export const backendDetector = new BackendDetectorService();

import type { AppSettings, Theme } from '../types/index.js';
import { themeService } from './theme-service.js';

export interface LanguageOption {
  value: string;
  label: string;
  flag?: string;
}

export class SettingsService {
  private settings: AppSettings;
  private settingsListeners: ((settings: AppSettings) => void)[] = [];

  constructor() {
    this.settings = this.loadSettings();
    this.initializeSettings();
  }

  /**
   * Load settings from localStorage with defaults
   */
  private loadSettings(): AppSettings {
    const savedSettings = localStorage.getItem('app_settings');

    const defaultSettings: AppSettings = {
      theme: 'system',
      language: 'es',
      currentCourse: '2025-2026',
    };

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        return { ...defaultSettings, ...parsed };
      } catch (error) {
        console.error('Error parsing saved settings:', error);
        return defaultSettings;
      }
    }

    return defaultSettings;
  }

  /**
   * Initialize settings (sync with theme service)
   */
  private initializeSettings(): void {
    // Sync theme with theme service
    if (this.settings.theme !== themeService.getCurrentTheme()) {
      themeService.setTheme(this.settings.theme);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): AppSettings {
    return { ...this.settings };
  }

  /**
   * Update settings and persist to localStorage
   */
  updateSettings(newSettings: Partial<AppSettings>): void {
    const updatedSettings = { ...this.settings, ...newSettings };

    // Handle theme change through theme service
    if (newSettings.theme && newSettings.theme !== this.settings.theme) {
      themeService.setTheme(newSettings.theme);
    }

    this.settings = updatedSettings;
    this.saveSettings();
    this.notifySettingsChange();
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    localStorage.setItem('app_settings', JSON.stringify(this.settings));
  }

  /**
   * Add settings change listener
   */
  addSettingsListener(listener: (settings: AppSettings) => void): void {
    this.settingsListeners.push(listener);
  }

  /**
   * Remove settings change listener
   */
  removeSettingsListener(listener: (settings: AppSettings) => void): void {
    const index = this.settingsListeners.indexOf(listener);
    if (index > -1) {
      this.settingsListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of settings changes
   */
  private notifySettingsChange(): void {
    this.settingsListeners.forEach((listener) => listener(this.settings));
  }

  /**
   * Get available language options
   */
  getLanguageOptions(): LanguageOption[] {
    return [
      { value: 'es', label: 'Español', flag: '🇪🇸' },
      { value: 'en', label: 'English', flag: '🇺🇸' },
      { value: 'ca', label: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
    ];
  }

  /**
   * Get theme options (delegated to theme service)
   */
  getThemeOptions(): Array<{ value: Theme; label: string }> {
    return themeService.getThemeOptions();
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    return this.settings.theme;
  }

  /**
   * Set theme
   */
  setTheme(theme: Theme): void {
    this.updateSettings({ theme });
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.settings.language;
  }

  /**
   * Set language
   */
  setLanguage(language: string): void {
    this.updateSettings({ language });
  }

  /**
   * Get current course
   */
  getCurrentCourse(): string {
    return this.settings.currentCourse;
  }

  /**
   * Set current course (admin only - validation should be done in UI)
   */
  setCurrentCourse(currentCourse: string): void {
    this.updateSettings({ currentCourse });
  }

  /**
   * Reset settings to defaults
   */
  resetSettings(): void {
    const defaultSettings: AppSettings = {
      theme: 'system',
      language: 'es',
      currentCourse: '2025-2026',
    };

    this.settings = defaultSettings;
    this.saveSettings();
    themeService.setTheme(defaultSettings.theme);
    this.notifySettingsChange();
  }

  /**
   * Export settings for backup
   */
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from backup
   */
  importSettings(settingsJson: string): void {
    try {
      const importedSettings = JSON.parse(settingsJson);

      // Validate imported settings
      if (this.validateSettings(importedSettings)) {
        this.updateSettings(importedSettings);
      } else {
        throw new Error('Configuración inválida');
      }
    } catch (error) {
      throw new Error(
        'Error al importar configuración: ' + (error as Error).message
      );
    }
  }

  /**
   * Validate settings object
   */
  private validateSettings(settings: any): boolean {
    if (!settings || typeof settings !== 'object') {
      return false;
    }

    // Check theme
    if (
      settings.theme &&
      !['light', 'dark', 'system'].includes(settings.theme)
    ) {
      return false;
    }

    // Check language
    if (settings.language && typeof settings.language !== 'string') {
      return false;
    }

    // Check current course
    if (settings.currentCourse && typeof settings.currentCourse !== 'string') {
      return false;
    }

    return true;
  }
}

// Create and export default instance
export const settingsService = new SettingsService();

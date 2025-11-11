import type { Theme } from '../types/index.js';

export class ThemeService {
  private currentTheme: Theme = 'system';
  private themeListeners: ((theme: Theme) => void)[] = [];

  constructor() {
    this.initializeTheme();
    this.setupSystemThemeListener();
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('app_theme') as Theme;

    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = 'system';
    }

    this.applyTheme();
  }

  /**
   * Setup listener for system theme changes
   */
  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', () => {
      if (this.currentTheme === 'system') {
        this.applyTheme();
      }
    });
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Set theme and persist to localStorage
   */
  setTheme(theme: Theme): void {
    this.currentTheme = theme;
    localStorage.setItem('app_theme', theme);
    this.applyTheme();
    this.notifyThemeChange();
  }

  /**
   * Get effective theme (resolves 'system' to 'light' or 'dark')
   */
  getEffectiveTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return this.currentTheme;
  }

  /**
   * Apply theme to document
   */
  private applyTheme(): void {
    const effectiveTheme = this.getEffectiveTheme();
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Add current theme class
    root.classList.add(effectiveTheme);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(effectiveTheme);
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  private updateMetaThemeColor(theme: 'light' | 'dark'): void {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    const color = theme === 'dark' ? '#1f2937' : '#ffffff';
    metaThemeColor.setAttribute('content', color);
  }

  /**
   * Add theme change listener
   */
  addThemeListener(listener: (theme: Theme) => void): void {
    this.themeListeners.push(listener);
  }

  /**
   * Remove theme change listener
   */
  removeThemeListener(listener: (theme: Theme) => void): void {
    const index = this.themeListeners.indexOf(listener);
    if (index > -1) {
      this.themeListeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyThemeChange(): void {
    this.themeListeners.forEach((listener) => listener(this.currentTheme));
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const effectiveTheme = this.getEffectiveTheme();
    const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Check if current theme is dark
   */
  isDarkTheme(): boolean {
    return this.getEffectiveTheme() === 'dark';
  }

  /**
   * Get theme options for UI
   */
  getThemeOptions(): Array<{ value: Theme; label: string }> {
    return [
      { value: 'light', label: 'Claro' },
      { value: 'dark', label: 'Oscuro' },
      { value: 'system', label: 'Sistema' },
    ];
  }
}

// Create and export default instance
export const themeService = new ThemeService();

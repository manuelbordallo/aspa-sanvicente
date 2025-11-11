/**
 * Component Diagnostics Utility
 *
 * This utility provides functions to verify that all custom elements
 * are properly registered and can be instantiated.
 */

export interface ComponentDiagnosticResult {
  component: string;
  isRegistered: boolean;
  canInstantiate: boolean;
  error?: string;
}

export interface DiagnosticReport {
  timestamp: Date;
  totalComponents: number;
  registeredComponents: number;
  failedComponents: string[];
  results: ComponentDiagnosticResult[];
}

/**
 * List of all custom elements used in the application
 */
const EXPECTED_COMPONENTS = [
  // Views
  'login-view',
  'news-view',
  'notices-view',
  'calendar-view',
  'users-view',
  'settings-view',
  'profile-view',

  // Layout components
  'app-navigation',
  'app-header',

  // UI components
  'ui-button',
  'ui-card',
  'ui-input',
  'ui-loading',
  'ui-toast',
  'ui-modal',
  'ui-confirm',
  'ui-select',
  'ui-empty-state',
  'connection-status',

  // Forms
  'login-form',
  'news-form',
  'notice-form',
  'event-form',

  // Main app
  'school-app',
];

/**
 * Check if a custom element is registered
 */
export function isComponentRegistered(componentName: string): boolean {
  return customElements.get(componentName) !== undefined;
}

/**
 * Attempt to instantiate a component to verify it works
 */
export function canInstantiateComponent(componentName: string): {
  success: boolean;
  error?: string;
} {
  try {
    const ComponentClass = customElements.get(componentName);
    if (!ComponentClass) {
      return { success: false, error: 'Component not registered' };
    }

    // Try to create an instance
    const instance = new ComponentClass();

    // Verify it's an HTMLElement
    if (!(instance instanceof HTMLElement)) {
      return { success: false, error: 'Component is not an HTMLElement' };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run diagnostics on a single component
 */
export function diagnoseComponent(
  componentName: string
): ComponentDiagnosticResult {
  const isRegistered = isComponentRegistered(componentName);

  if (!isRegistered) {
    return {
      component: componentName,
      isRegistered: false,
      canInstantiate: false,
      error: 'Component not registered in customElements registry',
    };
  }

  const instantiationResult = canInstantiateComponent(componentName);

  return {
    component: componentName,
    isRegistered: true,
    canInstantiate: instantiationResult.success,
    error: instantiationResult.error,
  };
}

/**
 * Run diagnostics on all expected components
 */
export function runFullDiagnostics(): DiagnosticReport {
  const results = EXPECTED_COMPONENTS.map(diagnoseComponent);

  const registeredComponents = results.filter((r) => r.isRegistered).length;
  const failedComponents = results
    .filter((r) => !r.isRegistered || !r.canInstantiate)
    .map((r) => r.component);

  return {
    timestamp: new Date(),
    totalComponents: EXPECTED_COMPONENTS.length,
    registeredComponents,
    failedComponents,
    results,
  };
}

/**
 * Print diagnostic report to console
 */
export function printDiagnosticReport(report: DiagnosticReport): void {
  console.group('🔍 Component Diagnostics Report');
  console.log('Timestamp:', report.timestamp.toISOString());
  console.log('Total Components:', report.totalComponents);
  console.log('Registered:', report.registeredComponents);
  console.log('Failed:', report.failedComponents.length);

  if (report.failedComponents.length > 0) {
    console.group('❌ Failed Components');
    report.results
      .filter((r) => !r.isRegistered || !r.canInstantiate)
      .forEach((result) => {
        console.log(`- ${result.component}:`, result.error || 'Unknown error');
      });
    console.groupEnd();
  }

  console.group('✅ Successful Components');
  report.results
    .filter((r) => r.isRegistered && r.canInstantiate)
    .forEach((result) => {
      console.log(`- ${result.component}`);
    });
  console.groupEnd();

  console.groupEnd();
}

/**
 * Wait for a component to be registered (with timeout)
 */
export function waitForComponent(
  componentName: string,
  timeoutMs: number = 5000
): Promise<boolean> {
  return new Promise((resolve) => {
    if (isComponentRegistered(componentName)) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isComponentRegistered(componentName)) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Expose diagnostics to window for manual testing
 */
export function exposeDiagnosticsToWindow(): void {
  (window as any).componentDiagnostics = {
    isRegistered: isComponentRegistered,
    canInstantiate: canInstantiateComponent,
    diagnose: diagnoseComponent,
    runFull: runFullDiagnostics,
    printReport: printDiagnosticReport,
    waitFor: waitForComponent,
  };

  console.log(
    '✅ Component diagnostics exposed to window.componentDiagnostics'
  );
  console.log('Available methods:');
  console.log('  - isRegistered(componentName)');
  console.log('  - canInstantiate(componentName)');
  console.log('  - diagnose(componentName)');
  console.log('  - runFull()');
  console.log('  - printReport(report)');
  console.log('  - waitFor(componentName, timeoutMs)');
}

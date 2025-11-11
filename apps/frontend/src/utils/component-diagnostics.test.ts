import { expect } from '@esm-bundle/chai';
import {
  isComponentRegistered,
  canInstantiateComponent,
  diagnoseComponent,
  runFullDiagnostics,
  waitForComponent,
} from './component-diagnostics';

describe('Component Diagnostics', () => {
  // Define a test component
  class TestComponent extends HTMLElement {
    constructor() {
      super();
    }
  }

  before(() => {
    // Register a test component
    if (!customElements.get('test-component')) {
      customElements.define('test-component', TestComponent);
    }
  });

  describe('isComponentRegistered', () => {
    it('should return true for registered components', () => {
      const result = isComponentRegistered('test-component');
      expect(result).to.be.true;
    });

    it('should return false for unregistered components', () => {
      const result = isComponentRegistered('non-existent-component');
      expect(result).to.be.false;
    });
  });

  describe('canInstantiateComponent', () => {
    it('should successfully instantiate registered components', () => {
      const result = canInstantiateComponent('test-component');
      expect(result.success).to.be.true;
      expect(result.error).to.be.undefined;
    });

    it('should fail for unregistered components', () => {
      const result = canInstantiateComponent('non-existent-component');
      expect(result.success).to.be.false;
      expect(result.error).to.equal('Component not registered');
    });
  });

  describe('diagnoseComponent', () => {
    it('should provide full diagnostic for registered component', () => {
      const result = diagnoseComponent('test-component');
      expect(result.component).to.equal('test-component');
      expect(result.isRegistered).to.be.true;
      expect(result.canInstantiate).to.be.true;
      expect(result.error).to.be.undefined;
    });

    it('should provide diagnostic for unregistered component', () => {
      const result = diagnoseComponent('non-existent-component');
      expect(result.component).to.equal('non-existent-component');
      expect(result.isRegistered).to.be.false;
      expect(result.canInstantiate).to.be.false;
      expect(result.error).to.include('not registered');
    });
  });

  describe('runFullDiagnostics', () => {
    it('should return a diagnostic report', () => {
      const report = runFullDiagnostics();
      expect(report).to.have.property('timestamp');
      expect(report).to.have.property('totalComponents');
      expect(report).to.have.property('registeredComponents');
      expect(report).to.have.property('failedComponents');
      expect(report).to.have.property('results');
      expect(report.results).to.be.an('array');
      expect(report.totalComponents).to.be.greaterThan(0);
    });

    it('should verify report structure is correct', () => {
      const report = runFullDiagnostics();
      // Verify the report structure is correct
      expect(report.results.length).to.equal(report.totalComponents);
    });
  });

  describe('waitForComponent', () => {
    it('should resolve immediately for already registered component', async () => {
      const startTime = Date.now();
      const result = await waitForComponent('test-component', 1000);
      const elapsed = Date.now() - startTime;

      expect(result).to.be.true;
      expect(elapsed).to.be.lessThan(100); // Should be nearly instant
    });

    it('should timeout for non-existent component', async () => {
      const startTime = Date.now();
      const result = await waitForComponent('never-exists-component', 500);
      const elapsed = Date.now() - startTime;

      expect(result).to.be.false;
      expect(elapsed).to.be.at.least(500); // Should wait full timeout
    });

    it('should detect component registered during wait', async () => {
      // Define a component after a delay
      setTimeout(() => {
        if (!customElements.get('delayed-component')) {
          class DelayedComponent extends HTMLElement {}
          customElements.define('delayed-component', DelayedComponent);
        }
      }, 200);

      const result = await waitForComponent('delayed-component', 1000);
      expect(result).to.be.true;
    });
  });
});

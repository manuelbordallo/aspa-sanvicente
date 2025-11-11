# Guía Rápida de Diagnóstico de Componentes

## Resumen

Esta guía proporciona instrucciones rápidas para usar las herramientas de diagnóstico de componentes implementadas en la aplicación.

## Acceso Rápido

Las herramientas de diagnóstico están disponibles en la consola del navegador a través del objeto global `componentDiagnostics` (solo en modo desarrollo).

## Comandos Principales

### Verificar un Componente Específico

```javascript
// Verificar si está registrado
componentDiagnostics.isRegistered('notices-view');

// Diagnóstico completo
componentDiagnostics.diagnose('notices-view');
```

### Diagnóstico Completo del Sistema

```javascript
// Ejecutar diagnóstico de todos los componentes
const report = componentDiagnostics.runFull();

// Imprimir reporte formateado
componentDiagnostics.printReport(report);
```

### Esperar Carga de Componente

```javascript
// Útil para componentes con lazy loading
await componentDiagnostics.waitFor('notices-view', 5000);
```

## Componentes Monitoreados

El sistema verifica automáticamente estos componentes:

**Vistas:**

- login-view
- news-view
- notices-view
- calendar-view
- users-view
- settings-view
- profile-view

**Layout:**

- app-navigation
- app-header

**UI:**

- ui-button, ui-card, ui-input, ui-loading, ui-toast
- ui-modal, ui-confirm, ui-select, ui-empty-state
- connection-status

**Formularios:**

- login-form, news-form, notice-form, event-form

**Principal:**

- school-app

## Solución de Problemas Comunes

### Componente No Se Registra

```javascript
// 1. Verificar si está registrado
componentDiagnostics.isRegistered('notices-view');
// false

// 2. Esperar a que se cargue
await componentDiagnostics.waitFor('notices-view', 5000);

// 3. Si sigue sin registrarse, revisar logs del router
// Buscar: [Router] Error loading component
```

### Componente Registrado Pero No Se Renderiza

```javascript
// 1. Verificar que puede instanciarse
componentDiagnostics.canInstantiate('notices-view');

// 2. Verificar en el DOM
document.querySelector('notices-view');

// 3. Revisar logs del componente
// Buscar: [NoticesView] connectedCallback called
```

### Pantalla en Blanco

```javascript
// 1. Ejecutar diagnóstico completo
const report = componentDiagnostics.runFull();
componentDiagnostics.printReport(report);

// 2. Verificar componentes fallidos
console.log(report.failedComponents);

// 3. Revisar logs del SchoolApp
// Buscar: [SchoolApp] renderCurrentView called
```

## Integración con Tests

El módulo de diagnóstico también está disponible para tests automatizados:

```typescript
import {
  diagnoseComponent,
  runFullDiagnostics,
} from './utils/component-diagnostics';

// En un test
const result = diagnoseComponent('notices-view');
expect(result.isRegistered).to.be.true;
```

## Archivos Relacionados

- **Implementación**: `src/utils/component-diagnostics.ts`
- **Tests**: `src/utils/component-diagnostics.test.ts`
- **Inicialización**: `src/main.ts`
- **Documentación Completa**: `VERIFICATION.md`

## Notas

- Las herramientas de diagnóstico solo están disponibles en modo desarrollo
- Los logs detallados se pueden encontrar en la consola del navegador
- Para producción, considera remover o deshabilitar los logs de diagnóstico

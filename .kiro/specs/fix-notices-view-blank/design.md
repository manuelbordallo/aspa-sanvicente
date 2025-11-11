# Design Document

## Overview

El problema de la vista de avisos en blanco se debe a que el componente `notices-view` no se está renderizando correctamente en el DOM. Aunque el router está cargando el componente y el log muestra que `renderCurrentView` se está ejecutando, el contenido no aparece en pantalla.

Después de analizar el código, se identificaron las siguientes causas potenciales:

1. **Problema de renderizado en SchoolApp**: El método `renderCurrentView()` en `school-app.ts` usa un switch statement que retorna el template HTML del componente, pero el componente `notices-view` podría no estar renderizándose correctamente
2. **Problema de carga lazy**: El componente podría no estar completamente cargado cuando se intenta renderizar
3. **Problema de contexto**: El componente depende del contexto de autenticación que podría no estar disponible correctamente

## Architecture

La solución se enfocará en tres áreas:

1. **Verificación de carga del componente**: Asegurar que el componente está completamente registrado antes de renderizarlo
2. **Mejora del logging**: Agregar logs más detallados para diagnosticar el problema
3. **Corrección del renderizado**: Asegurar que el template HTML se renderiza correctamente en el DOM

## Components and Interfaces

### 1. SchoolApp Component

**Modificaciones necesarias:**

- Agregar verificación de que el custom element está registrado antes de renderizarlo
- Mejorar el logging en `renderCurrentView()` para mostrar el estado del componente
- Agregar manejo de errores para componentes que no se cargan correctamente

**Método `renderCurrentView()` mejorado:**

```typescript
private renderCurrentView() {
  console.log('[SchoolApp] renderCurrentView called, component:', this.currentRouteComponent, 'loading:', this.routeLoading);

  // Verificar que el componente está registrado
  if (!customElements.get(this.currentRouteComponent)) {
    console.warn('[SchoolApp] Component not registered yet:', this.currentRouteComponent);
    return html`<ui-loading size="lg" message="Cargando componente..."></ui-loading>`;
  }

  // Show loading state while route is loading
  if (this.routeLoading) {
    return html`<ui-loading size="lg" message="Cargando vista..."></ui-loading>`;
  }

  // Renderizar el componente
  switch (this.currentRouteComponent) {
    case 'notices-view':
      console.log('[SchoolApp] Rendering notices-view');
      return html`<notices-view></notices-view>`;
    // ... otros casos
  }
}
```

### 2. NoticesView Component

**Modificaciones necesarias:**

- Agregar más logging en el ciclo de vida del componente
- Verificar que el contexto de autenticación está disponible
- Agregar manejo de errores en el renderizado

**Mejoras en el logging:**

```typescript
connectedCallback() {
  console.log('[NoticesView] connectedCallback called');
  console.log('[NoticesView] authState:', this.authState);
  super.connectedCallback();
  console.log('[NoticesView] About to load notices and unread count...');
  await this.loadNotices();
  await this.loadUnreadCount();
  console.log('[NoticesView] Load complete');
}

render() {
  console.log('[NoticesView] Rendering, notices count:', this.notices.length, 'loading:', this.loading, 'authenticated:', this.authState?.isAuthenticated);
  console.log('[NoticesView] Full authState:', this.authState);

  // ... resto del render
}
```

### 3. Router

**Modificaciones necesarias:**

- Agregar verificación de que el componente se cargó correctamente
- Mejorar el manejo de errores en la carga lazy
- Agregar timeout para detectar componentes que no se cargan

**Mejora en `handleRouteChange()`:**

```typescript
private async handleRouteChange(): Promise<void> {
  if (this.loadingRoute) return;

  const path = window.location.pathname;
  const route = this.findRoute(path);

  if (route) {
    // ... verificaciones de guard

    // Lazy load component if needed
    if (route.lazyLoad && !this.loadedComponents.has(route.component)) {
      this.loadingRoute = true;
      try {
        console.log('[Router] Loading component:', route.component);
        await route.lazyLoad();

        // Verificar que el componente se registró
        if (!customElements.get(route.component)) {
          throw new Error(`Component ${route.component} failed to register`);
        }

        this.loadedComponents.add(route.component);
        console.log('[Router] Component loaded successfully:', route.component);
      } catch (error) {
        console.error(`Error loading component ${route.component}:`, error);
      } finally {
        this.loadingRoute = false;
      }
    }

    this.currentRoute = route;
  }

  this.notifyListeners();
}
```

## Data Models

No se requieren cambios en los modelos de datos.

## Error Handling

### Errores de carga de componentes

- Si un componente no se carga en 5 segundos, mostrar un mensaje de error
- Si un componente no se registra correctamente, mostrar un mensaje de error específico
- Proporcionar un botón de "Reintentar" para volver a cargar el componente

### Errores de renderizado

- Si el render falla, capturar el error y mostrarlo en consola
- Mostrar un mensaje de error amigable al usuario
- Permitir al usuario navegar a otra vista

## Testing Strategy

### Pruebas manuales

1. Navegar a la vista de avisos desde el menú
2. Verificar que el componente se carga correctamente
3. Verificar que los logs muestran el proceso completo de carga
4. Verificar que los avisos se muestran correctamente

### Pruebas de diagnóstico

1. Verificar en la consola del navegador que:
   - El módulo `notices-view.js` se carga
   - El custom element `notices-view` se registra
   - El método `connectedCallback` se ejecuta
   - El método `render` se ejecuta
   - Los datos se cargan correctamente

### Casos de prueba específicos

1. **Caso 1**: Usuario autenticado navega a /notices
   - Resultado esperado: Vista se muestra con avisos o estado vacío

2. **Caso 2**: Usuario no autenticado intenta acceder a /notices
   - Resultado esperado: Redirección a login

3. **Caso 3**: Error al cargar avisos
   - Resultado esperado: Mensaje de error visible

## Implementation Notes

- La solución debe ser mínimamente invasiva
- Priorizar el diagnóstico antes de hacer cambios grandes
- Mantener la compatibilidad con otras vistas que funcionan correctamente
- Asegurar que los logs sean informativos pero no excesivos en producción

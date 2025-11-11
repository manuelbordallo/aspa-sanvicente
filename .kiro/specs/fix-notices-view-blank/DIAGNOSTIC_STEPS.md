# Pasos de Diagnóstico para Vista de Avisos en Blanco

## Problema Reportado

La vista de avisos no muestra ningún dato cuando el usuario navega a `/notices`.

## Pasos de Diagnóstico

### 1. Verificar el Modo de Operación (Mock vs Backend Real)

Abre la consola del navegador y ejecuta:

```javascript
// Verificar si estás en modo mock
localStorage.getItem('mock_mode');

// Verificar configuración
console.log('Mock mode:', import.meta.env.VITE_ENABLE_MOCK_MODE);
```

**Resultado esperado**: Deberías ver `"true"` o `"false"` indicando el modo actual.

### 2. Verificar Datos en LocalStorage (Solo Modo Mock)

Si estás en modo mock, verifica que hay datos de avisos:

```javascript
// Ver datos de avisos en localStorage
const noticesData = localStorage.getItem('mock_notices_data');
console.log('Notices data:', JSON.parse(noticesData || '[]'));
```

**Resultado esperado**: Deberías ver un array con al menos 2 avisos de demostración.

### 3. Verificar Registro del Componente

```javascript
// Verificar que el componente está registrado
customElements.get('notices-view');

// Usar herramientas de diagnóstico
componentDiagnostics.diagnose('notices-view');
```

**Resultado esperado**: El componente debería estar registrado y poder instanciarse.

### 4. Verificar Logs en la Consola

Navega a `/notices` y busca estos logs en la consola:

- `[NoticesView] Module loaded`
- `[NoticesView] Constructor called`
- `[NoticesView] connectedCallback called`
- `[NoticesView] loadInitialData called`
- `[NoticesView] loadNotices called`
- `[NoticesView] Received response:`
- `[NoticesView] Notices loaded: X items`
- `[NoticesView] render() called`

**Si falta alguno de estos logs**, anota cuál es el último que aparece.

### 5. Verificar Estado de Autenticación

```javascript
// Verificar token de autenticación
localStorage.getItem('auth_token');

// Verificar estado de autenticación en el componente
const noticesView = document.querySelector('notices-view');
if (noticesView) {
  console.log('Auth state:', noticesView.authState);
  console.log('Notices:', noticesView.notices);
  console.log('Loading:', noticesView.loading);
  console.log('Error:', noticesView.error);
}
```

**Resultado esperado**: Deberías ver un token y el authState debería mostrar `isAuthenticated: true`.

### 6. Verificar Elemento en el DOM

```javascript
// Verificar que el componente está en el DOM
const noticesView = document.querySelector('notices-view');
console.log('Component in DOM:', noticesView);

// Verificar shadow DOM
if (noticesView) {
  console.log('Shadow root:', noticesView.shadowRoot);
  console.log('Shadow root children:', noticesView.shadowRoot?.children);
}
```

**Resultado esperado**: El componente debería estar en el DOM con un shadow root que contiene elementos.

### 7. Forzar Recarga de Datos

Si el componente está en el DOM pero no muestra datos:

```javascript
const noticesView = document.querySelector('notices-view');
if (noticesView) {
  // Forzar recarga
  noticesView.loadNotices();
}
```

## Soluciones Comunes

### Problema: No hay datos en localStorage (Modo Mock)

**Solución**: Reinicializar datos de avisos

```javascript
const INITIAL_NOTICES = [
  {
    id: '1',
    content:
      'Bienvenido al sistema de avisos. Este es un aviso de demostración.',
    author: {
      id: '1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date('2024-01-01').toISOString(),
    },
    recipients: [
      {
        id: '2',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        role: 'user',
        isActive: true,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
      },
    ],
    isRead: false,
    createdAt: new Date('2024-11-08').toISOString(),
  },
  {
    id: '2',
    content:
      'Recuerda que estás en modo de desarrollo. Los datos se guardan localmente.',
    author: {
      id: '1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date('2024-01-01').toISOString(),
    },
    recipients: [
      {
        id: '2',
        email: 'user@example.com',
        firstName: 'Regular',
        lastName: 'User',
        role: 'user',
        isActive: true,
        createdAt: new Date('2024-01-01').toISOString(),
        updatedAt: new Date('2024-01-01').toISOString(),
      },
    ],
    isRead: false,
    createdAt: new Date('2024-11-09').toISOString(),
  },
];

localStorage.setItem('mock_notices_data', JSON.stringify(INITIAL_NOTICES));
location.reload();
```

### Problema: Componente no se renderiza

**Solución**: Verificar que el router cargó el componente

```javascript
// Verificar rutas cargadas
const router = window.__router__; // Si está expuesto globalmente
console.log('Loaded components:', router?.loadedComponents);
```

### Problema: AuthState no disponible

**Solución**: Verificar que el usuario está autenticado

```javascript
// Verificar autenticación
const token = localStorage.getItem('auth_token');
if (!token) {
  console.log('No auth token found - user needs to login');
  // Navegar a login
  window.location.href = '/login';
}
```

## Próximos Pasos

Una vez que hayas ejecutado estos pasos de diagnóstico, anota:

1. ¿En qué modo estás operando? (Mock o Backend Real)
2. ¿Qué logs aparecen en la consola?
3. ¿Cuál es el último log que aparece antes de que falle?
4. ¿Hay algún error en la consola?
5. ¿El componente está en el DOM?
6. ¿Hay datos en localStorage (si estás en modo mock)?

Con esta información, podremos identificar la causa exacta del problema y aplicar la solución correcta.

# Sistema de Notificaciones y Feedback

Este documento describe el sistema de notificaciones y feedback implementado en la aplicación de gestión escolar.

## Componentes Implementados

### 1. UIToast Component (`src/components/ui/ui-toast.ts`)

Componente de notificaciones toast que muestra mensajes temporales en la esquina superior derecha (o inferior en móviles).

**Características:**

- 4 tipos de notificaciones: success, error, warning, info
- Animaciones de entrada/salida suaves
- Auto-cierre configurable
- Diseño responsive (superior derecha en desktop, inferior en móvil)
- Soporte para modo oscuro
- Iconos visuales para cada tipo

### 2. UIConfirm Component (`src/components/ui/ui-confirm.ts`)

Componente de diálogo de confirmación para acciones destructivas o importantes.

**Características:**

- 3 tipos visuales: danger, warning, info
- Botones personalizables (texto y acciones)
- Soporte para operaciones asíncronas con estado de carga
- Previene cierre durante operaciones en progreso
- Modal centrado con overlay

### 3. NotificationService (`src/services/notification-service.ts`)

Servicio centralizado para gestionar notificaciones desde cualquier parte de la aplicación.

**Métodos principales:**

- `success(title, message, duration?)` - Notificación de éxito
- `error(title, message, duration?)` - Notificación de error
- `warning(title, message, duration?)` - Notificación de advertencia
- `info(title, message, duration?)` - Notificación informativa
- `loading(title, message)` - Notificación de carga (no se cierra automáticamente)
- `handleApiError(error, defaultMessage?)` - Manejo automático de errores de API

### 4. Async Handler Utilities (`src/utils/async-handler.ts`)

Utilidades para manejar operaciones asíncronas con feedback automático.

**Funciones:**

- `handleAsyncOperation()` - Ejecuta operaciones con notificaciones automáticas
- `withConfirmation()` - Combina confirmación con operación asíncrona
- `debounceAsync()` - Debounce para operaciones asíncronas
- `retryOperation()` - Reintentos automáticos con backoff exponencial

## Integración en Vistas

### News View

- ✅ Notificación de éxito al crear noticia
- ✅ Notificación de error en caso de fallo

### Notices View

- ✅ Notificación al marcar aviso como leído
- ✅ Notificación al crear nuevo aviso
- ✅ Manejo de errores con notificaciones

### Calendar View

- ✅ Notificación al crear evento
- ✅ Manejo de errores con notificaciones

### Users View

- ✅ Confirmación antes de cambiar rol de usuario
- ✅ Notificaciones de éxito/error en operaciones
- ✅ Reemplazo del sistema de notificaciones local por el global

### Settings View

- ✅ Confirmación antes de restablecer configuración
- ✅ Notificaciones al guardar configuración
- ✅ Reemplazo del sistema de notificaciones local por el global

### Profile View

- ✅ Confirmación antes de cerrar sesión
- ✅ Notificaciones al actualizar perfil
- ✅ Notificaciones al cambiar contraseña

## Uso Básico

### Mostrar una notificación simple

```typescript
import { notificationService } from '../services/notification-service.js';

// Éxito
notificationService.success('Título', 'Mensaje de éxito');

// Error
notificationService.error('Error', 'Algo salió mal');

// Advertencia
notificationService.warning('Advertencia', 'Ten cuidado');

// Información
notificationService.info('Info', 'Dato importante');
```

### Mostrar confirmación antes de una acción

```typescript
const confirm = document.createElement('ui-confirm');
document.body.appendChild(confirm);

confirm.open({
  title: 'Confirmar eliminación',
  message: '¿Estás seguro de que deseas eliminar este elemento?',
  confirmText: 'Eliminar',
  cancelText: 'Cancelar',
  type: 'danger',
  onConfirm: async () => {
    // Realizar acción
    await deleteItem();
    notificationService.success(
      'Eliminado',
      'Elemento eliminado correctamente'
    );
    document.body.removeChild(confirm);
  },
  onCancel: () => {
    document.body.removeChild(confirm);
  },
});
```

### Operación asíncrona con feedback automático

```typescript
import { handleAsyncOperation } from '../utils/async-handler.js';

const result = await handleAsyncOperation(
  async () => {
    return await saveData();
  },
  {
    loadingMessage: 'Guardando...',
    successMessage: 'Datos guardados correctamente',
    errorMessage: 'Error al guardar',
    showLoading: true,
    showSuccess: true,
    showError: true,
  }
);
```

### Confirmación con operación asíncrona

```typescript
import { withConfirmation } from '../utils/async-handler.js';

const result = await withConfirmation(
  async () => {
    await deleteItem();
  },
  {
    title: 'Eliminar elemento',
    message: '¿Estás seguro?',
    type: 'danger',
  },
  {
    successMessage: 'Elemento eliminado',
    errorMessage: 'Error al eliminar',
  }
);
```

## Requisitos Cumplidos

✅ **1.3** - Mantener sesiones seguras con feedback de errores  
✅ **4.4** - Feedback visual al marcar avisos como leídos  
✅ **6.5** - Persistencia de configuraciones con notificaciones de confirmación

## Características Adicionales

- **Estados de carga**: Todos los botones muestran estado de carga durante operaciones asíncronas
- **Confirmaciones**: Acciones destructivas requieren confirmación del usuario
- **Manejo de errores**: Errores de API se manejan automáticamente con mensajes apropiados
- **Responsive**: Notificaciones se adaptan a dispositivos móviles
- **Accesibilidad**: Componentes incluyen atributos ARIA apropiados
- **Modo oscuro**: Soporte completo para tema oscuro

## Ejemplos de Uso

Ver `src/utils/notification-examples.ts` para ejemplos completos de todas las funcionalidades.

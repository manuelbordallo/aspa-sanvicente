# Design Document

## Overview

Este diseño implementa un sistema de fallback robusto que permite que la aplicación funcione sin un backend disponible. La solución incluye detección automática de disponibilidad del backend, un servicio de autenticación mock, y manejo mejorado de errores de conexión.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Application                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              Auth Service Wrapper                   │ │
│  │  ┌──────────────┐      ┌──────────────┐           │ │
│  │  │ Backend      │      │ Mock Auth    │           │ │
│  │  │ Detector     │─────▶│ Service      │           │ │
│  │  └──────────────┘      └──────────────┘           │ │
│  │         │                      │                   │ │
│  │         │                      │                   │ │
│  │         ▼                      ▼                   │ │
│  │  ┌──────────────┐      ┌──────────────┐           │ │
│  │  │ Real Auth    │      │ Mock Data    │           │ │
│  │  │ Service      │      │ Store        │           │ │
│  │  └──────────────┘      └──────────────┘           │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Backend API     │
              │  (Optional)      │
              └──────────────────┘
```

### Component Flow

1. **Startup**: La aplicación intenta detectar si el backend está disponible
2. **Detection**: Se realiza una llamada rápida de health check al backend
3. **Fallback**: Si el backend no responde, se activa el modo mock automáticamente
4. **Operation**: Todas las operaciones usan el servicio apropiado (real o mock)

## Components and Interfaces

### 1. Backend Detector Service

**Purpose**: Detectar si el backend está disponible y gestionar el estado de conexión

**Interface**:

```typescript
interface BackendDetectorService {
  checkBackendAvailability(): Promise<boolean>;
  isBackendAvailable(): boolean;
  addStatusListener(listener: (available: boolean) => void): void;
  removeStatusListener(listener: (available: boolean) => void): void;
}
```

**Responsibilities**:

- Realizar health checks al backend
- Mantener el estado de disponibilidad del backend
- Notificar a los listeners cuando cambia el estado
- Implementar retry logic con backoff exponencial

### 2. Mock Auth Service

**Purpose**: Proporcionar un servicio de autenticación simulado para desarrollo

**Interface**:

```typescript
interface MockAuthService {
  login(credentials: LoginFormData): Promise<User>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
  getCurrentUser(): User | null;
  validateToken(): Promise<boolean>;
  // ... otros métodos del AuthService
}
```

**Mock Data**:

```typescript
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@example.com',
    password: 'user123',
    firstName: 'Regular',
    lastName: 'User',
    role: 'user',
  },
];
```

### 3. Auth Service Factory

**Purpose**: Crear y proporcionar la instancia correcta del servicio de autenticación

**Interface**:

```typescript
interface AuthServiceFactory {
  getAuthService(): AuthService | MockAuthService;
  isMockMode(): boolean;
}
```

**Logic**:

- Verifica la variable de entorno `VITE_ENABLE_MOCK_MODE`
- Verifica la disponibilidad del backend
- Retorna el servicio apropiado

### 4. Enhanced API Client

**Purpose**: Mejorar el cliente API con mejor manejo de errores y timeouts

**Changes**:

- Timeout más corto para detección inicial (2 segundos)
- Mejor manejo de errores de red
- Logging mejorado de errores
- Retry logic configurable

### 5. Connection Status Component

**Purpose**: Mostrar el estado de conexión del backend al usuario

**Interface**:

```typescript
@customElement('connection-status')
class ConnectionStatus extends LitElement {
  @property({ type: Boolean }) connected: boolean;
  @property({ type: Boolean }) mockMode: boolean;
}
```

**Display**:

- Badge en la esquina superior derecha
- Verde: Conectado al backend
- Amarillo: Modo mock activo
- Rojo: Error de conexión

## Data Models

### Backend Status

```typescript
interface BackendStatus {
  available: boolean;
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}
```

### Mock Session

```typescript
interface MockSession {
  user: User;
  token: string;
  expiresAt: Date;
}
```

## Error Handling

### Connection Errors

1. **Initial Load**:
   - Timeout: 2 segundos
   - Fallback: Activar modo mock automáticamente
   - User Feedback: Mostrar badge de modo mock

2. **During Operation**:
   - Timeout: 5 segundos
   - Retry: 2 intentos con backoff
   - Fallback: Usar datos mock si está disponible
   - User Feedback: Toast notification con opción de reintentar

3. **Network Errors**:
   - Detectar offline status
   - Mostrar mensaje apropiado
   - Permitir operación en modo offline con datos locales

### Error Messages

```typescript
const ERROR_MESSAGES = {
  BACKEND_UNAVAILABLE:
    'No se puede conectar con el servidor. Usando modo de desarrollo.',
  NETWORK_ERROR: 'Error de red. Verifica tu conexión a internet.',
  TIMEOUT: 'La solicitud tardó demasiado. Intenta nuevamente.',
  AUTH_FAILED: 'Error de autenticación. Verifica tus credenciales.',
};
```

## Configuration

### Environment Variables

```bash
# Enable mock mode (overrides backend detection)
VITE_ENABLE_MOCK_MODE=false

# Backend detection timeout (ms)
VITE_BACKEND_DETECTION_TIMEOUT=2000

# API request timeout (ms)
VITE_API_TIMEOUT=5000

# Enable connection status indicator
VITE_SHOW_CONNECTION_STATUS=true
```

### Mock Mode Activation

Mock mode se activa cuando:

1. `VITE_ENABLE_MOCK_MODE=true` en .env
2. Backend no responde al health check inicial
3. Usuario activa manualmente desde dev tools

## Testing Strategy

### Unit Tests

1. **Backend Detector**:
   - Test health check con backend disponible
   - Test health check con backend no disponible
   - Test retry logic
   - Test listener notifications

2. **Mock Auth Service**:
   - Test login con credenciales válidas
   - Test login con credenciales inválidas
   - Test logout
   - Test token validation

3. **Auth Service Factory**:
   - Test selección de servicio basado en configuración
   - Test fallback a mock cuando backend no disponible

### Integration Tests

1. **Startup Flow**:
   - Test carga inicial con backend disponible
   - Test carga inicial sin backend
   - Test transición de mock a real cuando backend se conecta

2. **Error Scenarios**:
   - Test timeout durante login
   - Test pérdida de conexión durante operación
   - Test reconexión después de error

### Manual Testing

1. Iniciar app sin backend → Debe mostrar login con modo mock
2. Login con credenciales mock → Debe funcionar
3. Iniciar backend → Debe detectar y cambiar a modo real
4. Detener backend durante operación → Debe manejar error gracefully

## Implementation Notes

### Phase 1: Backend Detection

- Implementar BackendDetectorService
- Agregar health check endpoint detection
- Implementar retry logic

### Phase 2: Mock Services

- Crear MockAuthService con datos de prueba
- Implementar mock data stores para otros servicios
- Agregar logging de modo mock

### Phase 3: Integration

- Crear AuthServiceFactory
- Integrar detector con factory
- Actualizar school-app para usar factory

### Phase 4: UI Feedback

- Crear ConnectionStatus component
- Agregar indicadores visuales
- Mejorar mensajes de error

### Phase 5: Configuration

- Agregar variables de entorno
- Documentar configuración
- Crear guía de desarrollo sin backend

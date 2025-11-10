# Guía de Desarrollo

Esta guía proporciona información detallada para desarrollar la aplicación sin necesidad de un backend activo.

## Desarrollo sin Backend

La aplicación incluye un **modo mock** que permite desarrollar y probar la interfaz de usuario sin necesidad de tener un servidor backend en ejecución. Este modo es especialmente útil para:

- Desarrollo de frontend independiente
- Pruebas de UI/UX
- Demos y presentaciones
- Desarrollo cuando el backend no está disponible

### Activación del Modo Mock

El modo mock se puede activar de dos formas:

#### 1. Activación Automática

Por defecto, la aplicación detecta automáticamente si el backend está disponible. Si no puede conectarse al backend después de 2 segundos, activa el modo mock automáticamente.

```bash
# Simplemente inicia la aplicación sin backend
npm run dev
```

#### 2. Activación Manual

Puedes forzar el modo mock mediante variables de entorno:

```bash
# En .env.development
VITE_ENABLE_MOCK_MODE=true
```

O al iniciar el servidor:

```bash
VITE_ENABLE_MOCK_MODE=true npm run dev
```

### Indicadores del Modo Mock

Cuando el modo mock está activo, verás:

1. **Badge de conexión** en la esquina superior derecha con estado "Modo Mock"
2. **Mensaje en la consola**: "🔧 Running in MOCK mode"
3. **Ayuda en el login** mostrando las credenciales de prueba disponibles

## Credenciales Mock

El modo mock incluye usuarios de prueba predefinidos:

### Usuario Administrador

```
Email: admin@example.com
Contraseña: admin123
Rol: admin
```

**Permisos**: Acceso completo a todas las funcionalidades, incluyendo gestión de usuarios.

### Usuario Regular

```
Email: user@example.com
Contraseña: user123
Rol: user
```

**Permisos**: Acceso a funcionalidades básicas (noticias, calendario, avisos).

### Datos Mock Disponibles

El modo mock incluye datos de ejemplo para:

- **Noticias**: 3 noticias de ejemplo
- **Avisos**: 2 avisos de ejemplo
- **Eventos de calendario**: 4 eventos de ejemplo
- **Usuarios**: 2 usuarios (admin y regular)

Los datos se persisten en `localStorage`, por lo que las modificaciones se mantienen entre sesiones.

## Configuración de Desarrollo

### Variables de Entorno

Crea un archivo `.env.development` con las siguientes variables:

```bash
# URL del backend (opcional en modo mock)
VITE_API_BASE_URL=http://localhost:8000/api

# Forzar modo mock (true/false)
VITE_ENABLE_MOCK_MODE=false

# Timeout para detección de backend (ms)
VITE_BACKEND_DETECTION_TIMEOUT=2000

# Timeout para peticiones API (ms)
VITE_API_TIMEOUT=5000

# Mostrar indicador de estado de conexión (true/false)
VITE_SHOW_CONNECTION_STATUS=true
```

### Ajustar Timeouts

Si tu backend es lento o estás en una red lenta, puedes aumentar los timeouts:

```bash
# Dar más tiempo para la detección del backend
VITE_BACKEND_DETECTION_TIMEOUT=5000

# Dar más tiempo para las peticiones API
VITE_API_TIMEOUT=10000
```

## Troubleshooting

### Problema: Pantalla en Blanco al Iniciar

**Síntomas**: La aplicación muestra una pantalla en blanco y no carga.

**Causas Posibles**:

1. El backend no está disponible y el modo mock no se activó
2. Error de JavaScript en la consola
3. Problema con las variables de entorno

**Soluciones**:

```bash
# 1. Verifica la consola del navegador (F12) para errores
# 2. Fuerza el modo mock
VITE_ENABLE_MOCK_MODE=true npm run dev

# 3. Limpia el caché y localStorage
# En la consola del navegador:
localStorage.clear()
# Luego recarga la página (Ctrl+Shift+R)

# 4. Verifica que las variables de entorno estén cargadas
# En la consola del navegador:
console.log(import.meta.env)
```

### Problema: "Cannot connect to backend"

**Síntomas**: Mensaje de error indicando que no se puede conectar al backend.

**Soluciones**:

```bash
# 1. Verifica que el backend esté corriendo
curl http://localhost:8000/api/health

# 2. Verifica la URL del backend en .env
VITE_API_BASE_URL=http://localhost:8000/api

# 3. Usa modo mock para desarrollo sin backend
VITE_ENABLE_MOCK_MODE=true npm run dev

# 4. Verifica CORS si el backend está en otro dominio
# El backend debe permitir peticiones desde http://localhost:3000
```

### Problema: Login No Funciona en Modo Mock

**Síntomas**: Las credenciales mock no son aceptadas.

**Soluciones**:

```bash
# 1. Verifica que estás usando las credenciales correctas
# Email: admin@example.com
# Contraseña: admin123

# 2. Limpia localStorage
localStorage.clear()

# 3. Verifica en la consola que el modo mock está activo
# Deberías ver: "🔧 Running in MOCK mode"

# 4. Verifica que el servicio mock esté cargado
# En la consola del navegador:
console.log(window.__MOCK_MODE__)
```

### Problema: Datos Mock No Se Guardan

**Síntomas**: Los cambios realizados en modo mock no persisten.

**Soluciones**:

```bash
# 1. Verifica que localStorage esté habilitado
# En la consola del navegador:
localStorage.setItem('test', 'value')
console.log(localStorage.getItem('test'))

# 2. Verifica el espacio disponible en localStorage
# Algunos navegadores tienen límites

# 3. Limpia datos antiguos si es necesario
localStorage.clear()
```

### Problema: Modo Mock No Se Desactiva

**Síntomas**: La aplicación sigue en modo mock aunque el backend esté disponible.

**Soluciones**:

```bash
# 1. Verifica la variable de entorno
# En .env.development, asegúrate de que:
VITE_ENABLE_MOCK_MODE=false

# 2. Reinicia el servidor de desarrollo
# Ctrl+C para detener
npm run dev

# 3. Limpia el caché del navegador
# Ctrl+Shift+R para recargar sin caché

# 4. Verifica que el backend responda correctamente
curl http://localhost:8000/api/health
```

### Problema: Errores de CORS

**Síntomas**: Errores en la consola sobre "CORS policy" o "Access-Control-Allow-Origin".

**Soluciones**:

```bash
# 1. Configura CORS en el backend para permitir:
# - Origin: http://localhost:3000
# - Methods: GET, POST, PUT, DELETE, OPTIONS
# - Headers: Content-Type, Authorization

# 2. Usa modo mock temporalmente
VITE_ENABLE_MOCK_MODE=true npm run dev

# 3. Usa un proxy en vite.config.ts (si aplica)
# Ver documentación de Vite sobre proxy
```

### Problema: Timeout Errors

**Síntomas**: Errores de timeout al intentar conectar con el backend.

**Soluciones**:

```bash
# 1. Aumenta los timeouts en .env.development
VITE_BACKEND_DETECTION_TIMEOUT=5000
VITE_API_TIMEOUT=10000

# 2. Verifica la latencia de red
ping localhost

# 3. Verifica que el backend no esté sobrecargado
# Revisa los logs del backend

# 4. Usa modo mock si el backend es muy lento
VITE_ENABLE_MOCK_MODE=true npm run dev
```

## Desarrollo con Backend

### Iniciar Backend y Frontend

```bash
# Terminal 1: Inicia el backend
cd backend
npm run dev

# Terminal 2: Inicia el frontend
cd frontend
npm run dev
```

### Verificar Conexión

```bash
# Verifica que el backend responda
curl http://localhost:8000/api/health

# Deberías ver algo como:
# {"status": "ok", "version": "1.0.0"}
```

### Cambiar entre Modo Real y Mock

```bash
# Modo real (con backend)
VITE_ENABLE_MOCK_MODE=false npm run dev

# Modo mock (sin backend)
VITE_ENABLE_MOCK_MODE=true npm run dev
```

## Debugging

### Habilitar Logs Detallados

```bash
# En .env.development
VITE_LOG_LEVEL=debug
```

### Inspeccionar Estado de Conexión

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver estado del backend
console.log(window.__BACKEND_STATUS__);

// Ver modo actual
console.log(window.__MOCK_MODE__);

// Ver usuario actual
console.log(localStorage.getItem('auth_user'));

// Ver token de sesión
console.log(localStorage.getItem('auth_token'));
```

### Limpiar Estado Completo

```javascript
// En la consola del navegador
localStorage.clear();
sessionStorage.clear();
location.reload();
```

## Tips de Desarrollo

### 1. Desarrollo Rápido de UI

Usa el modo mock para iterar rápidamente en la UI sin depender del backend:

```bash
VITE_ENABLE_MOCK_MODE=true npm run dev
```

### 2. Testing de Errores

Simula errores de conexión deteniendo el backend mientras la app está corriendo.

### 3. Datos de Prueba Personalizados

Modifica los datos mock en:

- `src/services/mock-auth-service.ts` - Usuarios
- `src/services/mock-news-service.ts` - Noticias
- `src/services/mock-notice-service.ts` - Avisos
- `src/services/mock-calendar-service.ts` - Eventos

### 4. Hot Reload

Vite recarga automáticamente los cambios. Si algo no se actualiza:

```bash
# Ctrl+C para detener
npm run dev
```

## Recursos Adicionales

- [README.md](./README.md) - Información general del proyecto
- [BUILD.md](./BUILD.md) - Guía de build y optimización
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de despliegue
- [Documentación de Lit](https://lit.dev/) - Framework de componentes
- [Documentación de Vite](https://vitejs.dev/) - Build tool

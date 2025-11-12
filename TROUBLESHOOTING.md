# Solución de Problemas - Frontend muestra "Modo de Desarrollo"

## Problema
El frontend muestra el mensaje: "Modo de Desarrollo - El backend no está disponible. Usando datos de prueba locales."

## Causa
El navegador tiene en caché la detección anterior del backend o el frontend no puede conectarse al backend por alguna razón.

## Soluciones

### Solución 1: Hard Refresh del Navegador (Recomendado)

1. **En Chrome/Edge (macOS)**:
   - Presiona `Cmd + Shift + R`
   - O abre DevTools (`Cmd + Option + I`), haz clic derecho en el botón de recargar y selecciona "Empty Cache and Hard Reload"

2. **En Chrome/Edge (Windows/Linux)**:
   - Presiona `Ctrl + Shift + R`
   - O presiona `Ctrl + F5`

3. **En Firefox (macOS)**:
   - Presiona `Cmd + Shift + R`

4. **En Firefox (Windows/Linux)**:
   - Presiona `Ctrl + Shift + R`
   - O presiona `Ctrl + F5`

5. **En Safari (macOS)**:
   - Presiona `Cmd + Option + R`
   - O mantén presionado `Shift` y haz clic en el botón de recargar

### Solución 2: Limpiar localStorage

1. Abre las DevTools del navegador (`F12` o `Cmd/Ctrl + Option + I`)
2. Ve a la pestaña "Application" (Chrome/Edge) o "Storage" (Firefox)
3. En el menú lateral, selecciona "Local Storage"
4. Haz clic en `http://localhost:5173`
5. Haz clic derecho y selecciona "Clear"
6. Recarga la página (`F5` o `Cmd/Ctrl + R`)

### Solución 3: Verificar que el Backend esté corriendo

```bash
# Verificar el estado del backend
curl http://localhost:3000/health

# Deberías ver algo como:
# {"success":true,"message":"API is running","timestamp":"...","uptime":...}
```

Si el backend no responde:

```bash
cd apps/backend
docker-compose ps

# Si los contenedores no están corriendo:
docker-compose up -d
```

### Solución 4: Verificar CORS

El backend debe permitir peticiones desde `http://localhost:5173`. Verifica el archivo `apps/backend/.env`:

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
CORS_CREDENTIALS=true
```

Si hiciste cambios, reinicia el backend:

```bash
cd apps/backend
docker-compose restart backend
```

### Solución 5: Modo Incógnito/Privado

Abre el frontend en una ventana de incógnito/privado para evitar problemas de caché:

1. **Chrome/Edge**: `Cmd/Ctrl + Shift + N`
2. **Firefox**: `Cmd/Ctrl + Shift + P`
3. **Safari**: `Cmd + Shift + N`

Luego navega a `http://localhost:5173`

### Solución 6: Verificar la Configuración del Frontend

Verifica que el archivo `apps/frontend/.env` tenga la configuración correcta:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MOCK_MODE=false
VITE_SHOW_CONNECTION_STATUS=true
VITE_BACKEND_DETECTION_TIMEOUT=5000
```

Si hiciste cambios, reinicia el servidor de desarrollo:

```bash
# Detener el servidor (Ctrl+C en la terminal donde está corriendo)
# O desde otra terminal:
cd apps/frontend
# Luego iniciar de nuevo:
npm run dev
```

### Solución 7: Verificar la Consola del Navegador

1. Abre las DevTools (`F12`)
2. Ve a la pestaña "Console"
3. Busca mensajes de error relacionados con:
   - CORS
   - Network errors
   - Backend detection
   - Fetch errors

Los mensajes comunes y sus soluciones:

- **"CORS policy"**: El backend no está configurado para permitir peticiones desde el frontend
- **"Failed to fetch"**: El backend no está corriendo o no es accesible
- **"net::ERR_CONNECTION_REFUSED"**: El backend no está escuchando en el puerto 3000

### Solución 8: Probar la Conexión Manualmente

Abre `test-backend.html` en tu navegador para verificar la conexión:

```bash
# Desde la raíz del proyecto
open test-backend.html  # macOS
# o
xdg-open test-backend.html  # Linux
# o simplemente arrastra el archivo al navegador
```

Este archivo probará:
- Conexión al endpoint `/health`
- CORS
- Tiempos de respuesta

## Verificación Final

Una vez aplicadas las soluciones, deberías ver:

1. **En la página de login**: NO debería aparecer el banner amarillo de "Modo de Desarrollo"
2. **En la consola del navegador**: Deberías ver mensajes como:
   ```
   [AuthServiceFactory] Using real auth service - backend available
   [SchoolApp] Running in real mode - backend available
   ```
3. **Al hacer login**: Deberías poder iniciar sesión con las credenciales reales:
   - Admin: admin@aspa-sanvicente.com / Admin123
   - Usuario: juan.garcia@example.com / User123

## Comandos Útiles de Diagnóstico

```bash
# Ver logs del backend
cd apps/backend
docker-compose logs -f backend

# Ver estado de los contenedores
docker-compose ps

# Reiniciar todo el sistema
docker-compose restart

# Ver logs del frontend (si lo iniciaste en background)
# Los logs aparecen en la terminal donde ejecutaste npm run dev

# Probar el backend directamente
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aspa-sanvicente.com","password":"Admin123"}'
```

## Errores Comunes Adicionales

### Error: "Cannot read properties of undefined (reading 'toString')"

**Causa**: El backend no devuelve `expiresAt` en la respuesta de login.

**Solución**: Ya está corregido en el código. El frontend ahora decodifica el token JWT para obtener la fecha de expiración automáticamente.

Si sigues viendo este error:
1. Haz un hard refresh del navegador (`Cmd/Ctrl + Shift + R`)
2. Limpia el localStorage
3. Recarga la página

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Causa**: El backend no está configurado para permitir peticiones desde el frontend.

**Solución**:
1. Verifica `apps/backend/.env`:
   ```env
   CORS_ORIGIN=http://localhost:3000,http://localhost:5173
   ```
2. Reinicia el backend:
   ```bash
   cd apps/backend
   docker-compose restart backend
   ```

### Error: "Failed to fetch" o "net::ERR_CONNECTION_REFUSED"

**Causa**: El backend no está corriendo.

**Solución**:
```bash
cd apps/backend
docker-compose up -d
```

## Contacto

Si ninguna de estas soluciones funciona, por favor proporciona:
1. Captura de pantalla de la consola del navegador (pestaña Console)
2. Captura de pantalla de la pestaña Network en DevTools
3. Salida del comando `docker-compose ps` desde `apps/backend`
4. Salida del comando `curl http://localhost:3000/health`

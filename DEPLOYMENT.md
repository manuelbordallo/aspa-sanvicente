# Guía de Despliegue - ASPA San Vicente

## Estado Actual del Sistema

### Backend (Docker)
- **Estado**: ✅ Desplegado y funcionando
- **URL**: http://localhost:3000
- **API**: http://localhost:3000/api
- **Documentación**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

### Frontend
- **Estado**: ✅ Configurado y funcionando
- **URL**: http://localhost:5173
- **Modo**: Conectado al backend real (no mocks)

## Servicios Docker

### Contenedores Activos
```bash
# Ver estado de los contenedores
cd apps/backend
docker-compose ps
```

**Servicios:**
- `aspa-backend`: API Backend (Puerto 3000)
- `aspa-postgres`: Base de datos PostgreSQL (Puerto 5432)

### Comandos Útiles

**Iniciar servicios:**
```bash
cd apps/backend
docker-compose up -d
```

**Ver logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f postgres
```

**Detener servicios:**
```bash
docker-compose down
```

**Reiniciar servicios:**
```bash
docker-compose restart
```

**Reconstruir y reiniciar:**
```bash
docker-compose up -d --build
```

## Credenciales de Acceso

### Usuario Administrador
- **Email**: admin@aspa-sanvicente.com
- **Password**: Admin123

### Usuario Regular
- **Email**: juan.garcia@example.com
- **Password**: User123

## Iniciar el Sistema Completo

### 1. Backend (Docker)
```bash
cd apps/backend
docker-compose up -d
```

### 2. Frontend
```bash
cd apps/frontend
npm run dev
```

El frontend se abrirá automáticamente en http://localhost:5173

## Configuración

### Variables de Entorno - Backend
Archivo: `apps/backend/.env`

Configuración actual:
- Base de datos: PostgreSQL en Docker
- Puerto: 3000
- JWT Secret: Configurado
- CORS: Habilitado para localhost:5173

### Variables de Entorno - Frontend
Archivo: `apps/frontend/.env`

Configuración actual:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ENABLE_MOCK_MODE=false
VITE_SHOW_CONNECTION_STATUS=true
```

## Verificación del Sistema

### 1. Verificar Backend
```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "...",
  "uptime": ...
}
```

### 2. Verificar Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aspa-sanvicente.com","password":"Admin123"}'
```

### 3. Verificar Frontend
Abrir http://localhost:5173 en el navegador y hacer login con las credenciales de administrador.

## Estructura de la API

Todos los endpoints están bajo el prefijo `/api`:

- **Autenticación**: `/api/auth/*`
  - POST `/api/auth/login`
  - POST `/api/auth/logout`
  - POST `/api/auth/refresh`
  - GET `/api/auth/validate`

- **Usuarios**: `/api/users/*`
  - GET `/api/users`
  - GET `/api/users/:id`
  - POST `/api/users`
  - PUT `/api/users/:id`
  - DELETE `/api/users/:id`

- **Noticias**: `/api/news/*`
  - GET `/api/news`
  - GET `/api/news/:id`
  - POST `/api/news`
  - PUT `/api/news/:id`
  - DELETE `/api/news/:id`

- **Avisos**: `/api/notices/*`
  - GET `/api/notices`
  - GET `/api/notices/:id`
  - POST `/api/notices`
  - PATCH `/api/notices/:id/read`
  - DELETE `/api/notices/:id`

- **Calendario**: `/api/calendar/*`
  - GET `/api/calendar/events`
  - GET `/api/calendar/events/:id`
  - POST `/api/calendar/events`
  - PUT `/api/calendar/events/:id`
  - DELETE `/api/calendar/events/:id`

## Solución de Problemas

### Backend no inicia
```bash
# Ver logs
cd apps/backend
docker-compose logs backend

# Reiniciar servicios
docker-compose restart

# Reconstruir si es necesario
docker-compose down
docker-compose up -d --build
```

### Frontend no se conecta al backend
1. Verificar que el backend esté corriendo: `curl http://localhost:3000/health`
2. Verificar la configuración en `apps/frontend/.env`
3. Reiniciar el servidor de desarrollo del frontend

### Puerto 3000 ya está en uso
```bash
# Encontrar el proceso
lsof -i :3000

# Cambiar el puerto en apps/backend/.env
PORT=3001
```

### Base de datos con problemas
```bash
# Detener y eliminar volúmenes (CUIDADO: Borra todos los datos)
cd apps/backend
docker-compose down -v

# Reiniciar
docker-compose up -d
```

## Solución de Problemas Comunes

### Frontend muestra "Modo de Desarrollo"

Si el frontend muestra el mensaje "El backend no está disponible. Usando datos de prueba locales":

1. **Hard Refresh del navegador**:
   - Chrome/Edge (macOS): `Cmd + Shift + R`
   - Chrome/Edge (Windows): `Ctrl + Shift + R`
   - Firefox: `Cmd/Ctrl + Shift + R`
   - Safari: `Cmd + Option + R`

2. **Limpiar localStorage**:
   - Abre DevTools (`F12`)
   - Ve a Application > Local Storage
   - Elimina `http://localhost:5173`
   - Recarga la página

3. **Verificar backend**:
   ```bash
   curl http://localhost:3000/health
   ```

4. **Usar modo incógnito**: Abre `http://localhost:5173` en una ventana privada

Ver `TROUBLESHOOTING.md` para más detalles.

## Próximos Pasos

1. ✅ Backend desplegado en Docker
2. ✅ Frontend configurado para usar backend real
3. ✅ Base de datos inicializada con datos de prueba
4. 🔄 Configurar variables de entorno para producción
5. 🔄 Configurar SMTP para envío de emails
6. 🔄 Configurar SSL/TLS para producción
7. 🔄 Configurar backups automáticos

## Documentación Adicional

- Backend Docker: `apps/backend/DOCKER.md`
- Solución de Problemas: `TROUBLESHOOTING.md`
- Test de Conexión: `test-backend.html`
- API Documentation: http://localhost:3000/api/docs (cuando el backend esté corriendo)

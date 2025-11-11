# 🚀 Quick Start - ASPA San Vicente Monorepo

## Configuración Inicial (Primera vez)

### 1. Instalar Dependencias

```bash
# Frontend
cd apps/frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configurar Variables de Entorno

**Frontend:**
```bash
cd apps/frontend
cp .env.example .env
# Editar .env si es necesario
```

**Backend:**
```bash
cd apps/backend
cp .env.example .env
# IMPORTANTE: Configurar DATABASE_URL y JWT_SECRET
```

### 3. Configurar Base de Datos (Backend)

```bash
cd apps/backend

# Ejecutar migraciones
npm run prisma:migrate

# Generar Prisma Client
npm run prisma:generate

# (Opcional) Seed de datos iniciales
npm run prisma:seed
```

## Desarrollo Diario

### Opción 1: Ejecutar desde la raíz

```bash
# Terminal 1: Frontend
npm run dev:frontend

# Terminal 2: Backend
npm run dev:backend
```

### Opción 2: Ejecutar desde cada carpeta

```bash
# Terminal 1: Frontend
cd apps/frontend
npm run dev

# Terminal 2: Backend
cd apps/backend
npm run dev
```

## URLs de Desarrollo

- **Frontend**: http://localhost:5173 (Vite)
- **Backend**: http://localhost:3000 (Express)

> **Nota**: El frontend está configurado para usar el puerto 5173 por defecto (Vite). El backend usa el puerto 3000.

## Comandos Útiles

### Testing

```bash
# Desde la raíz
npm run test:frontend
npm run test:backend
npm test  # Ambos

# Desde cada proyecto
cd apps/frontend && npm test
cd apps/backend && npm test
```

### Build

```bash
# Desde la raíz
npm run build:frontend
npm run build:backend
npm run build  # Ambos

# Desde cada proyecto
cd apps/frontend && npm run build
cd apps/backend && npm run build
```

### Linting y Formateo

```bash
# Desde la raíz
npm run lint
npm run format

# Desde cada proyecto
cd apps/frontend && npm run lint && npm run format
cd apps/backend && npm run lint && npm run format
```

## Prisma (Backend)

```bash
cd apps/backend

# Ver base de datos en interfaz gráfica
npm run prisma:studio

# Crear nueva migración
npm run prisma:migrate

# Regenerar cliente después de cambios en schema
npm run prisma:generate
```

## Troubleshooting

### "Cannot find module" o errores de dependencias

```bash
# Limpiar todo y reinstalar
npm run clean
cd apps/frontend && npm install
cd ../backend && npm install
```

### Backend no conecta a la base de datos

1. Verificar que PostgreSQL esté corriendo
2. Revisar `apps/backend/.env` y confirmar `DATABASE_URL`
3. Ejecutar migraciones: `cd apps/backend && npm run prisma:migrate`

### Frontend no se conecta al backend

1. Verificar que el backend esté corriendo en el puerto correcto
2. Revisar configuración de CORS en el backend
3. Verificar `apps/frontend/.env` para la URL del API

### Errores de TypeScript

```bash
# Frontend
cd apps/frontend
npm run build  # Ver errores específicos

# Backend
cd apps/backend
npm run build  # Ver errores específicos
```

## Estructura de Archivos Importantes

```
aspa-sanvicente/
├── apps/
│   ├── frontend/
│   │   ├── src/              # Código fuente
│   │   ├── .env              # Variables de entorno
│   │   ├── package.json      # Dependencias
│   │   └── vite.config.ts    # Configuración de Vite
│   └── backend/
│       ├── src/              # Código fuente
│       ├── prisma/           # Schema y migraciones
│       ├── .env              # Variables de entorno
│       ├── package.json      # Dependencias
│       └── tsconfig.json     # Configuración de TypeScript
├── .kiro/specs/              # Especificaciones del proyecto
├── package.json              # Configuración del monorepo
└── README.md                 # Documentación principal
```

## Próximos Pasos

1. ✅ Configuración inicial completada
2. 🔄 Continuar con las tareas del backend (ver `.kiro/specs/backend-api/tasks.md`)
3. 🔄 Desarrollar funcionalidades del frontend
4. 🔄 Integrar frontend con backend

## Documentación Adicional

- [README Principal](./README.md)
- [Guía del Monorepo](./MONOREPO.md)
- [Documentación de Refactorización](./REFACTORING.md)
- [Frontend README](./apps/frontend/README.md)
- [Backend README](./apps/backend/README.md)

---

¿Necesitas ayuda? Revisa la documentación o abre un issue en el repositorio.

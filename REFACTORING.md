# Refactorización a Monorepo - ASPA San Vicente

## 📋 Resumen

El proyecto ha sido refactorizado exitosamente de una estructura mixta a un **monorepo** organizado, separando claramente el frontend y el backend en aplicaciones independientes.

## 🔄 Cambios Realizados

### Estructura Anterior
```
aspa-sanvicente/
├── src/              # Frontend
├── public/           # Frontend
├── backend/          # Backend
├── package.json      # Frontend
└── ...
```

### Estructura Nueva (Monorepo)
```
aspa-sanvicente/
├── apps/
│   ├── frontend/     # Aplicación web completa
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   └── ...
│   └── backend/      # API REST completa
│       ├── src/
│       ├── tests/
│       ├── package.json
│       └── ...
├── .kiro/            # Specs compartidas
├── package.json      # Configuración del monorepo
└── README.md         # Documentación principal
```

## ✅ Archivos Movidos

### Frontend → apps/frontend/
- ✅ Código fuente (`src/`)
- ✅ Assets públicos (`public/`)
- ✅ Configuración de build (`vite.config.ts`, `tsconfig.json`)
- ✅ Dependencias (`package.json`, `package-lock.json`)
- ✅ Configuración de estilo (`tailwind.config.js`, `postcss.config.js`)
- ✅ Configuración de linting (`.eslintrc.json`, `.prettierrc`)
- ✅ Configuración de testing (`web-test-runner.config.js`)
- ✅ Docker (`Dockerfile`, `docker-compose.yml`, `nginx.conf`)
- ✅ Scripts de deployment (`scripts/`)
- ✅ Documentación (todos los `.md`)
- ✅ Variables de entorno (`.env*`)
- ✅ Build artifacts (`dist/`, `coverage/`, `node_modules/`)

### Backend → apps/backend/
- ✅ Código fuente (`src/`)
- ✅ Tests (`tests/`)
- ✅ Configuración TypeScript (`tsconfig.json`)
- ✅ Dependencias (`package.json`, `package-lock.json`)
- ✅ Configuración de testing (`jest.config.js`)
- ✅ Configuración de desarrollo (`nodemon.json`)
- ✅ Configuración de linting (`.eslintrc.json`, `.prettierrc`)
- ✅ Variables de entorno (`.env.example`)
- ✅ Documentación (`README.md`)
- ✅ Dependencias instaladas (`node_modules/`)

## 📦 Nuevos Archivos Creados

### Raíz del Monorepo
- ✅ `package.json` - Configuración de workspaces y scripts del monorepo
- ✅ `README.md` - Documentación principal actualizada
- ✅ `.gitignore` - Ignorar archivos generados en ambos proyectos
- ✅ `MONOREPO.md` - Guía completa para trabajar con el monorepo
- ✅ `REFACTORING.md` - Este documento

### Backend
- ✅ `apps/backend/.env.example` - Variables de entorno del backend
- ✅ `apps/backend/.eslintrc.json` - Configuración de ESLint
- ✅ `apps/backend/.prettierrc` - Configuración de Prettier
- ✅ `apps/backend/.gitignore` - Ignorar archivos del backend
- ✅ `apps/backend/src/index.ts` - Archivo placeholder

## 🚀 Comandos Disponibles

### Desde la Raíz del Proyecto

```bash
# Desarrollo
npm run dev:frontend      # Iniciar frontend
npm run dev:backend       # Iniciar backend

# Build
npm run build:frontend    # Build del frontend
npm run build:backend     # Build del backend
npm run build             # Build de ambos

# Testing
npm run test:frontend     # Tests del frontend
npm run test:backend      # Tests del backend
npm run test              # Tests de ambos

# Linting
npm run lint:frontend     # Lint del frontend
npm run lint:backend      # Lint del backend
npm run lint              # Lint de ambos

# Formateo
npm run format:frontend   # Formatear frontend
npm run format:backend    # Formatear backend
npm run format            # Formatear ambos

# Limpieza
npm run clean             # Limpiar todo
```

### Desde apps/frontend/

```bash
npm run dev               # Servidor de desarrollo
npm run build             # Build de producción
npm test                  # Ejecutar tests
npm run lint              # Linter
npm run format            # Formatear código
npm run deploy            # Deploy a producción
```

### Desde apps/backend/

```bash
npm run dev               # Servidor de desarrollo con hot reload
npm run build             # Compilar TypeScript
npm start                 # Iniciar servidor de producción
npm test                  # Ejecutar tests
npm run lint              # Linter
npm run format            # Formatear código
npm run prisma:generate   # Generar Prisma Client
npm run prisma:migrate    # Ejecutar migraciones
npm run prisma:studio     # Abrir Prisma Studio
```

## 🔧 Configuración de Workspaces

El `package.json` raíz utiliza npm workspaces para gestionar ambos proyectos:

```json
{
  "workspaces": [
    "apps/*"
  ]
}
```

Esto permite:
- Instalar dependencias de todos los proyectos desde la raíz
- Ejecutar scripts en proyectos específicos
- Compartir dependencias comunes (si es necesario)

## 📝 Próximos Pasos

1. **Verificar que todo funciona**:
   ```bash
   cd apps/frontend && npm run build
   cd apps/backend && npm run build
   ```

2. **Actualizar CI/CD**: Modificar los workflows de GitHub Actions para la nueva estructura

3. **Actualizar documentación**: Revisar y actualizar cualquier referencia a rutas antiguas

4. **Configurar puertos**: Asegurarse de que frontend y backend usen puertos diferentes en desarrollo

5. **Continuar con la implementación**: Seguir con las tareas del spec backend-api

## ✨ Beneficios del Monorepo

1. **Organización clara**: Frontend y backend completamente separados
2. **Gestión unificada**: Un solo repositorio para todo el proyecto
3. **Sincronización**: Cambios coordinados entre frontend y backend
4. **Tipos compartidos**: Posibilidad de compartir interfaces TypeScript
5. **CI/CD simplificado**: Un solo pipeline para ambos proyectos
6. **Documentación centralizada**: Toda la documentación en un solo lugar

## 🎯 Estado Actual

- ✅ Estructura de monorepo creada
- ✅ Frontend movido a `apps/frontend/`
- ✅ Backend movido a `apps/backend/`
- ✅ Configuración de workspaces
- ✅ Scripts del monorepo configurados
- ✅ Documentación actualizada
- ✅ Builds verificados (frontend y backend)
- ✅ Task 1 del backend completada

## 📚 Documentación

- [README principal](./README.md) - Visión general del proyecto
- [Guía del Monorepo](./MONOREPO.md) - Cómo trabajar con el monorepo
- [Frontend README](./apps/frontend/README.md) - Documentación del frontend
- [Backend README](./apps/backend/README.md) - Documentación del backend
- [Backend Spec](./kiro/specs/backend-api/) - Especificaciones del backend

---

**Fecha de refactorización**: 11 de noviembre de 2025
**Estado**: ✅ Completado

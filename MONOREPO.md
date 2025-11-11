# Guía del Monorepo ASPA San Vicente

Este documento explica cómo trabajar con la estructura de monorepo del proyecto.

## 📁 Estructura

```
aspa-sanvicente/
├── apps/
│   ├── frontend/          # Aplicación web (Lit + Vite)
│   │   ├── src/          # Código fuente del frontend
│   │   ├── public/       # Assets estáticos
│   │   ├── package.json  # Dependencias del frontend
│   │   └── ...
│   └── backend/          # API REST (Express + Prisma)
│       ├── src/          # Código fuente del backend
│       ├── tests/        # Tests del backend
│       ├── package.json  # Dependencias del backend
│       └── ...
├── .kiro/                # Especificaciones y configuración
├── package.json          # Configuración del monorepo
└── README.md
```

## 🚀 Comandos desde la raíz

### Desarrollo

```bash
# Iniciar frontend en modo desarrollo
npm run dev:frontend

# Iniciar backend en modo desarrollo
npm run dev:backend
```

### Build

```bash
# Build del frontend
npm run build:frontend

# Build del backend
npm run build:backend

# Build de ambos proyectos
npm run build
```

### Testing

```bash
# Tests del frontend
npm run test:frontend

# Tests del backend
npm run test:backend

# Tests de ambos proyectos
npm run test
```

### Linting y Formateo

```bash
# Lint del frontend
npm run lint:frontend

# Lint del backend
npm run lint:backend

# Lint de ambos proyectos
npm run lint

# Formatear código del frontend
npm run format:frontend

# Formatear código del backend
npm run format:backend

# Formatear código de ambos proyectos
npm run format
```

### Limpieza

```bash
# Eliminar node_modules, dist y coverage de todos los proyectos
npm run clean
```

## 🔧 Trabajar en un proyecto específico

### Frontend

```bash
cd apps/frontend

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm test

# Lint
npm run lint

# Formatear
npm run format
```

### Backend

```bash
cd apps/backend

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm test

# Prisma
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio

# Lint
npm run lint

# Formatear
npm run format
```

## 📦 Gestión de Dependencias

### Instalar dependencias en un proyecto específico

```bash
# Frontend
npm install <package> --workspace=apps/frontend

# Backend
npm install <package> --workspace=apps/backend
```

### Instalar dependencias de desarrollo

```bash
# Frontend
npm install -D <package> --workspace=apps/frontend

# Backend
npm install -D <package> --workspace=apps/backend
```

### Actualizar dependencias

```bash
# Actualizar todas las dependencias
cd apps/frontend && npm update
cd apps/backend && npm update
```

## 🔄 Workflow de Desarrollo

### 1. Configuración inicial

```bash
# Instalar dependencias del frontend
cd apps/frontend
npm install

# Instalar dependencias del backend
cd ../backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración

# Configurar base de datos
npm run prisma:migrate
npm run prisma:generate
```

### 2. Desarrollo diario

```bash
# Terminal 1: Frontend
cd apps/frontend
npm run dev

# Terminal 2: Backend
cd apps/backend
npm run dev
```

### 3. Antes de hacer commit

```bash
# Desde la raíz del proyecto
npm run lint
npm run test
npm run build
```

## 🌐 Puertos por defecto

- **Frontend**: http://localhost:3000 (Vite dev server)
- **Backend**: http://localhost:3000 (Express API)

> **Nota**: Asegúrate de configurar diferentes puertos si quieres ejecutar ambos simultáneamente.

## 🔗 Compartir código entre proyectos

Si necesitas compartir tipos o utilidades entre frontend y backend:

1. Crea una carpeta `packages/shared` en la raíz
2. Añádela a los workspaces en el `package.json` raíz
3. Importa desde ambos proyectos

Ejemplo:
```json
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

## 🐛 Troubleshooting

### Error: Cannot find module

```bash
# Reinstalar dependencias
npm run clean
cd apps/frontend && npm install
cd ../backend && npm install
```

### Conflictos de versiones

```bash
# Eliminar package-lock.json y reinstalar
rm apps/*/package-lock.json
cd apps/frontend && npm install
cd ../backend && npm install
```

### Prisma no genera el cliente

```bash
cd apps/backend
npm run prisma:generate
```

## 📚 Recursos

- [Frontend README](apps/frontend/README.md)
- [Backend README](apps/backend/README.md)
- [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)

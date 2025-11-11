# ASPA San Vicente - Monorepo

Sistema de gestión escolar para ASPA San Vicente, organizado como monorepo con frontend y backend.

## 📁 Estructura del Proyecto

```
aspa-sanvicente/
├── apps/
│   ├── frontend/          # Aplicación web (Lit + TypeScript + Vite)
│   └── backend/           # API REST (Express + TypeScript + Prisma)
├── .kiro/                 # Especificaciones y configuración de Kiro
├── .git/                  # Control de versiones
└── README.md              # Este archivo
```

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd aspa-sanvicente
```

2. **Instalar dependencias del frontend**
```bash
cd apps/frontend
npm install
```

3. **Instalar dependencias del backend**
```bash
cd apps/backend
npm install
```

4. **Configurar variables de entorno**
```bash
# Frontend
cd apps/frontend
cp .env.example .env

# Backend
cd apps/backend
cp .env.example .env
# Editar .env con tu configuración de base de datos
```

5. **Configurar la base de datos**
```bash
cd apps/backend
npm run prisma:migrate
npm run prisma:generate
```

### Desarrollo

**Frontend** (puerto 5173):
```bash
cd apps/frontend
npm run dev
```

**Backend** (puerto 3000):
```bash
cd apps/backend
npm run dev
```

> **Tip**: Puedes ejecutar ambos desde la raíz con `npm run dev:frontend` y `npm run dev:backend`

## 📦 Aplicaciones

### Frontend
- **Tecnologías**: Lit, TypeScript, Vite, TailwindCSS
- **Puerto**: 5173 (Vite default)
- **Documentación**: [apps/frontend/README.md](apps/frontend/README.md)

### Backend
- **Tecnologías**: Express, TypeScript, Prisma, PostgreSQL
- **Puerto**: 3000 (configurable)
- **Documentación**: [apps/backend/README.md](apps/backend/README.md)

## 🧪 Testing

```bash
# Frontend
cd apps/frontend
npm test

# Backend
cd apps/backend
npm test
```

## 🏗️ Build

```bash
# Frontend
cd apps/frontend
npm run build

# Backend
cd apps/backend
npm run build
```

## 📝 Scripts Útiles

### Frontend
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm test` - Ejecutar tests
- `npm run lint` - Linter
- `npm run format` - Formatear código

### Backend
- `npm run dev` - Servidor de desarrollo con hot reload
- `npm run build` - Compilar TypeScript
- `npm start` - Iniciar servidor de producción
- `npm test` - Ejecutar tests
- `npm run prisma:studio` - Abrir Prisma Studio

## 📚 Documentación Adicional

- [🚀 Quick Start](./QUICK_START.md) - Guía rápida de inicio
- [📖 Guía del Monorepo](./MONOREPO.md) - Cómo trabajar con el monorepo
- [🔄 Refactorización](./REFACTORING.md) - Detalles de la reorganización del proyecto

## 🤝 Contribución

1. Crear una rama desde `main`
2. Hacer cambios y commits
3. Crear Pull Request

## 📄 Licencia

MIT

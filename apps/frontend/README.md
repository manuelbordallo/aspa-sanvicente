# Aplicación de Gestión Escolar

Una aplicación web moderna para la gestión de comunicaciones escolares, construida con Lit/Catalyst y Tailwind CSS.

## Tecnologías

- **Frontend Framework**: Lit/Catalyst (Web Components)
- **CSS Framework**: Tailwind CSS
- **Build Tool**: Vite
- **Language**: TypeScript
- **Testing**: Web Test Runner + Playwright
- **Linting**: ESLint
- **Formatting**: Prettier

## Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── ui/              # Componentes básicos de UI
│   ├── forms/           # Componentes de formularios
│   └── layout/          # Componentes de layout
├── views/               # Vistas principales
├── services/            # Servicios y lógica de negocio
├── types/               # Definiciones de TypeScript
├── utils/               # Utilidades
└── styles/              # Estilos globales y Tailwind
```

## Scripts Disponibles

### Desarrollo

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run preview` - Previsualiza la build de producción

### Build

- `npm run build` - Construye la aplicación para producción
- `npm run build:prod` - Build optimizado para producción
- `npm run build:clean` - Limpia el directorio dist
- `npm run build:analyze` - Analiza el tamaño del bundle

### Calidad de Código

- `npm run lint` - Ejecuta ESLint
- `npm run lint:fix` - Ejecuta ESLint y corrige errores automáticamente
- `npm run format` - Formatea el código con Prettier
- `npm run format:check` - Verifica el formato del código
- `npm run validate` - Ejecuta lint, format, test y build

### Testing

- `npm run test` - Ejecuta los tests con cobertura
- `npm run test:watch` - Ejecuta los tests en modo watch
- `npm run test:ci` - Ejecuta tests para CI/CD

### Deployment

- `npm run deploy` - Despliega automáticamente a GitHub
- `npm run deploy:msg "mensaje"` - Despliega con mensaje personalizado

## Desarrollo

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Iniciar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

3. Abrir [http://localhost:3000](http://localhost:3000) en el navegador

### Desarrollo sin Backend

La aplicación incluye un **modo mock** que permite desarrollar sin necesidad de un backend activo.

### Inicio Rápido en Modo Mock

```bash
# 1. Verifica que .env.development tenga:
# VITE_ENABLE_MOCK_MODE=true

# 2. Inicia el servidor
npm run dev

# 3. Abre http://localhost:3000
# Verás un banner amarillo con las credenciales de prueba
```

**Credenciales de prueba:**

- Admin: `admin@example.com` / `admin123`
- Usuario: `user@example.com` / `user123`

**Nota**: Si ves una pantalla en blanco, reinicia el servidor de desarrollo (Ctrl+C y luego `npm run dev`).

Ver [DEVELOPMENT.md](./DEVELOPMENT.md) para más detalles sobre desarrollo sin backend y troubleshooting.

## Build y Despliegue

### Variables de Entorno

1. Copiar el archivo de ejemplo:

   ```bash
   cp .env.example .env
   ```

2. Configurar las variables necesarias:
   ```bash
   VITE_API_BASE_URL=https://your-api.com/api
   ```

### Build para Producción

```bash
# Build optimizado
npm run build:prod

# Previsualizar build
npm run preview
```

### Despliegue

#### GitHub Pages (Automático)

- Push a la rama `main`
- GitHub Actions construye y despliega automáticamente
- Acceso en: `https://username.github.io/repository`

#### Script de Despliegue

```bash
# Despliegue básico
npm run deploy

# Despliegue con mensaje personalizado
npm run deploy:msg "Descripción de los cambios"
```

#### Docker

```bash
# Construir y ejecutar
docker-compose up -d

# Acceder en http://localhost:8080
```

#### Otras Plataformas

- **Netlify**: Build `npm run build:prod`, Publish `dist`
- **Vercel**: Framework Vite, Build `npm run build:prod`, Output `dist`
- **Servidor tradicional**: Subir contenido de `dist/` y configurar SPA routing

Ver documentación detallada:

- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guía de desarrollo sin backend y troubleshooting
- [BUILD.md](./BUILD.md) - Guía completa de build y optimización
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Instrucciones detalladas de despliegue
- [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) - Guía rápida de despliegue

## Testing

Los tests se ejecutan con Web Test Runner y Playwright. Los archivos de test deben tener la extensión `.test.ts` y estar ubicados junto a los componentes que testean.

## Configuración

- **Tailwind CSS**: Configurado con colores personalizados y utilidades adicionales
- **TypeScript**: Configurado con strict mode y decoradores experimentales para Lit
- **ESLint**: Configurado con reglas recomendadas para TypeScript
- **Prettier**: Configurado con formato estándar

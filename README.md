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

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la build de producción
- `npm run lint` - Ejecuta ESLint
- `npm run lint:fix` - Ejecuta ESLint y corrige errores automáticamente
- `npm run format` - Formatea el código con Prettier
- `npm run format:check` - Verifica el formato del código
- `npm run test` - Ejecuta los tests
- `npm run test:watch` - Ejecuta los tests en modo watch
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

## Despliegue

Para desplegar automáticamente los cambios a GitHub:

```bash
# Despliegue básico
npm run deploy

# Despliegue con mensaje personalizado
npm run deploy:msg "Descripción de los cambios"
```

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas de configuración.

## Testing

Los tests se ejecutan con Web Test Runner y Playwright. Los archivos de test deben tener la extensión `.test.ts` y estar ubicados junto a los componentes que testean.

## Configuración

- **Tailwind CSS**: Configurado con colores personalizados y utilidades adicionales
- **TypeScript**: Configurado con strict mode y decoradores experimentales para Lit
- **ESLint**: Configurado con reglas recomendadas para TypeScript
- **Prettier**: Configurado con formato estándar

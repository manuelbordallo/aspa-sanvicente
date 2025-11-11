# Guía de Despliegue

Esta guía explica cómo configurar y usar el sistema de despliegue automático para el proyecto.

## Configuración Inicial

### 1. Configurar Repositorio en GitHub

1. Crea un nuevo repositorio en GitHub
2. Copia la URL del repositorio
3. Configura el remote en tu proyecto local:

```bash
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
```

### 2. Configurar Autenticación

Para poder hacer push automático, necesitas configurar la autenticación:

#### Opción A: Token de Acceso Personal (Recomendado)

1. Ve a GitHub → Settings → Developer settings → Personal access tokens
2. Genera un nuevo token con permisos de `repo`
3. Configura Git para usar el token:

```bash
git config --global credential.helper store
```

#### Opción B: SSH (Alternativa)

1. Configura una clave SSH siguiendo la [guía de GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
2. Usa la URL SSH del repositorio:

```bash
git remote set-url origin git@github.com:tu-usuario/tu-repositorio.git
```

## Uso del Script de Despliegue

### Despliegue Básico

```bash
# Usando npm script
npm run deploy

# O directamente
./scripts/deploy.sh
```

### Despliegue con Mensaje Personalizado

```bash
# Con mensaje personalizado
npm run deploy:msg "Implementar nueva funcionalidad de usuarios"

# O directamente
./scripts/deploy.sh "Implementar nueva funcionalidad de usuarios"
```

## Lo que hace el Script

El script `deploy.sh` realiza automáticamente:

1. ✅ **Verificaciones previas**
   - Confirma que estás en un repositorio Git
   - Verifica que hay cambios para desplegar

2. 🔧 **Calidad de código**
   - Ejecuta Prettier para formatear el código
   - Ejecuta ESLint para verificar la calidad
   - Ejecuta el build para verificar que compila

3. 📦 **Preparación**
   - Agrega todos los archivos al staging
   - Crea un commit con mensaje descriptivo

4. 🚀 **Despliegue**
   - Sube los cambios a GitHub
   - Confirma el éxito del despliegue

## GitHub Actions (CI/CD)

El proyecto incluye un workflow de GitHub Actions que:

- **En cada push/PR**: Ejecuta tests, linting y build
- **En push a main**: Despliega automáticamente a GitHub Pages

### Configurar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: "GitHub Actions"
4. El sitio estará disponible en: `https://tu-usuario.github.io/tu-repositorio`

## Comandos Útiles

```bash
# Ver estado del repositorio
git status

# Ver historial de commits
git log --oneline

# Ver remotes configurados
git remote -v

# Verificar rama actual
git branch

# Cambiar de rama
git checkout nombre-rama

# Crear nueva rama
git checkout -b nueva-rama
```

## Solución de Problemas

### Error: "No hay un remote 'origin' configurado"

```bash
git remote add origin https://github.com/tu-usuario/tu-repositorio.git
```

### Error: "Authentication failed"

- Verifica tu token de acceso personal
- O configura SSH correctamente

### Error: "Build falló"

- Revisa los errores de TypeScript: `npm run build`
- Corrige errores de linting: `npm run lint:fix`

### Error: "No hay cambios para desplegar"

- Verifica que has hecho cambios: `git status`
- Asegúrate de que los archivos no están en `.gitignore`

## Flujo de Trabajo Recomendado

1. **Desarrollo local**

   ```bash
   npm run dev
   ```

2. **Antes de desplegar**

   ```bash
   npm run lint:fix
   npm run format
   npm run test
   npm run build
   ```

3. **Desplegar**

   ```bash
   npm run deploy "Descripción de los cambios"
   ```

4. **Verificar en GitHub**
   - Revisa que el commit aparece en GitHub
   - Si tienes GitHub Pages, verifica que se desplegó correctamente

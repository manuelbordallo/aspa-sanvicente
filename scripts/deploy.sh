#!/bin/bash

# Script para desplegar automáticamente los cambios en GitHub
# Uso: ./scripts/deploy.sh "mensaje del commit"

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en un repositorio git
if [ ! -d ".git" ]; then
    log_error "No estás en un repositorio Git. Ejecuta 'git init' primero."
    exit 1
fi

# Obtener el mensaje del commit
COMMIT_MESSAGE="$1"
if [ -z "$COMMIT_MESSAGE" ]; then
    COMMIT_MESSAGE="Actualización automática $(date '+%Y-%m-%d %H:%M:%S')"
fi

log_info "Iniciando despliegue automático..."

# Verificar si hay cambios
if git diff --quiet && git diff --staged --quiet; then
    log_warning "No hay cambios para desplegar."
    exit 0
fi

# Ejecutar linting y formateo
log_info "Ejecutando linting y formateo..."
if command -v npm &> /dev/null; then
    if [ -f "package.json" ]; then
        # Formatear código
        if npm run format:check &> /dev/null; then
            log_success "Código ya está formateado correctamente"
        else
            log_info "Formateando código..."
            npm run format
        fi
        
        # Ejecutar linting
        log_info "Ejecutando linting..."
        if npm run lint &> /dev/null; then
            log_success "Linting pasó correctamente"
        else
            log_warning "Hay warnings de linting, pero continuando..."
        fi
    fi
fi

# Ejecutar build para verificar que todo compila
log_info "Verificando que el proyecto compila..."
if command -v npm &> /dev/null && [ -f "package.json" ]; then
    if npm run build &> /dev/null; then
        log_success "Build exitoso"
    else
        log_error "El build falló. No se puede desplegar."
        exit 1
    fi
fi

# Agregar todos los archivos
log_info "Agregando archivos al staging..."
git add .

# Verificar que hay archivos en staging
if git diff --staged --quiet; then
    log_warning "No hay cambios en staging después de agregar archivos."
    exit 0
fi

# Hacer commit
log_info "Creando commit: '$COMMIT_MESSAGE'"
git commit -m "$COMMIT_MESSAGE"

# Verificar si hay un remote configurado
if ! git remote get-url origin &> /dev/null; then
    log_error "No hay un remote 'origin' configurado."
    log_info "Configura el remote con: git remote add origin <URL_DEL_REPOSITORIO>"
    exit 1
fi

# Obtener la rama actual
CURRENT_BRANCH=$(git branch --show-current)
if [ -z "$CURRENT_BRANCH" ]; then
    CURRENT_BRANCH="main"
fi

# Push a GitHub
log_info "Subiendo cambios a GitHub (rama: $CURRENT_BRANCH)..."
if git push origin "$CURRENT_BRANCH"; then
    log_success "¡Despliegue exitoso! Los cambios están en GitHub."
else
    log_error "Error al subir los cambios a GitHub."
    log_info "Puede que necesites configurar la autenticación o la rama upstream."
    log_info "Intenta: git push -u origin $CURRENT_BRANCH"
    exit 1
fi

log_success "🚀 Despliegue completado exitosamente!"
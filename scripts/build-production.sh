#!/bin/bash

# Production build script with validation and optimization
# Usage: ./scripts/build-production.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log_info "Starting production build process..."

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js version 18 or higher required. Current: $(node -v)"
    exit 1
fi
log_success "Node.js version check passed: $(node -v)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Are you in the project root?"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    log_info "Installing dependencies..."
    npm ci
    log_success "Dependencies installed"
fi

# Check for environment file
if [ ! -f ".env.production" ]; then
    log_warning "No .env.production file found. Using defaults."
    if [ ! -f ".env.example" ]; then
        log_error "No .env.example file found either. Cannot proceed."
        exit 1
    fi
    log_info "Copying .env.example to .env.production"
    cp .env.example .env.production
fi

# Run linting
log_info "Running linter..."
if npm run lint; then
    log_success "Linting passed"
else
    log_error "Linting failed. Fix errors before building."
    exit 1
fi

# Check code formatting
log_info "Checking code formatting..."
if npm run format:check; then
    log_success "Code formatting is correct"
else
    log_warning "Code formatting issues found. Auto-fixing..."
    npm run format
    log_success "Code formatted"
fi

# Run tests
log_info "Running tests..."
if npm run test; then
    log_success "All tests passed"
else
    log_error "Tests failed. Fix failing tests before building."
    exit 1
fi

# TypeScript compilation check
log_info "Checking TypeScript compilation..."
if npx tsc --noEmit; then
    log_success "TypeScript compilation successful"
else
    log_error "TypeScript compilation failed"
    exit 1
fi

# Clean previous build
log_info "Cleaning previous build..."
npm run build:clean
log_success "Build directory cleaned"

# Build for production
log_info "Building for production..."
if npm run build:prod; then
    log_success "Production build completed"
else
    log_error "Production build failed"
    exit 1
fi

# Check build output
if [ ! -d "dist" ]; then
    log_error "Build directory 'dist' not found"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    log_error "index.html not found in build output"
    exit 1
fi

# Calculate build size
BUILD_SIZE=$(du -sh dist | cut -f1)
log_info "Build size: $BUILD_SIZE"

# Check for large files
log_info "Checking for large files..."
LARGE_FILES=$(find dist -type f -size +500k)
if [ -n "$LARGE_FILES" ]; then
    log_warning "Large files found (>500KB):"
    echo "$LARGE_FILES"
else
    log_success "No large files found"
fi

# Summary
echo ""
log_success "🚀 Production build completed successfully!"
echo ""
log_info "Build output: ./dist"
log_info "Build size: $BUILD_SIZE"
echo ""
log_info "Next steps:"
echo "  1. Test the build: npm run preview"
echo "  2. Deploy to hosting platform"
echo "  3. Verify deployment"
echo ""

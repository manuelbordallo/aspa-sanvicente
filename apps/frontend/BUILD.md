# Build and Deployment Guide

## Build Configuration

This project uses Vite as the build tool with optimizations for production deployment.

## Environment Variables

### Configuration Files

- `.env.example` - Template with all available variables
- `.env.development` - Development environment settings
- `.env.production` - Production environment settings
- `.env` - Local overrides (not committed to git)

### Available Variables

```bash
# API Configuration
VITE_API_BASE_URL          # API endpoint URL
VITE_API_TIMEOUT           # Request timeout in milliseconds

# Application
VITE_APP_NAME              # Application display name
VITE_APP_DEFAULT_LANGUAGE  # Default UI language (es, en)
VITE_APP_DEFAULT_THEME     # Default theme (light, dark, system)

# Features
VITE_ENABLE_NOTIFICATIONS  # Enable toast notifications
VITE_ENABLE_ANALYTICS      # Enable analytics tracking

# Authentication
VITE_AUTH_TOKEN_KEY        # LocalStorage key for auth token
VITE_AUTH_TOKEN_EXPIRY     # Token expiry time in milliseconds

# Development
VITE_ENABLE_DEBUG          # Enable debug logging
```

### Setup

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Update values for your environment:
   ```bash
   # Edit .env with your configuration
   nano .env
   ```

## Build Commands

### Development Build

```bash
# Start development server with hot reload
npm run dev
```

### Production Build

```bash
# Clean build for production
npm run build:prod

# Or standard build
npm run build
```

### Preview Production Build

```bash
# Build and preview locally
npm run build
npm run preview
```

### Analyze Bundle Size

```bash
# Build with bundle analysis
npm run build:analyze
```

## Build Optimizations

### Code Splitting

The build automatically splits code into chunks:

- `lit-core` - Core Lit library
- `lit-router` - Router functionality
- `lit-context` - Context API
- Dynamic imports for views (lazy loading)

### Minification

- JavaScript minified with Terser
- CSS minified automatically
- HTML minified in production
- Console logs removed in production

### Performance Targets

- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Total Bundle Size < 600KB
- Individual Chunk < 200KB

## Deployment

### GitHub Pages (Automated)

The project includes GitHub Actions workflow for automatic deployment:

1. **On Push to Main**: Automatically builds and deploys
2. **On Pull Request**: Runs tests and build validation

#### Setup GitHub Pages

1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. Site will be available at: `https://username.github.io/repository`

#### Configure Secrets

Add these secrets in GitHub repository settings:

```
VITE_API_BASE_URL - Production API URL (optional)
```

### Manual Deployment

#### Using Deploy Script

```bash
# Deploy with automatic commit message
npm run deploy

# Deploy with custom message
npm run deploy:msg "Feature: Add user management"
```

The script automatically:

- Formats code with Prettier
- Runs ESLint
- Builds the project
- Commits changes
- Pushes to GitHub

#### Manual Steps

```bash
# 1. Validate code quality
npm run validate

# 2. Build for production
npm run build:prod

# 3. Commit and push
git add .
git commit -m "Build: Production deployment"
git push origin main
```

### Other Hosting Platforms

#### Netlify

1. Connect your GitHub repository
2. Build command: `npm run build:prod`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard

#### Vercel

1. Import your GitHub repository
2. Framework preset: Vite
3. Build command: `npm run build:prod`
4. Output directory: `dist`
5. Add environment variables in Vercel dashboard

#### Traditional Web Server

1. Build the project:

   ```bash
   npm run build:prod
   ```

2. Upload `dist/` folder contents to your web server

3. Configure server for SPA routing:

   **Apache (.htaccess)**:

   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   **Nginx**:

   ```nginx
   location / {
     try_files $uri $uri/ /index.html;
   }
   ```

## CI/CD Pipeline

### GitHub Actions Workflow

The `.github/workflows/ci-cd.yml` file defines:

#### Test and Build Job

- Checkout code
- Install dependencies
- Run linter
- Check code formatting
- Run tests with coverage
- Build project
- Upload build artifacts

#### Deploy Job (main branch only)

- Build for production
- Deploy to GitHub Pages
- Update deployment status

### Running Locally

Test the CI pipeline locally:

```bash
# Run all checks
npm run validate

# Individual checks
npm run lint
npm run format:check
npm run test
npm run build
```

## Build Output

### Directory Structure

```
dist/
├── index.html           # Entry HTML file
├── assets/
│   ├── index-[hash].js  # Main application bundle
│   ├── lit-core-[hash].js
│   ├── lit-router-[hash].js
│   ├── lit-context-[hash].js
│   ├── [view]-[hash].js # Lazy-loaded view chunks
│   └── index-[hash].css # Compiled styles
└── vite.svg            # Static assets
```

### File Naming

- `[hash]` - Content hash for cache busting
- Hashes change only when file content changes
- Enables long-term caching strategies

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
npm run build:clean
npm ci
npm run build
```

### TypeScript Errors

```bash
# Check TypeScript compilation
npx tsc --noEmit
```

### Large Bundle Size

```bash
# Analyze bundle
npm run build:analyze

# Check for:
# - Unused dependencies
# - Large libraries that could be replaced
# - Missing code splitting
```

### Environment Variables Not Working

1. Ensure variables start with `VITE_`
2. Restart dev server after changing `.env`
3. Check `src/config/env.ts` for proper mapping

### Deployment Issues

```bash
# Verify build works locally
npm run build
npm run preview

# Check GitHub Actions logs
# Repository → Actions → Latest workflow run
```

## Performance Monitoring

### Lighthouse

```bash
# Build and preview
npm run build
npm run preview

# Run Lighthouse in Chrome DevTools
# Or use CLI:
npx lighthouse http://localhost:4173
```

### Bundle Analysis

Use tools to analyze bundle composition:

```bash
# Install analyzer
npm install -D rollup-plugin-visualizer

# Build with analysis
npm run build:analyze
```

## Best Practices

1. **Always test builds locally** before deploying
2. **Use environment variables** for configuration
3. **Keep dependencies updated** for security
4. **Monitor bundle size** to maintain performance
5. **Use semantic versioning** for releases
6. **Document breaking changes** in commits
7. **Test in production-like environment** before release

## Version Management

Update version in `package.json`:

```bash
# Patch release (0.0.x)
npm version patch

# Minor release (0.x.0)
npm version minor

# Major release (x.0.0)
npm version major
```

This automatically:

- Updates `package.json`
- Creates a git tag
- Commits the change

## Support

For issues or questions:

1. Check this documentation
2. Review GitHub Actions logs
3. Check Vite documentation: https://vitejs.dev
4. Review deployment platform docs

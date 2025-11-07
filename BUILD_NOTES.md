# Build Configuration Notes

## Installation

After pulling the latest changes, run:

```bash
npm install
```

This will install all dependencies including `terser` for production builds.

## Build Configuration

The project is configured with two minification options:

### Default: esbuild (Faster)

- Current setting in `vite.config.ts`
- Faster build times
- Good compression
- No additional dependencies needed

### Optional: terser (Better Compression)

- Better compression ratios
- Removes console.log statements
- Requires `terser` package (already in package.json)

To use terser, change in `vite.config.ts`:

```typescript
minify: 'terser',
```

And add back terserOptions:

```typescript
terserOptions: {
  compress: {
    drop_console: true,
    drop_debugger: true,
  },
},
```

## Build Commands

```bash
# Development build
npm run dev

# Production build (with esbuild)
npm run build

# Production build (optimized)
npm run build:prod

# Preview production build
npm run preview
```

## Verification

To verify the build configuration:

```bash
# Check TypeScript compilation
npx tsc --noEmit

# Test build
npm run build

# Check output
ls -lh dist/
```

## Troubleshooting

### "terser not found" error

If you see this error, either:

1. Install dependencies:

   ```bash
   npm install
   ```

2. Or switch to esbuild minification (already done in current config)

### Build fails

```bash
# Clean and rebuild
npm run build:clean
npm install
npm run build
```

### TypeScript errors

```bash
# Check for errors
npx tsc --noEmit

# Check specific files
npx tsc --noEmit src/config/env.ts
```

## Performance

Both minifiers produce excellent results:

- **esbuild**: ~1-2 seconds build time
- **terser**: ~3-5 seconds build time, slightly smaller output

For most cases, esbuild is recommended for faster iteration.

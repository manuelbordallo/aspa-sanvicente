# Production Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Code Quality

- [ ] All tests passing (`npm run test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code properly formatted (`npm run format:check`)
- [ ] TypeScript compilation successful (`npx tsc --noEmit`)
- [ ] No console.log statements in production code
- [ ] All TODO/FIXME comments addressed

### Configuration

- [ ] Environment variables configured (`.env.production`)
- [ ] API endpoints point to production servers
- [ ] Authentication tokens/keys updated
- [ ] Feature flags set appropriately
- [ ] Debug mode disabled (`VITE_ENABLE_DEBUG=false`)
- [ ] Analytics enabled if needed (`VITE_ENABLE_ANALYTICS=true`)

### Build

- [ ] Production build successful (`npm run build:prod`)
- [ ] Bundle size within limits (< 600KB total)
- [ ] No build warnings
- [ ] Source maps disabled or configured properly
- [ ] Assets properly optimized

### Testing

- [ ] Manual testing in production-like environment
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing
- [ ] Authentication flow tested
- [ ] All critical user paths tested
- [ ] Error handling tested

### Security

- [ ] No sensitive data in code or config files
- [ ] API keys stored securely (environment variables)
- [ ] HTTPS configured on hosting platform
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] Input validation implemented
- [ ] XSS protection in place
- [ ] CORS configured correctly

### Performance

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.5s
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] Code splitting configured

### Documentation

- [ ] README.md updated
- [ ] CHANGELOG.md updated with version changes
- [ ] API documentation current
- [ ] Deployment documentation reviewed
- [ ] Environment variables documented

## Deployment

### GitHub Pages

- [ ] Repository settings configured for Pages
- [ ] GitHub Actions workflow enabled
- [ ] Secrets configured in repository settings
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS enforced

### Other Platforms

- [ ] Platform account configured
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

### Docker (if applicable)

- [ ] Dockerfile tested locally
- [ ] docker-compose.yml configured
- [ ] Container registry configured
- [ ] Health checks working
- [ ] Volumes configured for persistence

## Post-Deployment

### Verification

- [ ] Application accessible at production URL
- [ ] All pages load correctly
- [ ] Authentication working
- [ ] API connections successful
- [ ] Static assets loading
- [ ] No console errors in browser

### Monitoring

- [ ] Error tracking configured (if applicable)
- [ ] Analytics tracking verified (if enabled)
- [ ] Performance monitoring active
- [ ] Uptime monitoring configured
- [ ] Logs accessible

### Rollback Plan

- [ ] Previous version tagged in git
- [ ] Rollback procedure documented
- [ ] Database backup created (if applicable)
- [ ] Quick rollback tested

## Version Management

### Git

- [ ] All changes committed
- [ ] Version number updated in package.json
- [ ] Git tag created for release
- [ ] Changes pushed to remote
- [ ] Release notes created

### Communication

- [ ] Team notified of deployment
- [ ] Users notified of changes (if needed)
- [ ] Maintenance window communicated (if needed)
- [ ] Support team briefed on changes

## Optimization Checks

### Bundle Analysis

```bash
npm run build:analyze
```

- [ ] No duplicate dependencies
- [ ] Large libraries justified
- [ ] Tree shaking working
- [ ] Code splitting effective

### Performance Testing

```bash
npm run build
npm run preview
# Run Lighthouse in Chrome DevTools
```

- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 90

### Load Testing

- [ ] Application handles expected traffic
- [ ] API rate limits configured
- [ ] Caching strategy implemented
- [ ] CDN configured (if applicable)

## Emergency Contacts

Document key contacts for production issues:

- **DevOps Lead**: [Name/Contact]
- **Backend Team**: [Contact]
- **Hosting Support**: [Platform support link]
- **On-Call Engineer**: [Contact]

## Rollback Procedure

If issues occur after deployment:

1. **Immediate**: Revert to previous version

   ```bash
   git revert HEAD
   git push origin main
   ```

2. **GitHub Pages**: Previous deployment will auto-restore

3. **Docker**: Roll back to previous image

   ```bash
   docker-compose down
   docker-compose up -d [previous-tag]
   ```

4. **Notify team** of rollback and issue

5. **Document issue** for post-mortem

## Sign-Off

- [ ] Developer: ********\_******** Date: **\_\_\_**
- [ ] QA: ********\_******** Date: **\_\_\_**
- [ ] DevOps: ********\_******** Date: **\_\_\_**
- [ ] Product Owner: ********\_******** Date: **\_\_\_**

## Notes

Additional notes or special considerations for this deployment:

---

**Deployment Date**: ******\_\_\_******
**Version**: ******\_\_\_******
**Deployed By**: ******\_\_\_******

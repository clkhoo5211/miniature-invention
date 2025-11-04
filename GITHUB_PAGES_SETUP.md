# GitHub Pages Deployment Setup Guide

## ✅ What's Been Fixed

1. **Updated GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
   - ✅ Upgraded to latest action versions (`@v4` for checkout/setup-node, `@v4` for Pages actions)
   - ✅ Added proper permissions for GitHub Pages deployment
   - ✅ Added `GITHUB_REPOSITORY` environment variable to build step
   - ✅ Using official GitHub Pages deployment actions (`actions/deploy-pages@v4`)
   - ✅ Added npm caching for faster builds
   - ✅ Using `npm ci` for consistent installs

2. **Fixed Next.js Configuration** (`next.config.js`):
   - ✅ Updated default repository name from `compliant-private-transfers` to `miniature-invention`
   - ✅ Configuration now correctly sets `basePath` and `assetPrefix` for GitHub Pages

## 📋 Setup Steps Required

### 1. Enable GitHub Pages in Repository Settings

1. Go to: `https://github.com/clkhoo5211/miniature-invention/settings/pages`
2. Under **Source**, select: **GitHub Actions**
3. Save the settings

**Important**: The workflow uses the new GitHub Pages deployment method (GitHub Actions), not the old `gh-pages` branch method.

### 2. Verify Repository Configuration

The workflow is configured to deploy to:
- **Repository**: `clkhoo5211/miniature-invention`
- **Branch**: `main`
- **Base Path**: `/miniature-invention` (auto-detected from repository name)

### 3. Optional: Set Environment Secrets

If you need custom contract addresses, add them in repository settings:
- Go to: `https://github.com/clkhoo5211/miniature-invention/settings/secrets/actions`
- Add secret: `NEXT_PUBLIC_CONTRACT_ADDRESS` (if different from default)

### 4. Trigger Deployment

The workflow will automatically run when you:
- Push to the `main` branch
- Manually trigger via: Actions → Deploy to GitHub Pages → Run workflow

## 🔗 Deployment URLs

After deployment, your site will be available at:
- **GitHub Pages**: `https://clkhoo5211.github.io/miniature-invention/`
- **Direct URL**: The workflow will output the deployment URL in the Actions log

## 📝 How It Works

1. **Build**: Next.js builds a static export with `basePath: /miniature-invention`
2. **Upload**: The `out/` directory is uploaded as a Pages artifact
3. **Deploy**: GitHub Pages serves the static files from the artifact

## ✅ Verification Checklist

After pushing to `main`, verify:

- [ ] GitHub Actions workflow runs successfully (check Actions tab)
- [ ] Build step completes without errors
- [ ] Deployment step completes successfully
- [ ] Site is accessible at `https://clkhoo5211.github.io/miniature-invention/`
- [ ] All assets (CSS, JS, images) load correctly
- [ ] Navigation works (routes should include `/miniature-invention` prefix)

## 🐛 Troubleshooting

### Build Fails

**Issue**: Build step fails with errors
- **Check**: Look at the Actions log for specific error messages
- **Common fixes**:
  - Ensure `package.json` has all required dependencies
  - Check that `npm ci` can install dependencies
  - Verify Node.js version (workflow uses v20)

### Assets Not Loading (404s)

**Issue**: CSS/JS files return 404 errors
- **Cause**: `basePath` or `assetPrefix` not set correctly
- **Fix**: Verify `next.config.js` has correct repository name
- **Check**: Browser console for asset paths (should include `/miniature-invention/`)

### Page Not Found

**Issue**: Site loads but routes return 404
- **Cause**: `basePath` not matching GitHub Pages URL structure
- **Fix**: Verify the repository name matches in `next.config.js`
- **Check**: GitHub Pages settings show correct source branch

### Deployment Not Triggering

**Issue**: Workflow doesn't run after push
- **Check**: Ensure you're pushing to `main` branch
- **Check**: Workflow file exists at `.github/workflows/deploy.yml`
- **Check**: GitHub Pages is set to use "GitHub Actions" as source

## 📊 Monitoring

Monitor your deployment:
- **Actions Log**: `https://github.com/clkhoo5211/miniature-invention/actions`
- **Workflow Status**: Check the badge in README.md
- **Deployment Status**: Go to Settings → Pages to see deployment history

## 🔄 Update Process

To update the site:
1. Make changes to your code
2. Commit and push to `main` branch
3. Workflow automatically builds and deploys
4. Site updates within 1-2 minutes

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [GitHub Actions for Pages](https://github.com/actions/deploy-pages)


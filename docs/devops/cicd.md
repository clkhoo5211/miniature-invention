# CI/CD Pipeline Documentation

## Overview

The Compliant Private Transfers project uses GitHub Actions for continuous integration and continuous deployment.

## Workflows

### 1. CI Workflow (`.github/workflows/ci.yml`)

**Trigger**: On push and pull requests to `main`, `master`, `develop`

**Jobs**:
1. **Typecheck**: TypeScript type checking
2. **Lint**: Code linting (non-blocking)
3. **Build**: Production build
4. **Bundle Analysis**: Bundle size reporting
5. **Tests**: Unit test execution
6. **Coverage**: Test coverage (if configured)
7. **Security Audit**: npm audit (non-blocking)

**Duration**: ~3-5 minutes

**Status Badge**: 
```markdown
![CI](https://github.com/your-org/compliant-private-transfers/workflows/CI/badge.svg)
```

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)

**Trigger**: 
- On release publication
- Manual workflow dispatch

**Jobs**:
1. **Build**: Production build with environment variables
2. **Archive**: Create deployment archive
3. **Deploy to IPFS**: Upload to Pinata or Kubo API
4. **Publish to IPNS**: Update IPNS (optional)
5. **Summary**: Create deployment summary

**Duration**: ~5-10 minutes

**Inputs**:
- `publish_to_ipns`: Boolean, default `true`

## Configuration

### Required Secrets

For **CI Workflow**:
- None required (uses default values)

For **Deploy Workflow**:
- `PINATA_API_KEY` - Pinata API key (recommended)
- `PINATA_SECRET_API_KEY` - Pinata secret key
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Smart contract address (optional)
- `IPFS_API_URL` - IPFS API endpoint (if using Kubo)
- `IPNS_KEY_NAME` - IPNS key identifier (if using IPNS)

### Environment Variables

**Build-time** (embedded in build):
- `NEXT_PUBLIC_CONTRACT_ADDRESS`
- `NEXT_PUBLIC_ETHEREUM_RPC`
- `NEXT_PUBLIC_POLYGON_RPC`
- `NEXT_PUBLIC_ARBITRUM_RPC`
- `NEXT_PUBLIC_OPTIMISM_RPC`
- `NEXT_PUBLIC_ENABLE_ICP_IDENTITY`

## Workflow Details

### CI Workflow Steps

```yaml
1. Checkout repository
2. Setup Node.js 20 with npm cache
3. Install dependencies (npm ci)
4. Typecheck (npm run typecheck)
5. Lint (npm run lint) - non-blocking
6. Build (npm run build)
7. Analyze bundle size
8. Run tests (npm test)
9. Test coverage (optional)
10. Security audit (npm audit) - non-blocking
```

### Deploy Workflow Steps

```yaml
1. Checkout repository
2. Setup Node.js 20 with npm cache
3. Install dependencies (npm ci)
4. Build with production env vars
5. Create deployment archive
6. Deploy to IPFS (Pinata or Kubo)
7. Publish to IPNS (if enabled)
8. Create deployment summary
9. Cleanup temporary files
```

## Usage

### Running CI Locally

```bash
# Run all CI checks locally
npm run typecheck
npm run lint
npm run build
npm test
npm audit
```

### Triggering Deployment

**Method 1: Create Release**
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
# Then create GitHub Release from tag
```

**Method 2: Manual Trigger**
1. Go to Actions tab
2. Select "Deploy to IPFS"
3. Click "Run workflow"
4. Select branch and options
5. Click "Run workflow"

**Method 3: Local Deployment**
```bash
npm run deploy:ipfs
# or
npm run deploy:ipfs:full
```

## Monitoring

### Workflow Status

**View in GitHub**:
- Actions tab → Workflow runs
- Click run to see details
- Download logs/artifacts

**Via CLI**:
```bash
gh run list --workflow=ci.yml
gh run list --workflow=deploy.yml
gh run view <run-id>
```

### Notifications

**Configure**:
1. Repository Settings → Notifications
2. Enable email for workflow failures
3. Set up webhooks for Slack/Discord (optional)

## Troubleshooting

### CI Failures

**Typecheck Failures**:
- Fix TypeScript errors
- Check type definitions
- Verify tsconfig.json

**Build Failures**:
- Check for missing dependencies
- Verify environment variables
- Check Next.js configuration

**Test Failures**:
- Review test output
- Check test mocks
- Verify test environment

### Deployment Failures

**IPFS Upload Fails**:
- Verify Pinata credentials
- Check IPFS_API_URL
- Test network connectivity

**IPNS Publish Fails**:
- Verify IPNS key exists
- Check IPNS_KEY_NAME secret
- Verify IPFS node has IPNS support

## Best Practices

1. **Test Before Deploy**:
   - Always test locally first
   - Verify CI passes before merging
   - Review deployment logs

2. **Secret Management**:
   - Never commit secrets
   - Use GitHub Secrets
   - Rotate keys regularly

3. **Environment Variables**:
   - Use NEXT_PUBLIC_ prefix for browser vars
   - Keep secrets separate from config
   - Document all variables

4. **Deployment Process**:
   - Tag releases properly
   - Review deployment summary
   - Verify post-deployment

5. **Monitoring**:
   - Set up notifications
   - Review workflow runs regularly
   - Monitor deployment success rate

## Advanced Configuration

### Custom Runners

To use self-hosted runners:

```yaml
jobs:
  deploy:
    runs-on: self-hosted
    # ... rest of job
```

### Matrix Builds

To test multiple Node versions:

```yaml
strategy:
  matrix:
    node-version: [18, 20, 22]
```

### Conditional Deployments

```yaml
if: github.ref == 'refs/heads/main'
# or
if: github.event_name == 'release'
```

---

**Last Updated**: 2025-10-31  
**Maintained By**: DevOps Team


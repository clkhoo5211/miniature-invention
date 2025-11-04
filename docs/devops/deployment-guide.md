# Production Deployment Guide

## Overview

This guide covers deploying the Compliant Private Transfers application to IPFS/IPNS for production use.

## Prerequisites

1. ✅ Source code ready and tested
2. ✅ All tests passing
3. ✅ Environment variables configured
4. ✅ IPFS infrastructure set up (Pinata or self-hosted)
5. ✅ IPNS key created (if using IPNS)

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

#### Using GitHub Actions

1. **Configure Secrets**:
   - Go to Repository Settings → Secrets and variables → Actions
   - Add required secrets (see [Environment Management](./environment-management.md))

2. **Create Release**:
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```
   Then create a GitHub Release from the tag.

3. **Manual Deployment**:
   - Go to Actions → Deploy to IPFS
   - Click "Run workflow"
   - Select branch and options
   - Click "Run workflow"

4. **Monitor Deployment**:
   - Check Actions tab for deployment status
   - Review deployment summary for CID and IPNS name

### Method 2: Local Deployment

#### Using npm Script

```bash
# Simple deployment (IPFS only)
npm run deploy:ipfs

# Full deployment (IPFS + IPNS)
PUBLISH_TO_IPNS=true npm run deploy:ipfs:full
```

#### Using Pinata

```bash
# Install Pinata CLI (optional)
npm install -g pinata-cli

# Build application
npm run build

# Pin to Pinata
pinata-cli pin --file out --name "compliant-private-transfers-$(date +%Y%m%d)"
```

### Method 3: Manual Deployment

1. **Build**:
   ```bash
   npm run build
   ```

2. **Create Archive**:
   ```bash
   cd out
   tar -czf ../build.tar.gz .
   cd ..
   ```

3. **Upload to IPFS**:
   ```bash
   # Using curl (Kubo API)
   curl -X POST -F "file=@build.tar.gz" \
     "http://127.0.0.1:5001/api/v0/add?pin=true"

   # Or use Pinata API
   curl -X POST \
     -H "pinata_api_key: YOUR_API_KEY" \
     -H "pinata_secret_api_key: YOUR_SECRET_KEY" \
     -F "file=@build.tar.gz" \
     "https://api.pinata.cloud/pinning/pinFileToIPFS"
   ```

4. **Publish to IPNS** (optional):
   ```bash
   curl -X POST \
     "http://127.0.0.1:5001/api/v0/name/publish?arg=/ipfs/CID&key=YOUR_KEY"
   ```

## Post-Deployment Verification

### 1. Verify IPFS Content

```bash
# Test IPFS gateway access
curl -I https://ipfs.io/ipfs/YOUR_CID

# Verify content loads
open https://ipfs.io/ipfs/YOUR_CID
```

### 2. Verify IPNS (if published)

```bash
# Test IPNS resolution
curl -I https://ipfs.io/ipns/YOUR_IPNS_NAME

# Verify IPNS points to correct CID
ipfs name resolve YOUR_IPNS_NAME
```

### 3. Test Application

1. **Connect Wallet**: Verify MetaMask connection works
2. **RPC Connection**: Test transaction submission
3. **Contract Interaction**: Verify contract calls work
4. **All Pages**: Navigate through all routes

### 4. Gateway Testing

Test multiple gateways:
- `https://ipfs.io/ipfs/CID`
- `https://cloudflare-ipfs.com/ipfs/CID`
- `https://gateway.pinata.cloud/ipfs/CID`

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Secrets set in CI/CD
- [ ] IPFS infrastructure ready
- [ ] IPNS key created (if using)

### Deployment
- [ ] Trigger deployment workflow
- [ ] Monitor deployment logs
- [ ] Verify CID received
- [ ] Verify IPNS published (if enabled)
- [ ] Save deployment artifacts

### Post-Deployment
- [ ] Verify content on IPFS gateways
- [ ] Test application functionality
- [ ] Verify RPC connections
- [ ] Test all user flows
- [ ] Update documentation with new CID/IPNS

## Rollback Procedures

### Quick Rollback

1. **Identify Previous Deployment**:
   - Check GitHub Actions history
   - Find previous CID/IPNS

2. **Update IPNS** (if using):
   ```bash
   curl -X POST \
     "http://127.0.0.1:5001/api/v0/name/publish?arg=/ipfs/PREVIOUS_CID&key=YOUR_KEY"
   ```

3. **Notify Users**:
   - Update documentation
   - Announce rollback if necessary

### Emergency Rollback

1. **Pin Previous Version**:
   - Re-pin previous CID
   - Ensure it's accessible

2. **Update DNS/Custom Domain** (if configured):
   - Point to previous CID
   - Update CDN configuration

## Monitoring

### Key Metrics

1. **Deployment Success Rate**: Track successful deployments
2. **Gateway Availability**: Monitor gateway response times
3. **IPFS Node Health**: Check pinning status
4. **IPNS Resolution**: Verify IPNS updates propagate
5. **Application Errors**: Monitor browser console errors

### Alerts

Set up alerts for:
- Deployment failures
- IPFS node connectivity issues
- Gateway downtime
- High error rates

## Best Practices

1. **Version Control**: Tag releases before deployment
2. **Testing**: Always test in staging before production
3. **Backup**: Keep backup of previous deployments
4. **Documentation**: Document each deployment
5. **Monitoring**: Set up monitoring and alerts
6. **Rollback Plan**: Always have a rollback plan ready

## Troubleshooting

### Deployment Fails

**Check**:
- GitHub Actions logs
- Secrets configuration
- IPFS node connectivity
- Network connectivity

### IPNS Not Updating

**Check**:
- IPNS key is valid
- IPFS node has IPNS support
- Update command executed correctly
- Propagation delay (can take several minutes)

### Content Not Accessible

**Check**:
- CID is correct
- Content is pinned
- Gateway is accessible
- Network connectivity

---

**Last Updated**: 2025-10-31  
**Maintained By**: DevOps Team


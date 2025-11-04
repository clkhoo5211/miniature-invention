# IPFS/IPNS Deployment Guide

## Overview

The Compliant Private Transfers UI is built as a static Next.js export, ready for deployment to IPFS/IPNS for decentralized hosting.

## Prerequisites

1. **IPFS Node**: Install and run IPFS (Kubo)
   ```bash
   # Install IPFS
   brew install ipfs  # macOS
   # or download from https://dist.ipfs.tech/kubo/latest/
   
   # Initialize and start
   ipfs init
   ipfs daemon
   ```

2. **Build Tools**: `tar`, `curl`, `jq` (for bash script)

## Quick Deployment

### Using npm script (recommended)

```bash
npm run deploy:ipfs
```

This uses the simplified bash script (`deploy-ipfs-simple.sh`).

### Manual deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Create archive:
   ```bash
   tar -czf build.tar.gz -C out .
   ```

3. Upload to IPFS:
   ```bash
   curl -X POST -F "file=@build.tar.gz" \
     http://127.0.0.1:5001/api/v0/add?pin=true
   ```

4. Publish to IPNS (optional):
   ```bash
   curl -X POST \
     "http://127.0.0.1:5001/api/v0/name/publish?arg=/ipfs/CID&key=self"
   ```

## Environment Variables

Configure deployment via environment variables:

```bash
export IPFS_API_URL="http://127.0.0.1:5001"
export PUBLISH_TO_IPNS="true"  # Set to 'true' to publish to IPNS
export IPNS_KEY="self"          # IPNS key name
```

## Deployment Scripts

### `deploy-ipfs-simple.sh` (Recommended)

Simple bash script with minimal dependencies:
- ✅ Works on macOS/Linux
- ✅ Requires: `tar`, `curl`, `jq`
- ✅ Fast and reliable

**Usage:**
```bash
npm run deploy:ipfs
# or
bash scripts/deploy-ipfs-simple.sh
```

### `deploy-ipfs.sh` (Full-featured)

Comprehensive bash script with detailed logging:
- ✅ Full error handling
- ✅ Progress indicators
- ✅ Detailed output

**Usage:**
```bash
npm run deploy:ipfs:full
# or
bash scripts/deploy-ipfs.sh
```

## Deployment Steps

The scripts automatically:

1. ✅ **Build** - Runs `npm run build`
2. ✅ **Archive** - Creates `build-TIMESTAMP.tar.gz`
3. ✅ **Upload** - Uploads to IPFS via API
4. ✅ **Pin** - Pins the content on IPFS node
5. ✅ **Publish** - Optionally publishes to IPNS
6. ✅ **Cleanup** - Removes temporary archive

## Accessing Deployed UI

After deployment, you'll receive:

- **CID**: Content identifier (e.g., `QmXxxx...`)
- **IPNS Name** (if published): Human-readable name

### IPFS Gateway URLs

- Main gateway: `https://ipfs.io/ipfs/CID`
- Cloudflare: `https://cloudflare-ipfs.com/ipfs/CID`
- Pinata: `https://gateway.pinata.cloud/ipfs/CID`

### IPNS Gateway URLs (if published)

- Main gateway: `https://ipfs.io/ipns/IPNS_NAME`
- Cloudflare: `https://cloudflare-ipfs.com/ipns/IPNS_NAME`

## Updating Deployments

To update an IPNS publication:

```bash
# Get new CID after deployment
NEW_CID="QmXxxx..."

# Update IPNS
curl -X POST \
  "http://127.0.0.1:5001/api/v0/name/publish?arg=/ipfs/$NEW_CID&key=self"
```

The IPNS name remains the same, pointing to the new CID.

## Troubleshooting

### IPFS node not accessible

```bash
# Check if IPFS is running
curl http://127.0.0.1:5001/api/v0/version

# Start IPFS daemon
ipfs daemon
```

### Archive creation fails

- Ensure `out/` directory exists after build
- Check disk space
- Verify `tar` command is available

### Upload fails

- Check IPFS API URL is correct
- Verify IPFS node is running
- Check network connectivity
- Review IPFS node logs

### IPNS publish fails

- Ensure IPNS key exists: `ipfs key list`
- Try using `self` key first
- Check IPFS node has proper permissions

## Best Practices

1. **Pin Content**: Always use `pin=true` to ensure content persists
2. **IPNS for Updates**: Use IPNS for human-readable, updatable URLs
3. **Gateway Choice**: Use multiple gateways for redundancy
4. **Versioning**: Keep track of CIDs for rollback capability

## Production Deployment

For production:

1. Use a dedicated IPFS node
2. Configure IPNS with a custom key
3. Set up gateway redundancy
4. Monitor IPFS node health
5. Consider pinning service (Pinata, Infura, etc.)

## Example Workflow

```bash
# 1. Build
npm run build

# 2. Deploy to IPFS
npm run deploy:ipfs

# 3. Get CID and IPNS from output

# 4. Access via gateway
# https://ipfs.io/ipfs/QmXxxx...
# or
# https://ipfs.io/ipns/k51xxx...
```

## Related Files

- `scripts/deploy-ipfs-simple.sh` - Simple deployment script
- `scripts/deploy-ipfs.sh` - Full-featured deployment script
- `src/ipfs/publishIpns.ts` - IPFS publishing utilities
- `next.config.js` - Next.js config with static export


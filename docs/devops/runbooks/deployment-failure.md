# Runbook: Deployment Failure

## Symptoms

- GitHub Actions deployment workflow fails
- Deployment script errors
- IPFS upload fails
- IPNS publish fails

## Diagnosis

### Check GitHub Actions Logs

1. Go to Actions tab
2. Find failed workflow run
3. Review error messages
4. Check failed step

### Common Error Messages

**"Cannot connect to IPFS node"**:
- IPFS node not running
- IPFS_API_URL incorrect
- Network connectivity issue

**"PINATA_API_KEY not found"**:
- Secret not configured in GitHub
- Secret name incorrect

**"Build failed"**:
- TypeScript errors
- Missing dependencies
- Environment variables missing

## Resolution

### IPFS Connection Issues

1. **Verify IPFS Node**:
   ```bash
   curl http://127.0.0.1:5001/api/v0/version
   ```

2. **Check IPFS_API_URL**:
   - Verify secret in GitHub Settings
   - Test endpoint accessibility
   - Check network connectivity

3. **Use Pinata Instead**:
   - Configure PINATA_API_KEY secret
   - Workflow will use Pinata automatically

### Missing Secrets

1. **Check Required Secrets**:
   - PINATA_API_KEY
   - PINATA_SECRET_API_KEY
   - NEXT_PUBLIC_CONTRACT_ADDRESS (if needed)

2. **Add Missing Secrets**:
   - Go to Repository Settings → Secrets
   - Add required secrets
   - Re-run workflow

### Build Failures

1. **Fix TypeScript Errors**:
   ```bash
   npm run typecheck
   ```

2. **Fix Missing Dependencies**:
   ```bash
   npm ci
   ```

3. **Fix Environment Variables**:
   - Check .env.example
   - Verify all required variables set

## Prevention

1. **Test Locally First**:
   ```bash
   npm run build
   npm run deploy:ipfs
   ```

2. **Verify Secrets Before Deployment**:
   - Check all secrets configured
   - Test IPFS connectivity
   - Verify API keys valid

3. **Monitor Build Status**:
   - Set up notifications
   - Review logs regularly

## Escalation

If issue persists:
1. Check IPFS/Pinata service status
2. Review recent code changes
3. Consult infrastructure team
4. Check GitHub Actions status page

---

**Last Updated**: 2025-10-31


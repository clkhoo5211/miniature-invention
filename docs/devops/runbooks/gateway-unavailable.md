# Runbook: Gateway Unavailable

## Symptoms

- Users cannot access application
- Gateway returns 404 or timeout
- Content not loading
- IPFS CID not resolving

## Diagnosis

### Check Gateway Status

```bash
# Test main gateways
curl -I https://ipfs.io/ipfs/YOUR_CID
curl -I https://cloudflare-ipfs.com/ipfs/YOUR_CID
curl -I https://gateway.pinata.cloud/ipfs/YOUR_CID
```

### Check IPFS Pin Status

**Pinata Dashboard**:
1. Log in to Pinata
2. Check pinned content
3. Verify CID status

**Self-Hosted IPFS**:
```bash
ipfs pin ls | grep YOUR_CID
ipfs pin verify
```

### Check IPNS (if using)

```bash
# Resolve IPNS name
ipfs name resolve YOUR_IPNS_NAME

# Check if pointing to correct CID
curl -I https://ipfs.io/ipns/YOUR_IPNS_NAME
```

## Resolution

### Content Not Pinned

1. **Re-pin Content**:
   ```bash
   # Using Pinata
   curl -X POST \
     -H "pinata_api_key: YOUR_KEY" \
     -H "pinata_secret_api_key: YOUR_SECRET" \
     -F "file=@build.tar.gz" \
     "https://api.pinata.cloud/pinning/pinFileToIPFS"
   ```

2. **Re-deploy**:
   - Trigger deployment workflow
   - Verify pinning succeeds
   - Confirm CID matches

### Gateway Down

1. **Try Alternative Gateways**:
   - Use different gateway URL
   - Update documentation with alternatives
   - Notify users of gateway change

2. **Wait for Recovery**:
   - Gateway outages are usually temporary
   - Monitor gateway status
   - Wait for automatic recovery

### IPNS Not Resolving

1. **Check IPNS Status**:
   ```bash
   ipfs name resolve YOUR_IPNS_NAME
   ```

2. **Re-publish IPNS**:
   ```bash
   curl -X POST \
     "http://127.0.0.1:5001/api/v0/name/publish?arg=/ipfs/CID&key=YOUR_KEY"
   ```

3. **Wait for Propagation**:
   - IPNS updates can take several minutes
   - Check multiple gateways
   - Verify resolution

## Prevention

1. **Multiple Pinning Services**:
   - Use multiple pinning services
   - Redundant pinning provides backup

2. **Gateway Redundancy**:
   - Document multiple gateway URLs
   - Users can try different gateways

3. **Monitoring**:
   - Set up health checks
   - Alert on gateway failures
   - Monitor pin status

## Emergency Actions

### Immediate Response

1. **Check Status**:
   - Verify all gateways down
   - Check pin status
   - Confirm CID validity

2. **Re-pin if Needed**:
   - Use backup pinning service
   - Verify content accessible

3. **Notify Users**:
   - Post status update
   - Provide alternative gateway URLs
   - Estimate recovery time

### Long-term Solution

1. **Infrastructure Review**:
   - Assess pinning strategy
   - Consider additional redundancy
   - Review gateway choices

2. **Documentation Update**:
   - Update gateway URLs
   - Document backup procedures
   - Create incident response guide

## Escalation

If multiple gateways down and content lost:
1. Check Pinata/infrastructure status
2. Re-deploy from source
3. Update IPNS if needed
4. Notify stakeholders

---

**Last Updated**: 2025-10-31


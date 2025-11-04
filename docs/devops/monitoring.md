# Monitoring & Operations

## Overview

Monitoring and operational procedures for the Compliant Private Transfers application deployed on IPFS/IPNS.

## Monitoring Stack

### 1. GitHub Actions Monitoring

**What to Monitor**:
- Build success/failure rate
- Test pass rate
- Deployment success
- Build duration

**Tools**:
- GitHub Actions dashboard
- GitHub Actions API
- Webhook notifications

**Alerts**:
- Failed builds
- Failed deployments
- Test failures

### 2. IPFS Monitoring

**What to Monitor**:
- IPFS node health
- Pin status
- Content availability
- Gateway response times

**Tools**:
- IPFS node metrics
- Pinata dashboard (if using)
- Gateway health checks

**Alerts**:
- IPFS node offline
- Content unpinned
- High latency

### 3. Application Monitoring

**What to Monitor**:
- Gateway availability
- Application load times
- Error rates
- User interactions

**Tools**:
- Browser console errors
- Web analytics (optional)
- User feedback

**Alerts**:
- High error rates
- Gateway downtime
- Performance degradation

## Monitoring Setup

### GitHub Actions Status

**Check Build Status**:
```bash
# View latest workflow run
gh run list --workflow=ci.yml

# View deployment status
gh run list --workflow=deploy.yml
```

**Set up Notifications**:
1. Go to Repository Settings → Notifications
2. Enable email notifications for workflow failures
3. Configure webhook for Slack/Discord (optional)

### IPFS Node Monitoring

**Pinata Dashboard**:
1. Log in to Pinata
2. View pinned content status
3. Monitor API usage
4. Check gateway performance

**Self-Hosted IPFS**:
```bash
# Check IPFS node status
curl http://127.0.0.1:5001/api/v0/version

# Check pinned content
ipfs pin ls

# Monitor node metrics
ipfs stats bw
```

### Gateway Health Checks

**Create Health Check Script**:

```bash
#!/bin/bash
# health-check.sh

CID="YOUR_CID"
GATEWAYS=(
  "https://ipfs.io/ipfs/$CID"
  "https://cloudflare-ipfs.com/ipfs/$CID"
  "https://gateway.pinata.cloud/ipfs/$CID"
)

for gateway in "${GATEWAYS[@]}"; do
  status=$(curl -s -o /dev/null -w "%{http_code}" "$gateway")
  if [ "$status" == "200" ]; then
    echo "✅ $gateway - OK"
  else
    echo "❌ $gateway - FAILED (HTTP $status)"
  fi
done
```

**Schedule Health Checks**:
- Use cron or scheduled CI/CD job
- Run every 5-15 minutes
- Alert on failures

## Alerting

### Critical Alerts

**Immediate Action Required**:
1. Deployment failures
2. IPFS content loss (unpinned)
3. All gateways unavailable
4. Critical security issues

### Warning Alerts

**Investigate Soon**:
1. Single gateway failure
2. High latency
3. Build warnings
4. Test failures

### Info Alerts

**Monitor Trends**:
1. Deployment frequency
2. Gateway performance trends
3. Build duration trends
4. Usage patterns

## Logging

### Application Logs

**Browser Console**:
- Errors logged to console
- User can report errors
- Consider error tracking service (optional)

### Build Logs

**GitHub Actions**:
- Full build logs in Actions tab
- Downloadable artifacts
- Retention: 90 days (GitHub default)

### Deployment Logs

**GitHub Actions**:
- Deployment workflow logs
- CID and IPNS output
- Error messages

### IPFS Logs

**Pinata**:
- Access via Pinata dashboard
- API request logs
- Pinning status history

**Self-Hosted**:
```bash
# View IPFS daemon logs
ipfs daemon > ipfs.log 2>&1

# Check error logs
tail -f ipfs.log | grep -i error
```

## Operational Procedures

### Daily Checks

1. **Build Status**: Verify latest builds succeeded
2. **Gateway Health**: Check main gateways accessible
3. **IPFS Pins**: Verify content still pinned
4. **Error Reports**: Review any user-reported issues

### Weekly Review

1. **Deployment History**: Review deployments
2. **Performance Trends**: Analyze metrics
3. **Security Updates**: Check for dependency updates
4. **Documentation**: Update as needed

### Monthly Review

1. **Infrastructure Costs**: Review spending
2. **Performance Optimization**: Identify improvements
3. **Security Audit**: Review access and secrets
4. **Capacity Planning**: Assess growth needs

## Incident Response

### Incident Severity Levels

**P0 - Critical**:
- Application completely unavailable
- Security breach
- Data loss

**P1 - High**:
- Major feature broken
- Significant performance degradation
- Partial unavailability

**P2 - Medium**:
- Minor feature issues
- Performance degradation
- Non-critical errors

**P3 - Low**:
- Cosmetic issues
- Minor improvements needed

### Response Procedures

**P0/P1 Incidents**:
1. Acknowledge incident
2. Assess impact
3. Begin resolution
4. Update stakeholders
5. Post-mortem

**P2/P3 Incidents**:
1. Log issue
2. Prioritize fix
3. Schedule resolution
4. Update documentation

### Runbooks

See [Runbooks](./runbooks/) directory for detailed procedures:
- Deployment failures
- IPFS node issues
- Gateway unavailability
- Rollback procedures

## Performance Metrics

### Key Metrics to Track

1. **Build Time**: Track build duration trends
2. **Deployment Time**: Monitor deployment duration
3. **Gateway Response Time**: Measure gateway latency
4. **IPFS Availability**: Track content availability
5. **Error Rate**: Monitor application errors

### Performance Targets

- **Build Time**: < 5 minutes
- **Deployment Time**: < 10 minutes
- **Gateway Response**: < 2 seconds
- **IPFS Availability**: > 99.9%
- **Error Rate**: < 1%

## Tools and Services

### Recommended Tools

1. **GitHub Actions**: CI/CD and monitoring
2. **Pinata Dashboard**: IPFS monitoring
3. **Sentry** (optional): Error tracking
4. **Uptime Robot** (optional): Uptime monitoring
5. **Custom Scripts**: Health checks

### Setup Instructions

See individual tool documentation for setup:
- [GitHub Actions](https://docs.github.com/en/actions)
- [Pinata](https://docs.pinata.cloud)
- [Sentry](https://docs.sentry.io)
- [Uptime Robot](https://uptimerobot.com)

---

**Last Updated**: 2025-10-31  
**Maintained By**: DevOps Team


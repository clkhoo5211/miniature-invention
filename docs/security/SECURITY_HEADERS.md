# Security Headers Configuration

**Date**: 2025-01-02  
**Status**: Documentation for Static Export

---

## Overview

Since this application uses Next.js static export (`output: 'export'`), the `headers()` function in `next.config.js` is not available. Security headers must be configured at the **hosting level** (IPFS gateway, Nginx, CDN, etc.).

---

## Required Security Headers

### 1. Content Security Policy (CSP)

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.ethereum.org https://*.polygon-rpc.com https://*.arbitrum.io https://*.optimism.io https://identity.ic0.app https://*.infura.io; frame-ancestors 'none';
```

**Rationale**:
- Allows inline scripts/styles for Next.js and Tailwind CSS
- Permits connections to blockchain RPC endpoints and ICP Internet Identity
- Prevents clickjacking with `frame-ancestors 'none'`

### 2. X-Frame-Options

```
X-Frame-Options: DENY
```

**Rationale**: Prevents clickjacking attacks by disallowing iframe embedding.

### 3. X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

**Rationale**: Prevents MIME-type sniffing attacks.

### 4. X-XSS-Protection

```
X-XSS-Protection: 1; mode=block
```

**Rationale**: Enables XSS filtering in older browsers (modern browsers handle via CSP).

### 5. Referrer-Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

**Rationale**: Limits referrer information sent to external sites.

### 6. Permissions-Policy

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Rationale**: Disables unnecessary browser features.

---

## Implementation Examples

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/compliant-private-transfers;
    index index.html;
    
    location / {
        try_files $uri $uri/ $uri.html /index.html;
        
        # Security headers
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.ethereum.org https://*.polygon-rpc.com https://*.arbitrum.io https://*.optimism.io https://identity.ic0.app https://*.infura.io; frame-ancestors 'none';" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

### IPFS Gateway (via Nginx Reverse Proxy)

If using IPFS with an Nginx reverse proxy:

```nginx
location /ipfs/ {
    proxy_pass http://localhost:8080/ipfs/;
    
    # Security headers
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.ethereum.org https://*.polygon-rpc.com https://*.arbitrum.io https://*.optimism.io https://identity.ic0.app https://*.infura.io; frame-ancestors 'none';" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
}
```

### Cloudflare Workers

```javascript
export default {
  async fetch(request) {
    const response = await fetch(request);
    const newHeaders = new Headers(response.headers);
    
    newHeaders.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.ethereum.org https://*.polygon-rpc.com https://*.arbitrum.io https://*.optimism.io https://identity.ic0.app https://*.infura.io; frame-ancestors 'none';");
    newHeaders.set('X-Frame-Options', 'DENY');
    newHeaders.set('X-Content-Type-Options', 'nosniff');
    newHeaders.set('X-XSS-Protection', '1; mode=block');
    newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
```

### AWS CloudFront

1. Go to CloudFront distribution → Behaviors → Edit
2. Add custom headers in "Response Headers Policy":
   - Content-Security-Policy
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: camera=(), microphone=(), geolocation=()

### Vercel / Netlify

For platforms that serve static sites:

1. **Vercel**: Add `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.ethereum.org https://*.polygon-rpc.com https://*.arbitrum.io https://*.optimism.io https://identity.ic0.app https://*.infura.io; frame-ancestors 'none';"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

2. **Netlify**: Add `_headers` file in `public/`:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.ethereum.org https://*.polygon-rpc.com https://*.polygon-rpc.com https://*.arbitrum.io https://*.optimism.io https://identity.ic0.app https://*.infura.io; frame-ancestors 'none';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Testing Security Headers

### Online Tools
- [SecurityHeaders.com](https://securityheaders.com/) - Scan your domain
- [Mozilla Observatory](https://observatory.mozilla.org/) - Security headers analysis

### Command Line
```bash
curl -I https://your-domain.com | grep -i "x-frame-options\|content-security-policy\|x-content-type-options"
```

### Browser DevTools
1. Open DevTools → Network tab
2. Reload page
3. Click on document request
4. Check Response Headers section

---

## CSP Exceptions

The CSP includes `'unsafe-inline'` and `'unsafe-eval'` because:
- **Next.js** requires inline scripts for hydration
- **Tailwind CSS** uses inline styles
- **Web3 libraries** may require `eval()` for some operations

**Future Improvement**: Consider using nonces or hashes for stricter CSP in future versions.

---

## Priority

**🟠 HIGH** - Must be configured before production deployment.

**Status**: ⏳ Pending deployment configuration

**Next Steps**:
1. Configure headers at hosting level (Nginx, CloudFront, etc.)
2. Test headers using SecurityHeaders.com
3. Verify CSP doesn't block required resources
4. Document hosting-specific configuration

---

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN: Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security)


/**
 * Security utilities for input validation, sanitization, and protection
 */

export interface SecurityValidationResult {
  isValid: boolean;
  sanitized?: string;
  error?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  let value = input;

  // Decode common HTML entities so we can normalize the value
  const entityMap: Record<string, string> = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
  };
  value = value.replace(/(&lt;|&gt;|&amp;|&quot;|&#39;)/g, (m) => entityMap[m] || m);

  // Remove full script/style blocks including their inner content
  value = value.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  value = value.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  // Neutralize javascript: protocol and inline event handlers
  value = value.replace(/javascript:/gi, '');
  value = value.replace(/on\w+=/gi, '');

  // Remove control characters
  value = value.replace(/[\x00-\x1f\x7f-\x9f]/g, '');

  // Trim and limit length
  return value.trim().slice(0, 1000);
}

/**
 * Enhanced address validation with security checks
 */
export function validateAddressSecure(address: string): SecurityValidationResult {
  if (!address) {
    return { isValid: false, error: 'Address is required', severity: 'medium' };
  }

  // Try to extract a valid Ethereum address even if wrapped in tags or extra text
  const extracted = address.match(/0x[a-fA-F0-9]{40}/)?.[0] || sanitizeString(address);

  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(extracted)) {
    return { 
      isValid: false, 
      error: 'Invalid Ethereum address format', 
      severity: 'medium' 
    };
  }

  // Check for known malicious patterns
  const suspiciousPatterns = [
    /^0x0+$/,  // All zeros
    /^0xf+$/i, // All F's
    /^0x1+$/,  // All 1's
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(extracted)) {
      return { 
        isValid: false, 
        error: 'suspicious address pattern detected', 
        severity: 'high' 
      };
    }
  }

  return { isValid: true, sanitized: extracted };
}

/**
 * Enhanced amount validation with security checks
 */
export function validateAmountSecure(amount: string): SecurityValidationResult {
  if (!amount) {
    return { isValid: false, error: 'Amount is required', severity: 'medium' };
  }

  // Sanitize input
  const sanitized = sanitizeString(amount);
  
  // Allow optional leading sign for intermediate input, we'll validate positivity below
  if (!/^[+-]?\d*(?:\.\d*)?$/.test(sanitized)) {
    return { 
      isValid: false, 
      error: 'Amount contains invalid characters', 
      severity: 'high' 
    };
  }

  // Validate numeric format
  const num = parseFloat(sanitized);
  if (isNaN(num)) {
    return { 
      isValid: false, 
      error: 'Amount must be a valid number', 
      severity: 'medium' 
    };
  }

  // Security limits
  if (num < 0) {
    return { 
      isValid: false, 
      error: 'Amount must be positive', 
      severity: 'medium' 
    };
  }
  if (num === 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than zero',
      severity: 'medium'
    };
  }

  if (num > 1000000) { // 1M limit
    return { 
      isValid: false, 
      error: 'Amount too large', 
      severity: 'high' 
    };
  }

  // Check for precision attacks
  const decimalPlaces = (sanitized.split('.')[1] || '').length;
  if (decimalPlaces > 18) {
    return { 
      isValid: false, 
      error: 'Too many decimal places', 
      severity: 'medium' 
    };
  }

  return { isValid: true, sanitized };
}

/**
 * Validate and sanitize network selection
 */
export function validateNetworkSecure(network: string): SecurityValidationResult {
  if (!network) {
    return { isValid: false, error: 'Network is required', severity: 'medium' };
  }

  const sanitized = sanitizeString(network).toLowerCase();
  const validNetworks = ['ethereum', 'polygon', 'arbitrum', 'optimism', 'solana', 'bnb', 'tron'];
  
  if (!validNetworks.includes(sanitized)) {
    return { 
      isValid: false, 
      error: 'Invalid network selection', 
      severity: 'high' 
    };
  }

  return { isValid: true, sanitized };
}

/**
 * Validate and sanitize asset selection
 */
export function validateAssetSecure(asset: string, network: string): SecurityValidationResult {
  if (!asset) {
    return { isValid: false, error: 'Asset is required', severity: 'medium' };
  }

  const sanitizedAsset = sanitizeString(asset).toUpperCase();
  const sanitizedNetwork = sanitizeString(network).toLowerCase();

  const validAssets: Record<string, string[]> = {
    ethereum: ['ETH', 'USDC', 'USDT', 'DAI', 'WETH'],
    polygon: ['MATIC', 'USDC', 'USDT', 'DAI', 'WETH'],
    arbitrum: ['ETH', 'USDC', 'USDT', 'DAI', 'WETH'],
    optimism: ['ETH', 'USDC', 'USDT', 'DAI', 'WETH'],
    solana: ['SOL', 'USDC', 'USDT'],
    bnb: ['BNB', 'USDC', 'USDT', 'BUSD'],
    tron: ['TRX', 'USDT', 'USDC'],
  };

  const assets = validAssets[sanitizedNetwork] || [];
  if (!assets.includes(sanitizedAsset)) {
    return { 
      isValid: false, 
      error: `Asset ${sanitizedAsset} not supported on ${sanitizedNetwork}`, 
      severity: 'high' 
    };
  }

  return { isValid: true, sanitized: sanitizedAsset };
}

/**
 * Rate limiting helper
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Secure session storage with encryption-like obfuscation
 */
export function secureStore(key: string, data: unknown): void {
  try {
    const serialized = JSON.stringify(data);
    const encoded = btoa(serialized); // Basic encoding (not encryption)
    sessionStorage.setItem(`secure_${key}`, encoded);
  } catch (error) {
    console.error('Failed to store secure data:', error);
  }
}

export function secureRetrieve(key: string): unknown {
  try {
    const encoded = sessionStorage.getItem(`secure_${key}`);
    if (!encoded) return null;
    
    const serialized = atob(encoded);
    return JSON.parse(serialized);
  } catch (error) {
    console.error('Failed to retrieve secure data:', error);
    return null;
  }
}

/**
 * Content Security Policy helpers
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow https and http protocols
    if (!['https:', 'http:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    // Preserve original formatting (avoid auto-adding trailing slash)
    return url.trim();
  } catch {
    return 'about:blank';
  }
}

/**
 * Input validation middleware for forms
 */
export function validateFormInputs(inputs: Record<string, string>): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const sanitized: Record<string, string> = {};

  const rawAddress = inputs.address ?? '';
  const rawAmount = inputs.amount ?? '';
  const rawNetwork = inputs.network ?? '';
  const rawAsset = inputs.asset ?? '';

  // Address: try to extract a valid Ethereum address even if wrapped in tags
  const addrMatch = rawAddress.match(/0x[a-fA-F0-9]{40}/);
  const addressCandidate = addrMatch ? addrMatch[0] : sanitizeString(rawAddress);
  const addrValidation = validateAddressSecure(addressCandidate);
  if (!addrValidation.isValid) {
    errors.address = addrValidation.error || 'Invalid address';
  }
  if (addrValidation.sanitized) {
    sanitized.address = addrValidation.sanitized;
  } else if (addrMatch) {
    sanitized.address = addressCandidate;
  } else {
    sanitized.address = sanitizeString(rawAddress);
  }

  // Amount
  const amtValidation = validateAmountSecure(rawAmount);
  if (!amtValidation.isValid) {
    errors.amount = amtValidation.error || 'Invalid amount';
  }
  if (amtValidation.sanitized) {
    sanitized.amount = amtValidation.sanitized;
  } else {
    sanitized.amount = sanitizeString(rawAmount);
  }

  // Network
  const netValidation = validateNetworkSecure(rawNetwork);
  if (!netValidation.isValid) {
    errors.network = netValidation.error || 'Invalid network';
  }
  const sanitizedNetwork = netValidation.sanitized || sanitizeString(rawNetwork).toLowerCase();
  sanitized.network = sanitizedNetwork;

  // Asset (depends on network)
  const assetValidation = validateAssetSecure(rawAsset, sanitizedNetwork);
  if (!assetValidation.isValid) {
    errors.asset = assetValidation.error || 'Invalid asset';
  }
  if (assetValidation.sanitized) {
    sanitized.asset = assetValidation.sanitized;
  } else {
    sanitized.asset = sanitizeString(rawAsset).toUpperCase();
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized,
  };
}
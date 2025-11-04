/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sanitizeString,
  validateAddressSecure,
  validateAmountSecure,
  validateNetworkSecure,
  validateAssetSecure,
  rateLimiter,
  secureStore,
  secureRetrieve,
  sanitizeUrl,
  validateFormInputs
} from '../app/lib/security';

// Mock sessionStorage for testing
const mockSessionStorage = {
  store: new Map<string, string>(),
  getItem: vi.fn((key: string) => mockSessionStorage.store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
    mockSessionStorage.store.set(key, value);
  }),
  removeItem: vi.fn((key: string) => {
    mockSessionStorage.store.delete(key);
  }),
  clear: vi.fn(() => {
    mockSessionStorage.store.clear();
  })
};

// Mock global sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe('Security Utilities', () => {
  beforeEach(() => {
    mockSessionStorage.store.clear();
    vi.clearAllMocks();
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeString('<script>alert("xss")</script>hello')).toBe('hello');
    });

    it('should decode HTML entities', () => {
      expect(sanitizeString('&lt;script&gt;')).toBe('<script>');
    });

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello world  ')).toBe('hello world');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeString(null as any)).toBe('');
      expect(sanitizeString(undefined as any)).toBe('');
    });
  });

  describe('validateAddressSecure', () => {
    it('should validate correct Ethereum addresses', () => {
      const result = validateAddressSecure('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid addresses', () => {
      const result = validateAddressSecure('invalid-address');
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject addresses with suspicious patterns', () => {
      const result = validateAddressSecure('0x0000000000000000000000000000000000000000');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('suspicious');
    });

    it('should sanitize input', () => {
      const result = validateAddressSecure('<script>0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6</script>');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateAmountSecure', () => {
    it('should validate positive amounts', () => {
      const result = validateAmountSecure('100.5');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('100.5');
    });

    it('should reject negative amounts', () => {
      const result = validateAmountSecure('-100');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('positive');
    });

    it('should reject zero amounts', () => {
      const result = validateAmountSecure('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('greater than zero');
    });

    it('should reject extremely large amounts', () => {
      const result = validateAmountSecure('999999999999999999999');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('should handle decimal precision limits', () => {
      const result = validateAmountSecure('100.123456789012345678901');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('decimal places');
    });
  });

  describe('rateLimiter', () => {
    beforeEach(() => {
      // Reset rate limiter state
      rateLimiter.reset('user1');
      rateLimiter.reset('user2');
    });

    it('should allow requests within limit', () => {
      expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(true);
      expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(true);
      expect(rateLimiter.isAllowed('user1', 5, 60000)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      expect(rateLimiter.isAllowed('user1', 2, 60000)).toBe(true);
      expect(rateLimiter.isAllowed('user1', 2, 60000)).toBe(true);
      expect(rateLimiter.isAllowed('user1', 2, 60000)).toBe(false); // Should be blocked
    });

    it('should handle different users separately', () => {
      expect(rateLimiter.isAllowed('user1', 1, 60000)).toBe(true);
      expect(rateLimiter.isAllowed('user2', 1, 60000)).toBe(true); // Different user
      expect(rateLimiter.isAllowed('user1', 1, 60000)).toBe(false); // Same user blocked
    });
  });

  describe('secureStore and secureRetrieve', () => {
    it('should store and retrieve data correctly', () => {
      const testData = { amount: '100', address: '0x123' };
      
      secureStore('test-key', testData);
      const retrieved = secureRetrieve('test-key');
      
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = secureRetrieve('non-existent-key');
      expect(result).toBeNull();
    });

    it('should handle storage errors gracefully', () => {
      // Mock sessionStorage to throw an error
      mockSessionStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      expect(() => secureStore('test-key', { data: 'test' })).not.toThrow();
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow safe URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
      expect(sanitizeUrl('http://localhost:3000')).toBe('http://localhost:3000');
    });

    it('should block dangerous protocols', () => {
      expect(sanitizeUrl('javascript:alert("xss")')).toBe('about:blank');
      expect(sanitizeUrl('data:text/html,<script>alert("xss")</script>')).toBe('about:blank');
    });

    it('should handle malformed URLs', () => {
      expect(sanitizeUrl('not-a-url')).toBe('about:blank');
      expect(sanitizeUrl('')).toBe('about:blank');
    });
  });

  describe('validateFormInputs', () => {
    it('should validate all inputs successfully', () => {
      const inputs = {
        address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        amount: '100.5',
        network: 'ethereum',
        asset: 'ETH'
      };

      const result = validateFormInputs(inputs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should collect all validation errors', () => {
      const inputs = {
        address: 'invalid-address',
        amount: '-100',
        network: 'invalid-network',
        asset: ''
      };

      const result = validateFormInputs(inputs);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(4);
    });

    it('should sanitize all inputs', () => {
      const inputs = {
        address: '<script>0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6</script>',
        amount: '  100.5  ',
        network: 'ethereum',
        asset: 'ETH'
      };

      const result = validateFormInputs(inputs);
      expect(result.sanitized.address).toBe('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
      expect(result.sanitized.amount).toBe('100.5');
    });
  });
});
/**
 * Form validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate Ethereum address format
 */
export function validateAddress(address: string): ValidationResult {
  if (!address) {
    return { isValid: false, error: 'Address is required' };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { isValid: false, error: 'Invalid Ethereum address format' };
  }

  return { isValid: true };
}

/**
 * Validate amount (must be a positive number)
 */
export function validateAmount(amount: string): ValidationResult {
  if (!amount) {
    return { isValid: false, error: 'Amount is required' };
  }

  const num = parseFloat(amount);
  if (isNaN(num)) {
    return { isValid: false, error: 'Amount must be a number' };
  }

  if (num <= 0) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }

  return { isValid: true };
}

/**
 * Validate network selection
 */
export function validateNetwork(network: string): ValidationResult {
  const validNetworks = ['ethereum', 'polygon', 'arbitrum', 'optimism'];
  
  if (!validNetworks.includes(network)) {
    return { isValid: false, error: 'Invalid network selection' };
  }

  return { isValid: true };
}

/**
 * Validate asset selection based on network
 */
export function validateAsset(asset: string, network: string): ValidationResult {
  if (!asset) {
    return { isValid: false, error: 'Asset is required' };
  }

  const validAssets: Record<string, string[]> = {
    ethereum: ['ETH', 'USDC', 'USDT'],
    polygon: ['MATIC', 'USDC', 'USDT'],
    arbitrum: ['ETH', 'USDC', 'USDT'],
    optimism: ['ETH', 'USDC', 'USDT'],
  };

  const assets = validAssets[network] || [];
  if (!assets.includes(asset)) {
    return { isValid: false, error: `Asset ${asset} not supported on ${network}` };
  }

  return { isValid: true };
}


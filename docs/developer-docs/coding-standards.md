# Coding Standards

**Last Updated**: 2025-10-31  
**Version**: 1.0

---

## TypeScript Standards

### Type Definitions

- **Always define types explicitly** - avoid `any`
- **Use interfaces for object shapes**
- **Use types for unions and intersections**

```typescript
// ✅ Good
interface DepositNote {
  note: string;
  asset: string;
  denomination: string;
}

// ❌ Bad
const note: any = { note: '...', asset: 'ETH' };
```

### Null Safety

- **Use optional chaining** (`?.`)
- **Provide default values** where appropriate
- **Check for null/undefined** before use

```typescript
// ✅ Good
const balance = await adapter.getBalance(address) || '0';
const note = notes.find(n => n.asset === asset) ?? defaultNote;

// ❌ Bad
const balance = await adapter.getBalance(address); // Could be undefined
```

---

## React Standards

### Component Structure

```typescript
'use client'; // For client components

import { useState, useEffect } from 'react';
import type { ComponentProps } from './types';

export default function ComponentName(props: ComponentProps) {
  // 1. Hooks
  const [state, setState] = useState<Type>(initialValue);
  
  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 3. Event handlers
  const handleAction = () => {
    // Handler logic
  };
  
  // 4. Render
  return (
    // JSX
  );
}
```

### Hooks Rules

- **Only call hooks at top level** - not in loops/conditions
- **Use dependency arrays correctly**
- **Extract custom hooks** for reusable logic

```typescript
// ✅ Good
useEffect(() => {
  fetchData();
}, [dependency]);

// ❌ Bad
if (condition) {
  useEffect(() => { }); // Wrong!
}
```

---

## Naming Conventions

### Files and Directories

- **Components**: PascalCase (`WalletConnect.tsx`)
- **Utilities**: camelCase (`note.ts`, `validation.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_AMOUNT`)
- **Types/Interfaces**: PascalCase (`DepositNote`, `WalletState`)

### Functions and Variables

- **Functions**: camelCase (`generateNote`, `validateAddress`)
- **Variables**: camelCase (`selectedNetwork`, `txHash`)
- **Constants**: UPPER_SNAKE_CASE or camelCase for config

### Components

- **Component names**: PascalCase
- **Props interface**: `ComponentNameProps`
- **Props destructuring**: Explicit types

```typescript
// ✅ Good
interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  // ...
}

// ❌ Bad
export default function walletConnect(props: any) {
  // ...
}
```

---

## Code Organization

### Import Order

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { encodeFunctionData } from 'viem';

// 3. Internal modules (absolute imports)
import { generateNote } from '@/app/lib/note';
import { validateAddress } from '@/app/lib/validation';

// 4. Types
import type { DepositNote } from '@/app/lib/note';

// 5. Styles (if any)
import styles from './Component.module.css';
```

### Function Organization

```typescript
// 1. Type definitions
interface Params { }

// 2. Helper functions
function helper() { }

// 3. Main function
export function mainFunction() { }

// 4. Exports
export { helper };
```

---

## Error Handling

### Try-Catch Blocks

```typescript
// ✅ Good
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  // Handle error appropriately
  throw new Error('User-friendly error message');
}

// ❌ Bad
const result = await riskyOperation(); // No error handling
```

### Error Messages

- **User-friendly messages** for UI
- **Technical details** in console/logs
- **Error codes** for programmatic handling

```typescript
// ✅ Good
catch (error) {
  if (error.code === 4001) {
    alert('Transaction rejected by user');
  } else {
    console.error('Transaction error:', error);
    alert('Transaction failed. Please try again.');
  }
}
```

---

## Async/Await Patterns

### Promise Handling

```typescript
// ✅ Good
async function fetchData() {
  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    handleError(error);
    throw error;
  }
}

// ❌ Bad
function fetchData() {
  apiCall().then(result => {
    // Nested promises
    return anotherCall(result);
  }).catch(error => {
    // Error handling
  });
}
```

### Parallel Operations

```typescript
// ✅ Good - Parallel execution
const [balance, notes] = await Promise.all([
  getBalance(address),
  listNotes(),
]);

// ✅ Good - Sequential when needed
const balance = await getBalance(address);
const notes = await listNotes(balance);
```

---

## Code Comments

### When to Comment

- **Complex logic** that isn't obvious
- **Why** decisions were made
- **TODOs** and future improvements
- **Public APIs** (JSDoc)

### Comment Style

```typescript
/**
 * Generates a deposit note with cryptographic components.
 * 
 * @param params - Note generation parameters
 * @returns Deposit note with nullifier, secret, and checksum
 * 
 * @example
 * const note = generateNote({ asset: 'ETH', denomination: '1.0' });
 */
export function generateNote(params: NoteParams): DepositNote {
  // Generate random seed for cryptographic components
  const random = Math.random().toString(36).slice(2);
  
  // Create nullifier and secret from seed
  // TODO: Replace with cryptographic random generator
  const nullifier = generateNullifier(random);
  
  // ...
}
```

---

## Testing Standards

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from './module';

describe('ModuleName', () => {
  describe('functionToTest', () => {
    it('should handle normal case', () => {
      const result = functionToTest(input);
      expect(result).toBe(expected);
    });
    
    it('should handle edge case', () => {
      const result = functionToTest(edgeInput);
      expect(result).toBe(expected);
    });
    
    it('should throw error for invalid input', () => {
      expect(() => functionToTest(invalidInput)).toThrow();
    });
  });
});
```

### Test Coverage

- **Aim for 80%+ coverage** on critical paths
- **Test edge cases** and error conditions
- **Mock external dependencies**

---

## Performance Considerations

### Optimization

- **Avoid unnecessary re-renders** (use React.memo, useMemo)
- **Lazy load** heavy components
- **Debounce** user inputs where appropriate
- **Limit localStorage** usage (don't store large objects)

```typescript
// ✅ Good - Memoized
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ Good - Debounced
const debouncedSearch = useDebounce(searchTerm, 300);

// ❌ Bad - Recomputes on every render
const value = computeExpensiveValue(data);
```

---

## Security Standards

### Input Validation

- **Always validate user inputs**
- **Sanitize** data before use
- **Check types** before operations

```typescript
// ✅ Good
const isValid = validateAddress(address);
if (!isValid) {
  throw new Error('Invalid address');
}

// ❌ Bad
const balance = await getBalance(address); // No validation
```

### Sensitive Data

- **Never log** private keys or notes
- **Avoid** storing sensitive data in localStorage
- **Use** secure random generation for secrets

---

## Git Commit Messages

### Format

```
type: subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

### Examples

```
feat: add Solana adapter support

fix: resolve MetaMask connection timeout

docs: update API reference with examples

test: add unit tests for note validation
```

---

## Code Review Checklist

### Before Submitting PR

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] TypeScript checks pass
- [ ] No linting errors
- [ ] Documentation updated
- [ ] No console.logs left
- [ ] Error handling implemented
- [ ] Security considerations addressed

---

**Related Documentation**:
- [Contributing Guidelines](./contributing.md)
- [Development Setup](./development-setup.md)


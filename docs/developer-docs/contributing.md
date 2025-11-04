# Contributing Guidelines

**Last Updated**: 2025-10-31  
**Version**: 1.0

---

## Welcome Contributors!

Thank you for your interest in contributing to Compliant Private Transfers!

---

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Code editor (VS Code recommended)

### Getting Started

```bash
# Clone the repository
git clone <repository-url>
cd compliant-private-transfers

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000`

---

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write clean, documented code
- Follow existing code style
- Add tests for new features
- Update documentation

### 3. Test Your Changes

```bash
# Type checking
npm run typecheck

# Run tests
npm run test

# Linting
npm run lint

# Build
npm run build
```

### 4. Commit Changes

Follow conventional commit format:

```
feat: add new feature
fix: fix bug
docs: update documentation
test: add tests
refactor: refactor code
```

### 5. Submit Pull Request

- Write clear PR description
- Reference issues if applicable
- Ensure all tests pass
- Request review

---

## Code Style

### TypeScript

- Use TypeScript strict mode
- Define types explicitly
- Avoid `any` types
- Use interfaces for object shapes

### React

- Use functional components
- Use hooks (useState, useEffect)
- Keep components small and focused
- Extract logic to custom hooks

### Naming Conventions

- **Components**: PascalCase (`WalletConnect.tsx`)
- **Functions**: camelCase (`generateNote`)
- **Constants**: UPPER_SNAKE_CASE (`NEXT_PUBLIC_CONTRACT_ADDRESS`)
- **Files**: Match export name (`note.ts` for note utilities)

---

## Testing Guidelines

### Unit Tests

- Write tests for all new functions
- Test edge cases and error conditions
- Mock external dependencies
- Aim for high coverage

**Example**:
```typescript
describe('generateNote', () => {
  it('generates valid note format', () => {
    const note = generateNote({ asset: 'ETH', denomination: '1.0' });
    expect(note.note).toMatch(/^note-compliant-ETH-1\.0-/);
  });
});
```

### Test Files

- Location: `tests/`
- Naming: `*.test.ts`
- Framework: Vitest

---

## Documentation

### Code Comments

- Document complex logic
- Explain "why" not "what"
- Use JSDoc for functions

**Example**:
```typescript
/**
 * Generates a deposit note with cryptographic components
 * @param params - Note generation parameters
 * @returns Deposit note with nullifier, secret, and checksum
 */
export function generateNote(params: NoteParams): DepositNote {
  // Implementation
}
```

### Documentation Files

- Update relevant docs when adding features
- Keep examples up to date
- Document breaking changes

---

## Project Structure

```
compliant-private-transfers/
├── app/                    # Next.js App Router
│   ├── components/        # React components
│   ├── lib/               # Client utilities
│   └── [pages]/           # Page routes
├── src/                   # Source modules
│   ├── adapters/          # Blockchain adapters
│   ├── compliance/        # Compliance modules
│   ├── prover/            # ZK proof interface
│   └── ipfs/              # IPFS utilities
├── tests/                 # Unit tests
├── docs/                  # Documentation
└── scripts/               # Utility scripts
```

---

## Key Areas for Contribution

### High Priority

1. **Real ZK Circuits**: Replace dummy prover with circom/snarkjs
2. **Additional Chains**: Solana, BNB Chain, TRON adapters
3. **Smart Contract Deployment**: Deploy and test contracts
4. **Event Indexer**: On-chain event indexing for real stats

### Medium Priority

1. **More Unit Tests**: Increase test coverage
2. **E2E Tests**: Add Playwright/Cypress tests
3. **UI Improvements**: Polish and accessibility
4. **Mobile Responsiveness**: Better mobile experience

### Nice to Have

1. **Hardware Wallet Support**: Ledger, Trezor
2. **Multi-language Support**: i18n
3. **Advanced Analytics**: Transaction analytics
4. **Social Features**: Sharing, referrals

---

## Security Guidelines

### Security Considerations

- Never commit secrets or API keys
- Validate all user inputs
- Use secure random number generation
- Follow secure coding practices

### Reporting Security Issues

- **DO NOT** open public issues for security vulnerabilities
- Email security team directly
- Provide detailed description
- Allow time for fix before disclosure

---

## Code Review Process

### Review Criteria

- Code quality and style
- Test coverage
- Documentation updates
- Security considerations
- Performance impact

### Review Process

1. PR submitted
2. Automated checks run (CI)
3. Code review requested
4. Address feedback
5. Approval and merge

---

## Questions?

- Check [Development Setup](./development-setup.md)
- Review [Architecture](../technical-docs/architecture.md)
- Read [Implementation Guide](../technical-docs/implementation-guide.md)

---

**Thank you for contributing!** 🎉


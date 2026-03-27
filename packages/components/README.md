# @scaffold-ui/components

React components for scaffold-ui applications.

## Installation

**Note**: This package requires `@scaffold-ui/hooks` as a peer dependency.

```bash
# Install both packages
npm install @scaffold-ui/components @scaffold-ui/hooks

# Or with yarn
yarn add @scaffold-ui/components @scaffold-ui/hooks

# Or with pnpm
pnpm add @scaffold-ui/components @scaffold-ui/hooks
```

### Peer Dependencies

You'll also need these peer dependencies if you don't already have them:

```bash
npm install react @types/react viem wagmi @tanstack/react-query
```

## Components

### Address

Displays an EVM-format address with blockie, copy, and block explorer link. Pass a Hedera chain from `viem/chains` for HashScan URLs.

#### Props

- `address?` - The address to display (optional)
- `disableAddressLink?` - Disable the block explorer link (optional)
- `format?` - `"short"` | `"long"` (optional)
- `size?` - `"xs"` | `"sm"` | `"base"` | `"lg"` | `"xl"` | `"2xl"` | `"3xl"` (default `"base"`)
- `chain?` - Viem `Chain` for explorer links (optional; can default from Wagmi config)
- `style?`, `blockExplorerAddressLink?` - Optional styling / URL override

#### Example

```tsx
import { Address } from "@scaffold-ui/components";
import { hederaTestnet } from "viem/chains";

<Address
  address="0x1234567890123456789012345678901234567890"
  chain={hederaTestnet}
/>;
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch for changes during development
pnpm dev

# Lint the code
pnpm lint

# Format the code
pnpm format
```

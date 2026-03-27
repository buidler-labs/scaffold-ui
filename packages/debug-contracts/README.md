# @scaffold-ui/debug-contracts

Debug contracts component.

## Installation

**Note**: This package requires `@scaffold-ui/components` and `@scaffold-ui/hooks` as peer dependencies.

```bash
npm install @scaffold-ui/components @scaffold-ui/hooks @scaffold-ui/debug-contracts
# or
yarn add @scaffold-ui/components @scaffold-ui/hooks @scaffold-ui/debug-contracts
# or
pnpm add @scaffold-ui/components @scaffold-ui/hooks @scaffold-ui/debug-contracts
```

#### Props

- `contracts` (required): An object containing deployed contracts organized by chain ID, where each contract includes address and ABI
- `chainId` (required): The chain ID to use for debugging contracts (number)
- `blockExplorerAddressLink` (optional): The block explorer link for the contract address

## Usage

```tsx
import { Contract } from "@scaffold-ui/debug-contracts";
import "@scaffold-ui/debug-contracts/styles.css";
import { sepolia } from "viem/chains";

// Define your deployed contracts
const deployedContracts = {
  address: "0xBf6D6faFE5B0C009E5447A27A94E093F490Dd0FC",
  abi: [
    // ... your contract ABI
  ],
} as const;

function App() {
  return (
    <Contract
      contracts={deployedContracts}
      chainId={sepolia.id}
    />
  );
}
```

## IntegerInput (with ×1e8 / ×1e18 multiplier)

An integer input with optional **decimal multiplier** buttons for 8 and 18 decimals (e.g. tinybars/HBAR and wei/ETH). Useful for contract read/write forms where amounts are entered in human-readable units then scaled to the chain’s smallest unit.

- **×1e8** – multiplies the current value by 10^8 (e.g. 1 → 100000000). Use for **8-decimal** tokens (Hedera tinybars, etc.).
- **×1e18** – multiplies the current value by 10^18 (e.g. 1 → 1000000000000000000). Use for **18-decimal** wei-style amounts.

The input normalizes integer values so that applying one multiplier then the other uses only the last clicked factor (no double-scaling).

### Props

- `value` (required): Current string value (integer or scaled).
- `onChange` (required): `(value: string) => void`.
- `name?`, `placeholder?`, `disabled?`: Same as other inputs.
- `variant?`: Integer type for validation (default `IntegerVariant.UINT256`).

### Example

```tsx
import { IntegerInput } from "@scaffold-ui/debug-contracts";
import "@scaffold-ui/debug-contracts/styles.css";

function AmountForm() {
  const [value, setValue] = useState("");

  return (
    <IntegerInput
      value={value}
      onChange={setValue}
      placeholder="0"
    />
  );
}
```

The suffix shows **×1e8** and **×1e18** buttons; users type a base number (e.g. `1`) then click a multiplier to fill the field with the scaled integer.

### DecimalMultiplierButtons (standalone)

If you only need the multiplier controls without the full integer input:

```tsx
import { DecimalMultiplierButtons } from "@scaffold-ui/debug-contracts";

<DecimalMultiplierButtons
  value={value}
  onChange={setValue}
  disabled={false}
/>;
```

- `value`: Current string value.
- `onChange`: `(value: string) => void`.
- `disabled?`: Disables the ×1e8 / ×1e18 buttons.

---
name: scaffold-ui-hedera-inputs
description: >-
  Explains Hedera-focused inputs and display components—HederaAddressInput,
  HederaAddress, HbarInput—and their hooks useHederaAddressInput, useHbarInput,
  plus chainId and mirror resolution behavior. Use when implementing forms,
  account ID vs 0x resolution, HBAR/USD amounts, or when the user mentions
  Hedera address input, 0.0.n, HashScan, or scaffold-ui Hedera fields.
---

# Hedera inputs and hooks

## Pairings

| UI | Hook / notes |
|----|----------------|
| `HederaAddressInput` | Uses `useHederaAddressInput` internally from `@scaffold-ui/hooks`. You can also call the hook directly for headless logic. |
| `HbarInput` | Uses `useHbarInput` from `@scaffold-ui/hooks` internally. |
| `HederaAddress` | Display component; pass `chain` / explorer context like `Address`. |

## HederaAddressInput behavior

- **Controlled**: `value` is the raw string in the field (`0.0.n` or `0x…`); `onChange` updates that string. The component does not replace user text with the resolved EVM address.
- **`onResolvedEvmChange`**: Optional callback when the resolved checksummed `Address` changes (e.g. wire to contract calls).
- **`chainId`**: Defaults are Hedera-oriented (hook default `296` testnet); pass `hederaTestnet.id` / `hedera.id` explicitly when needed.
- Resolution and validation use mirror / Hedera utilities in `@scaffold-ui/hooks` (`hederaUtils`, debounced input).

## HbarInput

- Native HBAR entry with USD mode; defaults align with Hedera testnet pricing unless configured otherwise.
- For low-level state without the styled field, use `useHbarInput` from `@scaffold-ui/hooks`.

## Anti-patterns

- Do not assume `value` on `HederaAddressInput` becomes a checksummed `0x` string—read resolved address from `onResolvedEvmChange` or use `useHederaAddressInput` and its `evmAddress`.
- Do not invent viem chain symbols; import `hedera` / `hederaTestnet` from `viem/chains`.

## Examples in repo

- [example/app/components/examples/HederaAddressInputExample.tsx](example/app/components/examples/HederaAddressInputExample.tsx)
- [example/app/components/examples/HbarInputExample.tsx](example/app/components/examples/HbarInputExample.tsx)
- [example/app/components/examples/HederaAddressExample.tsx](example/app/components/examples/HederaAddressExample.tsx)

## Reference

See [reference.md](reference.md) for doc page paths and source files.

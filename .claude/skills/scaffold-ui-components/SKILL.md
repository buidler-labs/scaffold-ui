---
name: scaffold-ui-components
description: >-
  Guides use of the scaffold-ui monorepo packages @scaffold-ui/components,
  @scaffold-ui/hooks, and @scaffold-ui/debug-contracts—imports, peer deps, CSS,
  public exports, and the checklist for adding a new component or hook. Use when
  adding or changing UI in scaffold-ui, consuming these packages from
  scaffold-hbar, or when the user mentions Address, Balance, HederaAddress,
  BaseInput, IntegerInput, debug contracts UI, new hook, or documentation vocs.
---

# scaffold-ui packages

## Which package

| Package | Use for |
|---------|---------|
| `@scaffold-ui/components` | `Address`, `Balance`, `HederaAddress`, `BaseInput`, `HederaAddressInput`, `HbarInput` |
| `@scaffold-ui/hooks` | Wagmi/viem helpers, Hedera resolution, balances, HBAR price, `useHbarInput` state (used internally by `HbarInput`) |
| `@scaffold-ui/debug-contracts` | Contract debug UI, `IntegerInput` and byte inputs for ABI forms |

Components **require** `@scaffold-ui/hooks` as a peer dependency. Install both when consuming from an app.

## Imports and styles

- Default entry: `import { … } from "@scaffold-ui/components"` (see `packages/components/src/index.ts` for the exact export list).
- Styles: import `@scaffold-ui/components/styles.css` once at app root (e.g. Next.js `layout.tsx`). For debug UI, also import `@scaffold-ui/debug-contracts/styles.css`.
- Viem chains: use `hedera` and `hederaTestnet` from `viem/chains` (not legacy names like `hederaMainnet`).

## Theme (colors + Hedera typography)

- Override **`--color-sui-*`** in global CSS for palette; **`--font-sui-family`** for type (default stack favors **Montserrat**; **Styrene A** when the app has a license and loads `@font-face`).
- Import app fonts / overrides **after** package styles unless intentionally replacing tokens. See [docs/pages/components/Theming.mdx](docs/pages/components/Theming.mdx).

## Invariants

- This stack targets **Hedera** + EVM-shaped addresses; there is no separate Ethereum-only `AddressInput` / `EtherInput` in these packages—use `HederaAddressInput` / `HbarInput` or `BaseInput` for generic text.
- For contract debug forms, non-Hedera `address` parameters use **`BaseInput`**, not a dedicated address input component.

## Adding a component or hook

1. **Package** — Implement under `packages/components` and/or `packages/hooks`; export from `src/index.ts`; `pnpm lint` / `pnpm build` in that package.
2. **Docs** — New MDX in `docs/pages/components/` or `docs/pages/hooks/` (`layout: docs`); add the route to the sidebar in `docs/vocs.config.ts`. Optional live demo: React component in `docs/components/`, imported from the MDX (pattern: `HederaAddressInput.mdx`).
3. **Example app** — `example/app/components/examples/<Name>Example.tsx`, barrel-export in `examples/index.ts`, mount in `HomeContent.tsx`; verify with `pnpm dev` on port 3000.

For debugger-only UI, extend `packages/debug-contracts` and `docs/pages/debug-contracts/` when relevant.

## Deeper docs

- [packages/components/README.md](packages/components/README.md)
- [packages/hooks/README.md](packages/hooks/README.md)
- [packages/debug-contracts/README.md](packages/debug-contracts/README.md)
- MDX under [docs/pages/components/](docs/pages/components/) and [docs/pages/hooks/](docs/pages/hooks/)

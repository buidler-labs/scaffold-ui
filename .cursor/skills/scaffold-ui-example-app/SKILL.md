---
name: scaffold-ui-example-app
description: >-
  Describes the Next.js example app under example/—ScaffoldHbarAppWithProviders,
  wagmiConfig chains (hedera, hederaTestnet), layout CSS imports, and where
  component demos live. Use when running or extending the local demo, adding
  example cards, or when the user mentions localhost:3000, example app, or
  ScaffoldHbarProvider.
---

# Example app (scaffold-ui)

## Run

From repo root: `pnpm dev` — starts hooks/components watch and the example app. Open [http://localhost:3000](http://localhost:3000).

## Provider stack

- [example/app/ScaffoldHbarProvider.tsx](example/app/ScaffoldHbarProvider.tsx) exports **`ScaffoldHbarAppWithProviders`**: `WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider` (`initialChain={hederaTestnet}`) → shell with `Header` / `SwitchTheme`.
- [example/app/layout.tsx](example/app/layout.tsx): wraps children with `ThemeProvider` and `ScaffoldHbarAppWithProviders`; imports `@scaffold-ui/components/styles.css`, `@scaffold-ui/debug-contracts/styles.css`, RainbowKit, and `globals.css`.

## Wagmi / viem config

- [example/app/wagmiConfig.ts](example/app/wagmiConfig.ts): `CHAINS = [hedera, hederaTestnet]` from `viem/chains`, `http()` transport, RainbowKit + burner connectors. Use the same chain imports in examples (`hederaTestnet.id`, etc.).

## Where demos live

- Home: [example/app/page.tsx](example/app/page.tsx) → [example/app/components/HomeContent.tsx](example/app/components/HomeContent.tsx).
- One file per demo under [example/app/components/examples/](example/app/components/examples/); re-exported from [example/app/components/examples/index.ts](example/app/components/examples/index.ts).

## Adding a new demo

1. Create `example/app/components/examples/YourExample.tsx` using `ExampleCard` like existing files.
2. Export from `examples/index.ts` and render from `HomeContent.tsx`.

For a **new exported component or hook** (not just a new card), also implement in `packages/*`, document in `docs/` (MDX + `vocs.config.ts` sidebar). See root `README.md` section *Adding a new component or hook* or skill `scaffold-ui-components`.

---
name: scaffold-ui-example-app
description: >-
  Use this subagent for the Next.js example app—ScaffoldHbarAppWithProviders,
  wagmiConfig, layout CSS, and adding demo cards under example/app.
---

You specialize in the scaffold-ui **example** Next.js app under `example/`.

**Run:** From repo root, `pnpm dev` → http://localhost:3000

**Stack:** `ScaffoldHbarAppWithProviders` in `example/app/ScaffoldHbarProvider.tsx` (Wagmi → React Query → RainbowKit, `initialChain={hederaTestnet}`). Root `layout.tsx` imports `@scaffold-ui/components/styles.css`, `@scaffold-ui/debug-contracts/styles.css`, RainbowKit, wraps with ThemeProvider + providers.

**Wagmi:** `example/app/wagmiConfig.ts` — `CHAINS = [hedera, hederaTestnet]` from `viem/chains`, `http()` transports.

**Demos:** `example/app/page.tsx` → `HomeContent.tsx`; each demo in `example/app/components/examples/*.tsx`, barrel `examples/index.ts`.

**Adding a demo:** New file under `examples/`, export from `index.ts`, add to `HomeContent.tsx` using `ExampleCard` like existing examples.

Full detail: `.claude/skills/scaffold-ui-example-app/SKILL.md`.

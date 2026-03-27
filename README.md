# Scaffold UI

Shared React components and hooks for **Hedera** and EVM-compatible dApps. This repo is intended for use with **scaffold-hbar** (Scaffold Hbar). See package READMEs for API details:

- **[packages/components](packages/components/README.md)** – Address, Balance, HederaAddress, HederaAddressInput, HbarInput
- **[packages/hooks](packages/hooks/README.md)** – useAddress, useHederaAccountId, useMirrorNodeAccount
- **[packages/debug-contracts](packages/debug-contracts/README.md)** – Contract debug UI, **IntegerInput** (×1e8 / ×1e18 multiplier), BytesInput, Bytes32Input

The **example app** ([example](example/)) demonstrates all of the above; run `pnpm dev` and open [http://localhost:3000](http://localhost:3000).

**AI assistants:** Project guidance is duplicated for different tools—[`.cursor/skills/`](.cursor/skills/) (Cursor), [`.claude/skills/`](.claude/skills/) and [`.claude/agents/`](.claude/agents/) (Claude Code), and [`.agents/`](.agents/) (same agent prompts for other runners). See [`.claude/README.md`](.claude/README.md).

## Adding a new component or hook

Typical flow (do all that apply):

1. **Implement** in [packages/components](packages/components/) and/or [packages/hooks](packages/hooks/) — add the source file, export it from `src/index.ts`, run `pnpm lint` / `pnpm build` in that package.
2. **Document** in [docs](docs/) — add a page under `docs/pages/components/` or `docs/pages/hooks/` (MDX with `layout: docs`). Register the page in the **sidebar** in [docs/vocs.config.ts](docs/vocs.config.ts). If the doc needs an interactive demo, add a small component under [docs/components/](docs/components/) and import it from the MDX (see existing examples such as [docs/pages/components/HederaAddressInput.mdx](docs/pages/components/HederaAddressInput.mdx)).
3. **Example app** — add `example/app/components/examples/YourFeatureExample.tsx`, export it from [example/app/components/examples/index.ts](example/app/components/examples/index.ts), and render it from [example/app/components/HomeContent.tsx](example/app/components/HomeContent.tsx). Run `pnpm dev` and verify at [http://localhost:3000](http://localhost:3000).

If the feature belongs in the contract debugger, also wire exports and docs under [packages/debug-contracts](packages/debug-contracts/) and `docs/pages/debug-contracts/` as needed.

## Testing packages with local example

1. Start the dev mode of the monorepo

```bash
pnpm dev
```

This will start the dev mode of both the hooks and components packages, along with the example app.

2. Visit the example app at [http://localhost:3000](http://localhost:3000)

3. Make changes to the packages and see them reflected in the example app

## Testing packages with Scaffold Hbar locally

### Quick Setup

1. Start the dev mode for both packages in the scaffold-ui directory:

```bash
# For hooks
cd packages/hooks && pnpm run dev &

# For components
cd packages/components && pnpm run dev &
```

2. Add both packages in **scaffold-hbar** inside the `packages/nextjs/package.json` file:

```json
"@scaffold-ui/hooks": "file:../../../scaffold-ui/packages/hooks",
"@scaffold-ui/components": "file:../../../scaffold-ui/packages/components"
```

**Note:** The relative paths use `../../../` because they are resolved from the `packages/nextjs` directory in scaffold-hbar’s workspace structure.

3. Update the `webpack` section in the `next.config.js` or `next.config.ts` file:

```js
webpack: (config, { dev }) => {
  config.resolve.fallback = { fs: false, net: false, tls: false };
  config.externals.push("pino-pretty", "lokijs", "encoding");
  if (dev) {
    config.watchOptions = {
      followSymlinks: true,
    };

    config.snapshot.managedPaths = [];
  }
  return config;
},
```

4. Add the css file in `packages/nextjs/app/layout.tsx` file for the components package:

```tsx
import "@scaffold-ui/components/styles.css";
```

5. Install dependencies in scaffold-hbar:

```bash
yarn install
```

6. Run the scaffold-hbar app:

```bash
yarn chain    # In one terminal
yarn start    # In another terminal
```

7. Any changes in this repo will require running `yarn install` in scaffold-hbar again.

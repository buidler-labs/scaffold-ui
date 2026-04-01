# @scaffold-ui/hooks

A collection of React hooks for managing UI state.

## Installation

```bash
npm install @scaffold-ui/hooks
# or
yarn add @scaffold-ui/hooks
```

## Hooks

### useAddress

Formats EVM addresses (checksum, short form), block explorer URL (HashScan on Hedera), and blockie URL.

```tsx
import { useAddress } from "@scaffold-ui/hooks";
import { hederaTestnet } from "viem/chains";
import { useAccount } from "wagmi";

function AddressInfo() {
  const { address } = useAccount();

  const { checkSumAddress, blockExplorerAddressLink, isValidAddress, shortAddress, blockieUrl } = useAddress({
    address,
    chain: hederaTestnet,
  });

  return (
    <div>
      {blockieUrl ? (
        <img
          src={blockieUrl}
          alt=""
          width={32}
          height={32}
        />
      ) : null}
      <div>Address: {checkSumAddress}</div>
      <div>Short: {shortAddress}</div>
      <a
        href={blockExplorerAddressLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        View on explorer
      </a>
      {isValidAddress ? <div>Valid</div> : null}
    </div>
  );
}
```

## Hedera

**Balance and native price:** When you use `useBalance` or the `Balance` component with a Hedera chain (e.g. `hederaTestnet`), the USD price is sourced from HBAR (CoinGecko). No configuration is required.

### useHederaAccountId

Resolves a Hedera account ID (e.g. `0.0.8041897`) for an EVM address. Used by components like `HederaAddress`.

```tsx
import { useHederaAccountId } from "@scaffold-ui/hooks";

const { accountId, status, isLoading } = useHederaAccountId(evmAddress, chainId);
```

### useHederaEvmAddress

Resolves an EVM address (`0x…`) for a Hedera native account ID. Used by components like `HederaAddress`.

```tsx
import { useHederaEvmAddress } from "@scaffold-ui/hooks";

const { evmAddress, status, isLoading } = useHederaEvmAddress(accountId, chainId);
```

### Configuring account-ID resolution

The library does not call mirror-node directly. Your app owns the data source. Configure once at startup (e.g. in root layout or a provider):

- **Same-origin API (default):** If your app serves `GET /api/hedera?evm=...` (and related query shapes below), you don’t need to do anything—the default base is `""`. To be explicit: `setHederaAccountIdApiBase('')`.
- **Custom base URL:** `setHederaAccountIdApiBase('https://your-api.com')` so the default fetch uses that origin.
- **Custom resolver:** `setHederaAccountIdResolver((evmAddress, network) => Promise<string | null>)` to call your own API or server-side logic. Takes precedence over the endpoint.

```tsx
import { setHederaAccountIdApiBase, setHederaAccountIdResolver } from "@scaffold-ui/hooks";

// Option A: use same-origin /api/hedera (default)
setHederaAccountIdApiBase("");

// Option B: custom resolver (e.g. your API client)
setHederaAccountIdResolver(async (evmAddress, network) => {
  const res = await fetch(`/api/hedera?evm=${evmAddress}&network=${network}`);
  const data = await res.json();
  return data.accountId ?? null;
});
```

### useHederaAddressInput

Validates and resolves Hedera address input as native **`0.0.n`** or EVM **`0x…`**. Exposes a checksummed `evmAddress` when valid, plus errors, warnings, and loading flags. The `HederaAddressInput` component is built on this hook.

```tsx
import { useHederaAddressInput } from "@scaffold-ui/hooks";

const { evmAddress, error, warning, isResolving, accountIdFromEvm } = useHederaAddressInput({
  value: inputValue,
  chainId: 296,
  debounceDelay: 400,
});
```

Bidirectional resolution uses the same configurable layer as other Hedera helpers:

- **EVM → account ID:** `setHederaAccountIdResolver` / `setHederaAccountIdApiBase` (see above). Default same-origin `GET /api/hedera?evm=...&network=...`.
- **Account ID → EVM:** `setHederaEvmAddressResolver` or `setHederaEvmAddressApiBase`. Default same-origin `GET /api/hedera?accountId=...&network=...` returning `{ evmAddress }`.

```tsx
import { setHederaEvmAddressApiBase, setHederaEvmAddressResolver } from "@scaffold-ui/hooks";

setHederaEvmAddressResolver(async (accountId, network) => {
  const res = await fetch(`/api/hedera?accountId=${encodeURIComponent(accountId)}&network=${network}`);
  const data = await res.json();
  return data.evmAddress ?? null;
});
```

## License

MIT

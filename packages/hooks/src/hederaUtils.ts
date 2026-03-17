export type HederaNetwork = "testnet" | "mainnet" | "local";

/**
 * Resolver that returns the Hedera account ID for an EVM address.
 * The host app can inject this to use its own mirror-node or API.
 */
export type HederaAccountIdResolver = (
  evmAddress: string,
  network: HederaNetwork,
) => Promise<string | null>;

type AccountIdResponse = { accountId: string | null } | { error: string };

const CHAIN_ID_TO_NETWORK: Record<number, HederaNetwork> = {
  295: "mainnet",
  296: "testnet",
  31337: "local",
};

/** Set of Hedera chain IDs (mainnet and testnet). Use for native price and explorer link logic. */
export const HEDERA_CHAIN_IDS: ReadonlySet<number> = new Set(
  Object.keys(CHAIN_ID_TO_NETWORK).map(Number),
);

let customResolver: HederaAccountIdResolver | undefined;
let apiBase = "";

/**
 * Inject a custom resolver for Hedera account ID lookup (e.g. calling your app's API or mirror-node).
 * When set, this is used instead of the configurable endpoint.
 */
export function setHederaAccountIdResolver(resolver: HederaAccountIdResolver | undefined): void {
  customResolver = resolver;
}

/**
 * Get the currently set custom resolver, if any.
 */
export function getHederaAccountIdResolver(): HederaAccountIdResolver | undefined {
  return customResolver;
}

/**
 * Set the base URL for the default account-ID API (e.g. "" for same-origin, or "https://your-app.com").
 * The default fetch implementation will call `${apiBase}/api/hedera/account?evm=...&network=...`.
 * Ignored if a custom resolver is set via setHederaAccountIdResolver.
 */
export function setHederaAccountIdApiBase(base: string): void {
  apiBase = base;
}

/**
 * Get the current API base URL used by the default fetch implementation.
 */
export function getHederaAccountIdApiBase(): string {
  return apiBase;
}

/** Maps a viem/wagmi chain ID to "testnet" | "mainnet". Defaults to "testnet". */
export function chainIdToHederaNetwork(chainId: number): HederaNetwork {
  return CHAIN_ID_TO_NETWORK[chainId] ?? "testnet";
}

/**
 * Returns the Hedera account ID (e.g. "0.0.8041897") for an EVM address.
 * Uses the injected resolver if set, otherwise calls the configurable endpoint
 * (default same-origin /api/hedera/account). Mirror-node access stays in the host app.
 *
 * @param evmAddress - EVM address (0x...)
 * @param network - "testnet" (default) or "mainnet"
 * @returns Hedera account ID or null if not found
 */
export async function getHederaAccountId(
  evmAddress: string,
  network: HederaNetwork = "testnet",
): Promise<string | null> {
  if (customResolver) {
    return customResolver(evmAddress, network);
  }

  const path = "/api/hedera/account";
  const base = apiBase.replace(/\/$/, "");
  const url = base ? `${base}${path}` : path;
  const params = new URLSearchParams({ evm: evmAddress, network });
  const res = await fetch(`${url}?${params}`);

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as AccountIdResponse;
    if ("error" in body) throw new Error(body.error);
    return null;
  }

  const data = (await res.json()) as AccountIdResponse;
  if ("error" in data) throw new Error(data.error);
  return data.accountId;
}

// --- Reverse resolution: Hedera account ID → EVM address ---

/**
 * Resolver that returns the EVM address for a Hedera account ID.
 * The host app can inject this to use its own mirror-node or API.
 */
export type HederaEvmAddressResolver = (
  accountId: string,
  network: HederaNetwork,
) => Promise<string | null>;

type EvmAddressResponse = { evmAddress: string | null } | { error: string };

let evmAddressResolver: HederaEvmAddressResolver | undefined;
let evmAddressApiBase = "";

/**
 * Inject a custom resolver for Hedera account ID → EVM address (e.g. calling your app's API or mirror-node).
 * When set, this is used instead of the configurable endpoint.
 */
export function setHederaEvmAddressResolver(resolver: HederaEvmAddressResolver | undefined): void {
  evmAddressResolver = resolver;
}

export function getHederaEvmAddressResolver(): HederaEvmAddressResolver | undefined {
  return evmAddressResolver;
}

/**
 * Set the base URL for the default evm-address API (e.g. "" for same-origin).
 * Default fetch calls `${apiBase}/api/hedera/evm-address?accountId=...&network=...`.
 * Ignored if a custom resolver is set.
 */
export function setHederaEvmAddressApiBase(base: string): void {
  evmAddressApiBase = base;
}

export function getHederaEvmAddressApiBase(): string {
  return evmAddressApiBase;
}

/**
 * Returns the EVM address (0x...) for a Hedera account ID, or null if the account has no EVM alias.
 * Uses the injected resolver if set, otherwise calls the configurable endpoint (default same-origin /api/hedera/evm-address).
 *
 * @param accountId - Hedera account ID (e.g. "0.0.12345")
 * @param network - "testnet" (default) or "mainnet"
 * @returns EVM address or null (e.g. ED25519-only account)
 */
export async function getEvmAddressFromHederaAccountId(
  accountId: string,
  network: HederaNetwork = "testnet",
): Promise<string | null> {
  if (evmAddressResolver) {
    return evmAddressResolver(accountId, network);
  }

  const path = "/api/hedera/evm-address";
  const base = evmAddressApiBase.replace(/\/$/, "");
  const url = base ? `${base}${path}` : path;
  const params = new URLSearchParams({ accountId, network });
  const res = await fetch(`${url}?${params}`);

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as EvmAddressResponse;
    if ("error" in body) throw new Error(body.error);
    return null;
  }

  const data = (await res.json()) as EvmAddressResponse;
  if ("error" in data) throw new Error(data.error);
  return data.evmAddress;
}

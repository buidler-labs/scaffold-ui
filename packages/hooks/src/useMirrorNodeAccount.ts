import { useQuery } from "@tanstack/react-query";
import type { HederaNetwork } from "./hederaUtils";
import { chainIdToHederaNetwork } from "./hederaUtils";

/** Key type reported by the mirror node (account's public key). */
export type HederaKeyType = "ED25519" | "ECDSA_SECP256K1";

/**
 * Full account data from a single mirror-node (or app API) call.
 * Use this as the single source of truth for identity, key type, and balance.
 */
export type HederaAccount = {
  /** Hedera account ID (e.g. "0.0.12345"). Always present. */
  accountId: string;
  /** EVM address (0x...) if the account has an alias; null for ED25519-only. */
  evmAddress: string | null;
  /** Account's public key type. */
  keyType: HederaKeyType;
  /** Balance in tinybars (8 decimals). */
  balance: bigint;
  /** True when the account has an EVM alias (evmAddress !== null). */
  canSignEVM: boolean;
};

/**
 * Fetcher that returns full Hedera account data for a given input (EVM address or account ID).
 * The host app can inject this to use its own mirror-node client or API.
 */
export type MirrorNodeAccountFetcher = (
  input: string,
  network: HederaNetwork,
) => Promise<HederaAccount | null>;

let mirrorAccountFetcher: MirrorNodeAccountFetcher | undefined;
let mirrorAccountApiBase = "";

/**
 * Inject a custom fetcher for full mirror-node account data.
 * When set, it is used instead of the configurable default endpoint.
 */
export function setMirrorNodeAccountFetcher(fetcher: MirrorNodeAccountFetcher | undefined): void {
  mirrorAccountFetcher = fetcher;
}

export function getMirrorNodeAccountFetcher(): MirrorNodeAccountFetcher | undefined {
  return mirrorAccountFetcher;
}

/**
 * Set the base URL for the default mirror-account API (e.g. "" for same-origin).
 * Default fetch calls `${base}/api/hedera/mirror-account?input=...&network=...`.
 * Ignored if a custom fetcher is set via setMirrorNodeAccountFetcher.
 */
export function setMirrorNodeAccountApiBase(base: string): void {
  mirrorAccountApiBase = base;
}

export function getMirrorNodeAccountApiBase(): string {
  return mirrorAccountApiBase;
}

const STALE_TIME_MS = 30_000;
const GC_TIME_MS = 5 * 60_000;

function defaultFetchAccount(input: string, network: HederaNetwork): Promise<HederaAccount | null> {
  if (mirrorAccountFetcher) {
    return mirrorAccountFetcher(input, network);
  }

  const base = mirrorAccountApiBase.replace(/\/$/, "");
  const path = "/api/hedera/mirror-account";
  const url = base ? `${base}${path}` : path;
  const params = new URLSearchParams({ input: input.trim(), network });

  return fetch(`${url}?${params}`)
    .then(async res => {
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        if (body.error) throw new Error(body.error);
        return null;
      }
      const data = (await res.json()) as {
        accountId?: string;
        evmAddress?: string | null;
        keyType?: string;
        balance?: string | number;
      };
      if (!data.accountId) return null;

      const balance =
        typeof data.balance === "string"
          ? BigInt(data.balance)
          : typeof data.balance === "number"
            ? BigInt(data.balance)
            : 0n;

      const keyType: HederaKeyType =
        data.keyType === "ECDSA_SECP256K1" || data.keyType === "ED25519"
          ? data.keyType
          : "ED25519";

      const evmAddress =
        typeof data.evmAddress === "string" && data.evmAddress.length > 0 ? data.evmAddress : null;

      return {
        accountId: data.accountId,
        evmAddress,
        keyType,
        balance,
        canSignEVM: evmAddress !== null,
      };
    })
    .catch(() => null);
}

export type UseMirrorNodeAccountOptions = {
  /** Override network (default from chainId or "testnet"). */
  network?: HederaNetwork;
  /** Chain ID to derive network from (296 = testnet, 295 = mainnet). */
  chainId?: number;
  /** Custom fetcher; overrides default API call. */
  fetcher?: MirrorNodeAccountFetcher;
};

/**
 * Single source of truth for Hedera account data from the mirror node.
 * Accepts either an EVM address (0x...) or a native account ID (0.0.XXXXX).
 * Cached with React Query so multiple components sharing the same input reuse one request.
 *
 * @param input - EVM address or Hedera account ID, or undefined to skip the request
 * @param options - Optional network, chainId, or custom fetcher
 * @returns { data, isLoading, isError, refetch } — data is HederaAccount | null when resolved
 */
export function useMirrorNodeAccount(
  input: string | undefined,
  options: UseMirrorNodeAccountOptions = {},
): {
  data: HederaAccount | null;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const { network, chainId, fetcher } = options;
  const normalizedInput = typeof input === "string" ? input.trim() : "";
  const effectiveNetwork = network ?? chainIdToHederaNetwork(chainId ?? 296);
  const queryFn = fetcher ?? defaultFetchAccount;

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["mirrorNode", "account", normalizedInput, effectiveNetwork],
    queryFn: () => queryFn(normalizedInput, effectiveNetwork),
    enabled: normalizedInput.length > 0,
    staleTime: STALE_TIME_MS,
    gcTime: GC_TIME_MS,
  });

  return {
    data: data ?? null,
    isLoading,
    isError,
    refetch,
  };
}

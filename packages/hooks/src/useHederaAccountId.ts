import { useQuery } from "@tanstack/react-query";
import { chainIdToHederaNetwork, getHederaAccountId } from "./hederaUtils";

/**
 * Outcome of resolving an EVM address to a Hedera account ID via the host mirror/API.
 *
 * - `idle` — no address to resolve (input cleared).
 * - `pending` — first fetch in flight for this query (no cached data yet).
 * - `success` — mirror returned an account ID (`accountId` is set).
 * - `not-found` — mirror responded: no Hedera account for this EVM on this network.
 * - `error` — request failed (network, 5xx, thrown resolver, etc.).
 */
export type HederaAccountIdStatus = "idle" | "pending" | "success" | "not-found" | "error";

/**
 * Resolves a Hedera account ID (`0.0.n`) for a checksummed EVM address using `getHederaAccountId`
 * (same-origin `/api/hedera` or injected resolver). Uses TanStack Query for caching, deduplication,
 * and abort when the address/chain changes (same pattern as `useFetchNativeCurrencyPrice`).
 */
export function useHederaAccountId(evmAddress: string | undefined, chainId?: number) {
  const chainKey = chainId ?? 296;
  const network = chainIdToHederaNetwork(chainKey);
  const enabled = Boolean(evmAddress);

  const query = useQuery({
    queryKey: ["hedera-account-id", evmAddress, chainKey, network] as const,
    queryFn: async ({ signal }) => getHederaAccountId(evmAddress!, network, { signal }),
    enabled,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: 1,
  });

  if (!evmAddress) {
    return {
      accountId: null as string | null,
      status: "idle" as const,
      isLoading: false,
    };
  }

  const accountId = query.data === undefined ? null : query.data;

  let status: HederaAccountIdStatus;
  if (query.isPending) {
    status = "pending";
  } else if (query.isError) {
    status = "error";
  } else if (query.isSuccess) {
    status = query.data === null ? "not-found" : "success";
  } else {
    status = "idle";
  }

  return {
    accountId,
    status,
    isLoading: query.isPending,
  };
}

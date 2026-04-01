import { useQuery } from "@tanstack/react-query";
import { type Address, getAddress } from "viem";
import { chainIdToHederaNetwork, getEvmAddressFromHederaAccountId } from "./hederaUtils";

const NATIVE_ACCOUNT_ID_RE = /^\d+\.\d+\.\d+$/;

/**
 * Outcome of resolving a Hedera account ID to an EVM address via the host mirror/API.
 *
 * - `idle` — no account ID to resolve (input cleared or invalid format).
 * - `pending` — first fetch in flight for this query (no cached data yet).
 * - `success` — mirror returned an EVM address (`evmAddress` is set).
 * - `not-found` — mirror responded: no EVM alias for this account (e.g. ED25519-only).
 * - `error` — request failed (network, 5xx, thrown resolver, etc.).
 */
export type HederaEvmAddressStatus = "idle" | "pending" | "success" | "not-found" | "error";

/**
 * Resolves an EVM address (`0x…`) for a Hedera native account ID (`0.0.n`) using
 * `getEvmAddressFromHederaAccountId` (same-origin `/api/hedera` or injected resolver).
 * Uses TanStack Query for caching, deduplication, and abort on param changes.
 */
export function useHederaEvmAddress(accountId: string | undefined, chainId?: number) {
  const chainKey = chainId ?? 296;
  const network = chainIdToHederaNetwork(chainKey);
  const validFormat = Boolean(accountId) && NATIVE_ACCOUNT_ID_RE.test(accountId!);

  const query = useQuery({
    queryKey: ["hedera-evm-address", accountId, chainKey, network] as const,
    queryFn: async ({ signal }) => getEvmAddressFromHederaAccountId(accountId!, network, { signal }),
    enabled: validFormat,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: 1,
  });

  if (!validFormat) {
    return {
      evmAddress: undefined as Address | undefined,
      status: "idle" as const,
      isLoading: false,
    };
  }

  const evmAddress: Address | undefined = query.data != null ? (getAddress(query.data) as Address) : undefined;

  let status: HederaEvmAddressStatus;
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
    evmAddress,
    status,
    isLoading: query.isPending,
  };
}

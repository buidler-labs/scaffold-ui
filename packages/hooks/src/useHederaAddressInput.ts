import { useMemo } from "react";
import { type Address, getAddress, isAddress } from "viem";
import { useQuery } from "@tanstack/react-query";
import { useDebounceValue } from "usehooks-ts";
import { getEvmAddressFromHederaAccountId, getHederaAccountId, chainIdToHederaNetwork } from "./hederaUtils";

const NATIVE_ACCOUNT_ID_REGEX = /^\d+\.\d+\.\d+$/;
const EVM_PREFIX = "0x";

function isHex(s: string): boolean {
  return /^0x[0-9a-fA-F]+$/.test(s);
}

export type UseHederaAddressInputOptions = {
  value: string;
  chainId?: number;
  debounceDelay?: number;
};

export type UseHederaAddressInputResult = {
  evmAddress: Address | undefined;
  displayAccountId: string | undefined;
  shortEvmAddress: string | undefined;
  isLoading: boolean;
  error: string | undefined;
  warning: string | undefined;
  isNativeFormat: boolean;
  isEvmFormat: boolean;
  accountIdFromEvm: string | undefined;
  isLoadingAccountIdFromEvm: boolean;
  /** True while any mirror lookup is in progress. */
  isResolving: boolean;
};

/**
 * Validates and resolves Hedera address input (native `0.0.n` or EVM `0x…`).
 * Exposes `evmAddress` (checksummed) when valid; consumers can mirror raw text separately (e.g. `HederaAddressInput`).
 */
export function useHederaAddressInput({
  value,
  chainId = 296,
  debounceDelay = 400,
}: UseHederaAddressInputOptions): UseHederaAddressInputResult {
  const [debouncedValue] = useDebounceValue(value.trim(), debounceDelay);

  const chainKey = chainId;
  const network = chainIdToHederaNetwork(chainKey);
  const isNativeFormat = NATIVE_ACCOUNT_ID_REGEX.test(debouncedValue);
  const hasEvmPrefix = debouncedValue.startsWith(EVM_PREFIX);

  const validationErrors = useMemo(() => {
    const evmValidationError = (() => {
      if (!hasEvmPrefix) return undefined;
      if (debouncedValue.length > 0 && debouncedValue.length !== 42) {
        return "Invalid EVM address length (expect 42 characters including 0x).";
      }
      if (debouncedValue.length === 42 && !isHex(debouncedValue)) {
        return "Invalid EVM address (use hexadecimal only after 0x).";
      }
      return undefined;
    })();

    const bareHexError = (() => {
      if (!debouncedValue || hasEvmPrefix) return undefined;
      if (/^[a-fA-F0-9]{40}$/.test(debouncedValue)) {
        return "EVM addresses must start with 0x.";
      }
      return undefined;
    })();

    const hederaFormatError = (() => {
      if (!debouncedValue || hasEvmPrefix || bareHexError) return undefined;
      const looksNative = /^\d+\.\d+\.?\d*$/.test(debouncedValue);
      if (!looksNative || isNativeFormat) return undefined;
      return "Invalid Hedera account ID (expected 0.0.n with numeric segments).";
    })();

    const unrecognizedFormatError = (() => {
      if (!debouncedValue || hasEvmPrefix) return undefined;
      if (isNativeFormat || bareHexError || hederaFormatError) return undefined;
      if (/^\d+\.\d+\.?\d*$/.test(debouncedValue)) return undefined;

      if (/^\d+$/.test(debouncedValue) && debouncedValue.length >= 2) {
        return "Use Hedera account ID format 0.0.n or a 0x EVM address.";
      }
      if (/[a-zA-Z]/.test(debouncedValue)) {
        return "Enter a Hedera account ID (0.0.n) or a 0x EVM address.";
      }
      return undefined;
    })();

    return { evmValidationError, bareHexError, hederaFormatError, unrecognizedFormatError };
  }, [debouncedValue, hasEvmPrefix, isNativeFormat]);

  const isEvmFormat = hasEvmPrefix && debouncedValue.length === 42 && isHex(debouncedValue);
  // Hedera "long zero" aliases (e.g. 0.0.28 → 0x…001c) often use casing that fails EIP-55 strict checks.
  const validEvmAddress: Address | undefined =
    isEvmFormat && isAddress(debouncedValue, { strict: false }) ? getAddress(debouncedValue) : undefined;

  const hasSyncError = Boolean(
    validationErrors.evmValidationError ??
      validationErrors.bareHexError ??
      validationErrors.hederaFormatError ??
      validationErrors.unrecognizedFormatError,
  );

  // --- Async resolution via react-query ---

  const nativeToEvmQuery = useQuery({
    queryKey: ["hedera-evm-address", debouncedValue, chainKey, network] as const,
    queryFn: ({ signal }) => getEvmAddressFromHederaAccountId(debouncedValue, network, { signal }),
    enabled: isNativeFormat && !!debouncedValue && !hasSyncError,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: 1,
  });

  const evmToAccountQuery = useQuery({
    queryKey: ["hedera-account-id", validEvmAddress, chainKey, network] as const,
    queryFn: ({ signal }) => getHederaAccountId(validEvmAddress!, network, { signal }),
    enabled: !!validEvmAddress && isEvmFormat && !hasSyncError,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: 1,
  });

  // --- Derive state from queries ---

  const resolvedEvm: Address | undefined =
    nativeToEvmQuery.data != null ? (getAddress(nativeToEvmQuery.data) as Address) : undefined;

  const evmAddress = validEvmAddress ?? resolvedEvm;
  const shortEvmAddress = evmAddress ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` : undefined;
  const displayAccountId = isNativeFormat && debouncedValue ? debouncedValue : undefined;

  const accountIdFromEvm = evmToAccountQuery.data ?? undefined;
  const isLoadingAccountIdFromEvm = evmToAccountQuery.isPending && evmToAccountQuery.fetchStatus !== "idle";
  const isLoadingNativeResolve = nativeToEvmQuery.isPending && nativeToEvmQuery.fetchStatus !== "idle";

  const nativeMirrorError = nativeToEvmQuery.isError
    ? nativeToEvmQuery.error instanceof Error
      ? nativeToEvmQuery.error.message
      : "Account not found on Hedera"
    : undefined;

  const warning = (() => {
    if (hasSyncError) return undefined;
    if (isNativeFormat && nativeToEvmQuery.isSuccess && nativeToEvmQuery.data === null) {
      return "This account has no EVM alias. It cannot be used for contract calls.";
    }
    if (isEvmFormat && evmToAccountQuery.isSuccess && evmToAccountQuery.data === null) {
      return "No Hedera account found for this EVM address on this network.";
    }
    if (isEvmFormat && evmToAccountQuery.isError) {
      return "Could not verify this address on Hedera (mirror error).";
    }
    return undefined;
  })();

  const finalError =
    validationErrors.evmValidationError ??
    validationErrors.bareHexError ??
    validationErrors.hederaFormatError ??
    validationErrors.unrecognizedFormatError ??
    nativeMirrorError;

  const isResolving = isLoadingNativeResolve || isLoadingAccountIdFromEvm;

  return {
    evmAddress,
    displayAccountId,
    shortEvmAddress,
    isLoading: isLoadingNativeResolve,
    error: finalError,
    warning,
    isNativeFormat,
    isEvmFormat,
    accountIdFromEvm,
    isLoadingAccountIdFromEvm,
    isResolving,
  };
}

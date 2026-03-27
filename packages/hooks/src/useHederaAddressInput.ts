import { useEffect, useState } from "react";
import { type Address, getAddress, isAddress } from "viem";
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
  /** Native 0.0.n → EVM (mirror). */
  const [resolvedEvm, setResolvedEvm] = useState<Address | undefined>(undefined);
  const [isLoadingNativeResolve, setIsLoadingNativeResolve] = useState(false);
  const [nativeMirrorError, setNativeMirrorError] = useState<string | undefined>(undefined);
  /** EVM → Hedera account ID (mirror). */
  const [accountIdFromEvm, setAccountIdFromEvm] = useState<string | undefined>(undefined);
  const [isLoadingAccountIdFromEvm, setIsLoadingAccountIdFromEvm] = useState(false);
  /** Warnings from either resolution path (non-blocking). */
  const [warning, setWarning] = useState<string | undefined>(undefined);

  const network = chainIdToHederaNetwork(chainId);
  const isNativeFormat = NATIVE_ACCOUNT_ID_REGEX.test(debouncedValue);
  const hasEvmPrefix = debouncedValue.startsWith(EVM_PREFIX);

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

  /** Values like "123" or random text — not 0x, not 0.0.n-shaped, so mirror never runs and UI was silent. */
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

  const isEvmFormat = hasEvmPrefix && debouncedValue.length === 42 && isHex(debouncedValue);
  // Hedera “long zero” aliases (e.g. 0.0.28 → 0x…001c) often use casing that fails EIP-55 strict checks.
  const validEvmAddress: Address | undefined =
    isEvmFormat && isAddress(debouncedValue, { strict: false }) ? getAddress(debouncedValue) : undefined;

  useEffect(() => {
    if (!isNativeFormat || !debouncedValue) {
      setResolvedEvm(undefined);
      setNativeMirrorError(undefined);
      setWarning(undefined);
      setIsLoadingNativeResolve(false);
      return;
    }

    let cancelled = false;
    setNativeMirrorError(undefined);
    setWarning(undefined);
    setIsLoadingNativeResolve(true);

    getEvmAddressFromHederaAccountId(debouncedValue, network)
      .then((evm) => {
        if (cancelled) return;
        setIsLoadingNativeResolve(false);
        if (evm === null) {
          setResolvedEvm(undefined);
          setWarning("This account has no EVM alias. It cannot be used for contract calls.");
          setNativeMirrorError(undefined);
        } else {
          setResolvedEvm(getAddress(evm) as Address);
          setWarning(undefined);
          setNativeMirrorError(undefined);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setIsLoadingNativeResolve(false);
        setResolvedEvm(undefined);
        setNativeMirrorError(err instanceof Error ? err.message : "Account not found on Hedera");
        setWarning(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedValue, isNativeFormat, network]);

  useEffect(() => {
    if (!validEvmAddress || !isEvmFormat) {
      setAccountIdFromEvm(undefined);
      setIsLoadingAccountIdFromEvm(false);
      setWarning(undefined);
      return;
    }

    let cancelled = false;
    setIsLoadingAccountIdFromEvm(true);
    setWarning(undefined);

    getHederaAccountId(validEvmAddress, network)
      .then((accountId) => {
        if (cancelled) return;
        setAccountIdFromEvm(accountId ?? undefined);
        setIsLoadingAccountIdFromEvm(false);
        if (!accountId) {
          setWarning("No Hedera account found for this EVM address on this network.");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setAccountIdFromEvm(undefined);
        setIsLoadingAccountIdFromEvm(false);
        setWarning("Could not verify this address on Hedera (mirror error).");
      });

    return () => {
      cancelled = true;
    };
  }, [validEvmAddress, isEvmFormat, network]);

  const evmAddress = validEvmAddress ?? resolvedEvm;
  const shortEvmAddress = evmAddress ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` : undefined;

  /** Same as the raw debounced native id when input is valid `0.0.n` (no separate state needed). */
  const displayAccountId = isNativeFormat && debouncedValue ? debouncedValue : undefined;

  const finalError =
    evmValidationError ?? bareHexError ?? hederaFormatError ?? unrecognizedFormatError ?? nativeMirrorError;

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

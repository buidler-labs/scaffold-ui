import { useEffect, useState } from "react";
import { type Address, getAddress, isAddress } from "viem";
import { useDebounceValue } from "usehooks-ts";
import {
  getEvmAddressFromHederaAccountId,
  getHederaAccountId,
  chainIdToHederaNetwork,
} from "./hederaUtils";

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
  /** Resolved or validated EVM address to pass to onChange (only when valid). */
  evmAddress: Address | undefined;
  /** When user entered native ID and we resolved it, this is that ID (for display). */
  displayAccountId: string | undefined;
  /** Short EVM for suffix display (e.g. "0xAbCd...1234"). */
  shortEvmAddress: string | undefined;
  isLoading: boolean;
  /** Blocking error (invalid format, account not found). */
  error: string | undefined;
  /** Non-blocking: account has no EVM address (ED25519-only). */
  warning: string | undefined;
  /** Input is in native format (0.0.12345). */
  isNativeFormat: boolean;
  /** Input is valid EVM format. */
  isEvmFormat: boolean;
  /** When user entered EVM address, the resolved Hedera account ID (if any). */
  accountIdFromEvm: string | undefined;
  /** True while resolving EVM → Hedera account ID. */
  isLoadingAccountIdFromEvm: boolean;
};

/**
 * useHederaAddressInput Hook
 *
 * Validates and resolves Hedera address input in two formats:
 * - EVM: 0x + 40 hex chars → validated and passed through.
 * - Native: \d+.\d+.\d+ (e.g. 0.0.12345) → resolved to EVM via mirror/API, then passed to parent.
 *
 * Upstream always receives a checksummed EVM address when valid.
 */
export function useHederaAddressInput({
  value,
  chainId = 296,
  debounceDelay = 400,
}: UseHederaAddressInputOptions): UseHederaAddressInputResult {
  const [debouncedValue] = useDebounceValue(value.trim(), debounceDelay);
  const [resolvedEvm, setResolvedEvm] = useState<Address | undefined>(undefined);
  const [displayAccountId, setDisplayAccountId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [warning, setWarning] = useState<string | undefined>(undefined);
  const [accountIdFromEvm, setAccountIdFromEvm] = useState<string | undefined>(undefined);
  const [isLoadingAccountIdFromEvm, setIsLoadingAccountIdFromEvm] = useState(false);

  const network = chainIdToHederaNetwork(chainId);
  const isNativeFormat = NATIVE_ACCOUNT_ID_REGEX.test(debouncedValue);
  const hasEvmPrefix = debouncedValue.startsWith(EVM_PREFIX);

  // Validate EVM format (length + hex)
  const evmValidationError = (() => {
    if (!hasEvmPrefix) return undefined;
    if (debouncedValue.length > 0 && debouncedValue.length !== 42) {
      return "Invalid EVM address length";
    }
    if (debouncedValue.length === 42 && !isHex(debouncedValue)) {
      return "Invalid EVM address format";
    }
    return undefined;
  })();

  const isEvmFormat = hasEvmPrefix && debouncedValue.length === 42 && isHex(debouncedValue);
  const validEvmAddress: Address | undefined = isEvmFormat && isAddress(debouncedValue) ? getAddress(debouncedValue) : undefined;

  // Resolve native account ID → EVM
  useEffect(() => {
    if (!isNativeFormat || !debouncedValue) {
      setResolvedEvm(undefined);
      setDisplayAccountId(undefined);
      setError(undefined);
      setWarning(undefined);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setError(undefined);
    setWarning(undefined);
    setIsLoading(true);

    getEvmAddressFromHederaAccountId(debouncedValue, network)
      .then(evm => {
        if (cancelled) return;
        setIsLoading(false);
        if (evm === null) {
          setResolvedEvm(undefined);
          setDisplayAccountId(debouncedValue);
          setWarning("This account has no EVM address. It cannot be used in contract calls.");
          setError(undefined);
        } else {
          setResolvedEvm(getAddress(evm) as Address);
          setDisplayAccountId(debouncedValue);
          setWarning(undefined);
          setError(undefined);
        }
      })
      .catch(err => {
        if (cancelled) return;
        setIsLoading(false);
        setResolvedEvm(undefined);
        setDisplayAccountId(debouncedValue);
        setError(err?.message ?? "Account not found on Hedera");
        setWarning(undefined);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedValue, isNativeFormat, network]);

  // When not native, clear resolution state
  useEffect(() => {
    if (!isNativeFormat) {
      setResolvedEvm(undefined);
      setDisplayAccountId(undefined);
      setWarning(undefined);
    }
  }, [isNativeFormat]);

  // Resolve EVM address → Hedera account ID (for display when user pastes EVM)
  useEffect(() => {
    if (!validEvmAddress || !isEvmFormat) {
      setAccountIdFromEvm(undefined);
      setIsLoadingAccountIdFromEvm(false);
      return;
    }

    let cancelled = false;
    setIsLoadingAccountIdFromEvm(true);

    getHederaAccountId(validEvmAddress, network)
      .then(accountId => {
        if (cancelled) return;
        setAccountIdFromEvm(accountId ?? undefined);
        setIsLoadingAccountIdFromEvm(false);
      })
      .catch(() => {
        if (cancelled) return;
        setAccountIdFromEvm(undefined);
        setIsLoadingAccountIdFromEvm(false);
      });

    return () => {
      cancelled = true;
    };
  }, [validEvmAddress, isEvmFormat, network]);

  const evmAddress = validEvmAddress ?? resolvedEvm;
  const shortEvmAddress =
    evmAddress ? `${evmAddress.slice(0, 6)}...${evmAddress.slice(-4)}` : undefined;

  const finalError = evmValidationError ?? error;

  return {
    evmAddress,
    displayAccountId,
    shortEvmAddress,
    isLoading,
    error: finalError,
    warning,
    isNativeFormat,
    isEvmFormat,
    accountIdFromEvm,
    isLoadingAccountIdFromEvm,
  };
}

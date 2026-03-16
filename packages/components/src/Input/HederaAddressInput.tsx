"use client";

import React, { useEffect, useState } from "react";
import type { Address } from "viem";
import { useHederaAddressInput } from "@scaffold-ui/hooks";
import { BaseInput } from "./BaseInput";
import { CommonInputProps } from "./utils";

export type HederaAddressInputProps = Omit<CommonInputProps<Address>, "value" | "onChange"> & {
  /** Current value: EVM address or native account ID string. */
  value: string;
  /** Called with checksummed EVM address when input is valid (EVM or resolved native). */
  onChange: (address: Address) => void;
  /** Chain ID for resolution (default 296 = testnet). */
  chainId?: number;
};

/**
 * HederaAddressInput Component
 *
 * Input for Hedera that accepts two formats:
 * - **EVM format:** 0x + 40 hex chars. Validated and passed through; also resolved to Hedera account ID for display (suffix "→ 0.0.12345").
 * - **Native format:** \d+.\d+.\d+ (e.g. 0.0.12345). Resolved to EVM via mirror/API; display shows "0.0.12345 → 0xAbCd...1234".
 *
 * Upstream always receives a checksummed EVM address. If a native account has no EVM address (ED25519-only), a non-blocking warning is shown.
 */
export const HederaAddressInput = ({
  value,
  onChange,
  name,
  placeholder,
  disabled,
  style,
  chainId = 296,
}: HederaAddressInputProps) => {
  const [displayValue, setDisplayValue] = useState(value);

  const {
    evmAddress,
    displayAccountId,
    shortEvmAddress,
    isLoading,
    error,
    warning,
    isNativeFormat,
    accountIdFromEvm,
    isLoadingAccountIdFromEvm,
  } = useHederaAddressInput({ value: displayValue, chainId });

  // Sync from parent when value prop changes (e.g. programmatic clear)
  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  // When we have a resolved EVM from native input, notify parent (idempotent via parent state)
  useEffect(() => {
    if (evmAddress) {
      onChange(evmAddress);
    }
  }, [evmAddress, onChange]);

  const handleChange = (newVal: string) => {
    setDisplayValue(newVal);
    // Valid EVM is reported by the hook and synced via useEffect(evmAddress) below
  };

  const showNativeResolvedSuffix = isNativeFormat && shortEvmAddress && !error;
  const showEvmResolvedSuffix =
    !isNativeFormat && (accountIdFromEvm ?? isLoadingAccountIdFromEvm) && !error;
  const reFocus = Boolean(error);

  const suffixContent = showNativeResolvedSuffix ? (
    <span className="flex items-center gap-1 px-2 text-sui-accent text-sm font-medium whitespace-nowrap">
      → {shortEvmAddress}
    </span>
  ) : showEvmResolvedSuffix ? (
    <span className="flex items-center gap-1 px-2 text-sui-accent text-sm font-medium whitespace-nowrap">
      → {isLoadingAccountIdFromEvm ? "Resolving…" : accountIdFromEvm}
    </span>
  ) : null;

  return (
    <div className="flex flex-col gap-1 w-full">
      <BaseInput<string>
        name={name}
        placeholder={placeholder ?? "0x... or 0.0.12345"}
        value={displayValue}
        onChange={handleChange}
        error={Boolean(error)}
        disabled={disabled ?? isLoading}
        reFocus={reFocus}
        style={style}
        suffix={suffixContent}
      />
      {error && (
        <p className="text-sm text-red-500/90 px-2" role="alert">
          {error}
        </p>
      )}
      {warning && !error && (
        <p className="text-sm text-amber-600/90 dark:text-amber-400/90 px-2" role="status">
          ⚠ {warning}
        </p>
      )}
    </div>
  );
};

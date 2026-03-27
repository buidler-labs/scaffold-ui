"use client";

import { useEffect, useRef } from "react";
import type { Address } from "viem";
import { useHederaAddressInput } from "@scaffold-ui/hooks";
import { AddressCopyIcon } from "../Address/AddressCopyIcon";
import { BaseInput, type BaseInputFieldTone } from "./BaseInput";
import { CommonInputProps } from "./utils";

const StatusIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle
      cx="12"
      cy="12"
      r="10"
    />
    <line
      x1="12"
      y1="8"
      x2="12"
      y2="12"
    />
    <line
      x1="12"
      y1="16"
      x2="12.01"
      y2="16"
    />
  </svg>
);

export type HederaAddressInputProps = Omit<CommonInputProps<string>, "value" | "onChange"> & {
  value: string;
  /** Raw text in the field (`0.0.n` or `0x…`); not replaced by the resolved EVM address. */
  onChange: (value: string) => void;
  /** Optional: notified when the resolved checksummed EVM address changes (e.g. for contract calls). */
  onResolvedEvmChange?: (address: Address | undefined) => void;
  chainId?: number;
};

/**
 * Hedera-native input: accepts **0.0.n** or **0x…** EVM.
 * Inline conversion strip uses muted `sui-base-content` + `sui-input-border` (no accent/success chrome).
 * Surfaces format errors, mirror “not found”, and optional warnings (no EVM alias, unmapped EVM).
 */
export const HederaAddressInput = ({
  value,
  onChange,
  onResolvedEvmChange,
  name,
  placeholder,
  disabled,
  style,
  chainId = 296,
}: HederaAddressInputProps) => {
  const onResolvedEvmRef = useRef(onResolvedEvmChange);
  onResolvedEvmRef.current = onResolvedEvmChange;
  const lastEmittedEvm = useRef<Address | undefined>(undefined);

  const {
    evmAddress,
    shortEvmAddress,
    isLoading,
    error,
    warning,
    isNativeFormat,
    accountIdFromEvm,
    isLoadingAccountIdFromEvm,
    isResolving,
  } = useHederaAddressInput({ value, chainId });

  useEffect(() => {
    if (!onResolvedEvmRef.current) return;
    if (!evmAddress) {
      lastEmittedEvm.current = undefined;
      onResolvedEvmRef.current(undefined);
      return;
    }
    if (evmAddress === lastEmittedEvm.current) return;
    lastEmittedEvm.current = evmAddress;
    onResolvedEvmRef.current(evmAddress);
  }, [evmAddress]);

  const showNativeResolvedSuffix = isNativeFormat && shortEvmAddress && !error;
  const showEvmResolvedSuffix = !isNativeFormat && (accountIdFromEvm ?? isLoadingAccountIdFromEvm) && !error;

  const copyText =
    showNativeResolvedSuffix && evmAddress
      ? evmAddress
      : showEvmResolvedSuffix && accountIdFromEvm && !isLoadingAccountIdFromEvm
        ? accountIdFromEvm
        : undefined;

  const suffixContent =
    showNativeResolvedSuffix || showEvmResolvedSuffix ? (
      <span
        className="flex min-w-0 max-w-[min(52%,18rem)] shrink-0 items-center gap-1 border-l border-sui-input-border py-1 pl-2.5 pr-2 text-xs font-medium tabular-nums text-sui-base-content/55"
        aria-live="polite"
      >
        <span
          className="shrink-0 opacity-70"
          aria-hidden
        >
          →
        </span>
        <span className="min-w-0 truncate text-sui-base-content/70">
          {showNativeResolvedSuffix ? shortEvmAddress : null}
          {showEvmResolvedSuffix ? (
            isLoadingAccountIdFromEvm ? (
              <span className="animate-pulse text-sui-base-content/50">Resolving…</span>
            ) : (
              accountIdFromEvm
            )
          ) : null}
        </span>
        {copyText ? (
          <AddressCopyIcon
            address={copyText}
            ariaLabel="Copy resolved value"
            buttonClassName="shrink-0 rounded-full p-1 text-sui-base-content/55 transition-colors hover:bg-sui-base-content/10 hover:text-sui-base-content focus:outline-none focus-visible:ring-2 focus-visible:ring-sui-base-content/25"
            className="h-3.5 w-3.5"
          />
        ) : null}
      </span>
    ) : null;

  const hasBlockingError = Boolean(error);
  let tone: BaseInputFieldTone = "default";
  if (!hasBlockingError && isResolving && value.trim() !== "") {
    tone = "pending";
  }

  return (
    <div
      className="flex w-full flex-col gap-2"
      aria-busy={isResolving && !hasBlockingError ? true : undefined}
    >
      <BaseInput<string>
        name={name}
        placeholder={placeholder ?? "0.0.12345 or 0x…"}
        value={value}
        onChange={onChange}
        error={hasBlockingError}
        tone={hasBlockingError ? "default" : tone}
        disabled={disabled ?? isLoading}
        reFocus={hasBlockingError}
        style={style}
        suffix={suffixContent}
      />
      {hasBlockingError ? (
        <div
          className="flex items-start gap-2 px-1 text-sm text-sui-error"
          role="alert"
        >
          <StatusIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="min-w-0 leading-snug">{error}</span>
        </div>
      ) : null}
      {warning && !hasBlockingError ? (
        <div
          className="flex items-start gap-2 border-l-2 border-sui-warning/80 pl-3 text-sm text-sui-base-content/90"
          role="status"
        >
          <StatusIcon className="mt-0.5 h-4 w-4 shrink-0 text-sui-warning opacity-90" />
          <span className="min-w-0 leading-snug">{warning}</span>
        </div>
      ) : null}
    </div>
  );
};

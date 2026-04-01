"use client";

import { useEffect, useRef, useState } from "react";
import type { Chain } from "viem";
import { hederaTestnet } from "viem/chains";
import { MAX_DECIMALS_USD, useHbarInput, SIGNED_NUMBER_REGEX } from "@scaffold-ui/hooks";
import { SwitchIcon } from "../icons/SwitchIcon";
import { BaseInput } from "./BaseInput";
import { CommonInputProps } from "./utils";

export type HbarInputProps = Omit<CommonInputProps<string>, "onChange" | "value"> & {
  defaultValue?: string;
  defaultUsdMode?: boolean;
  /** Chain for native currency price and label. Defaults to hederaTestnet (HBAR). */
  chain?: Chain;
  onValueChange?: (value: { valueInNative: string; valueInUsd: string; displayUsdMode: boolean }) => void;
};

/** Symbol shown in the input when in native-token mode (HBAR = ℏ, ETH = Ξ). */
const NATIVE_PREFIX: Record<string, string> = {
  HBAR: "ℏ",
  ETH: "Ξ",
};

/**
 * HbarInput Component (Hedera-first)
 *
 * Input for native token/USD amounts (defaults to HBAR on Hedera testnet). Toggle between native token and USD; uses HBAR price when chain is Hedera, otherwise chain's native price (e.g. ETH).
 * - Default chain: hederaTestnet (HBAR).
 */
export const HbarInput = ({
  name,
  placeholder,
  defaultValue,
  defaultUsdMode,
  chain = hederaTestnet,
  disabled,
  onValueChange,
  style,
}: HbarInputProps) => {
  const [sourceValue, setSourceValue] = useState(defaultValue ?? "");
  const [sourceUsdMode, setSourceUsdMode] = useState(defaultUsdMode ?? false);
  const [displayUsdMode, setDisplayUsdMode] = useState(defaultUsdMode ?? false);

  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  const { valueInNative, valueInUsd, isNativeCurrencyPriceLoading, isNativeCurrencyPriceError, nativeCurrencySymbol } =
    useHbarInput({
      value: sourceValue,
      usdMode: sourceUsdMode,
      chain,
    });

  const nativePrefix = NATIVE_PREFIX[nativeCurrencySymbol] ?? nativeCurrencySymbol;

  const activeValue = displayUsdMode ? valueInUsd : valueInNative;

  useEffect(() => {
    if (onValueChangeRef.current) {
      onValueChangeRef.current({ valueInNative, valueInUsd, displayUsdMode });
    }
  }, [valueInNative, valueInUsd, displayUsdMode]);

  const handleInputChange = (value: string) => {
    if (value && !SIGNED_NUMBER_REGEX.test(value)) {
      return;
    }

    if (displayUsdMode) {
      const decimals = value.split(".")[1];
      if (decimals && decimals.length > MAX_DECIMALS_USD) {
        return;
      }
    }

    setSourceValue(value);
    if (sourceUsdMode !== displayUsdMode) {
      setSourceUsdMode(displayUsdMode);
    }
  };

  const handleToggleMode = () => {
    setDisplayUsdMode((prev) => !prev);
  };

  return (
    <div className="flex items-center gap-2">
      <BaseInput<string>
        name={name}
        value={activeValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        disabled={isNativeCurrencyPriceLoading || disabled}
        prefix={
          <span
            className="pl-4 -mr-2 self-center"
            title={displayUsdMode ? "USD" : nativeCurrencySymbol}
          >
            {displayUsdMode ? "$" : nativePrefix}
          </span>
        }
        style={style}
        suffix={
          <button
            className="h-[2.2rem] min-h-[2.2rem] cursor-pointer mr-3"
            onClick={(e) => {
              e.preventDefault();
              handleToggleMode();
            }}
            disabled={isNativeCurrencyPriceLoading || isNativeCurrencyPriceError || disabled}
            type="button"
            tabIndex={-1}
            title={
              isNativeCurrencyPriceLoading
                ? "Fetching price"
                : isNativeCurrencyPriceError
                  ? "Unable to fetch price"
                  : `Toggle USD/${nativeCurrencySymbol}`
            }
          >
            <SwitchIcon
              height={15}
              width={15}
            />
          </button>
        }
      />
    </div>
  );
};

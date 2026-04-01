import type { Chain } from "viem";
import { useFetchNativeCurrencyPrice } from "./useFetchNativeCurrencyPrice";
import { hederaTestnet } from "viem/chains";

export const MAX_DECIMALS_USD = 2;

export const SIGNED_NUMBER_REGEX = /^-?\d*\.?\d*$/;

function nativeValueToUsd(nativeValue: string, nativeCurrencyPrice: number) {
  if (!nativeValue || !nativeCurrencyPrice) {
    return "";
  }

  if (!SIGNED_NUMBER_REGEX.test(nativeValue)) {
    throw new Error("Invalid value");
  }

  const parsed = parseFloat(nativeValue);

  return (Math.round(parsed * nativeCurrencyPrice * 10 ** MAX_DECIMALS_USD) / 10 ** MAX_DECIMALS_USD).toString();
}

function usdValueToNative(usdValue: string, nativeCurrencyPrice: number) {
  if (!usdValue || !nativeCurrencyPrice) {
    return "";
  }

  if (!SIGNED_NUMBER_REGEX.test(usdValue)) {
    throw new Error("Invalid USD value");
  }

  const parsedUsdValue = parseFloat(usdValue);

  return (parsedUsdValue / nativeCurrencyPrice).toString();
}

export type UseHbarInputOptions = {
  value: string;
  usdMode: boolean;
  /** Chain for native currency price and symbol. Defaults to hederaTestnet (HBAR). */
  chain?: Chain;
};

function useNativeCurrencyInput(value: string, usdMode: boolean, chain: Chain) {
  const {
    price: nativeCurrencyPrice,
    isLoading: isNativeCurrencyPriceLoading,
    isError: isNativeCurrencyPriceError,
  } = useFetchNativeCurrencyPrice(chain);

  const nativeCurrencySymbol = chain.nativeCurrency?.symbol ?? "HBAR";

  let valueInNative = "";
  let valueInUsd = "";
  let error: string | null = null;

  try {
    valueInNative = usdMode ? usdValueToNative(value, nativeCurrencyPrice || 0) : value;
    valueInUsd = usdMode ? value : nativeValueToUsd(value, nativeCurrencyPrice || 0);
  } catch (err: unknown) {
    error = (err as Error).message;
  }

  return {
    valueInNative,
    valueInUsd,
    error,
    isError: Boolean(error),
    nativeCurrencyPrice,
    isNativeCurrencyPriceLoading,
    isNativeCurrencyPriceError,
    nativeCurrencySymbol,
  };
}

/**
 * Hook for native token/USD conversion (Hedera-first: defaults to HBAR).
 * When chain is Hedera (mainnet/testnet), uses HBAR price from CoinGecko; otherwise uses chain's native price.
 *
 * @param options.value - The value as entered by the user (in native token or USD, depending on usdMode)
 * @param options.usdMode - true if value is USD, false if native token
 * @param options.chain - Optional chain; defaults to hederaTestnet (HBAR).
 */
export const useHbarInput = ({ value, usdMode, chain = hederaTestnet }: UseHbarInputOptions) => {
  return useNativeCurrencyInput(value, usdMode, chain);
};

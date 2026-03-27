"use client";

import React, { CSSProperties, useMemo } from "react";
import { useAddress } from "@scaffold-ui/hooks";
import { Chain, type Address as AddressType } from "viem";
import { mainnet } from "viem/chains";
import { AddressLinkWrapper } from "./AddressLinkWrapper";
import { AddressCopyIcon } from "./AddressCopyIcon";
import { textSizeMap, blockieSizeMap, copyIconSizeMap } from "./utils";
import { DefaultStylesWrapper } from "../utils/ComponentWrapper";
import { useConfig } from "wagmi";

export type AddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  chain?: Chain;
  style?: CSSProperties;
  blockExplorerAddressLink?: string;
};

/**
 * Address Component
 *
 * Displays an address with avatar (blockie) and copy functionality.
 * - Shows a blockie (identicon) for the address.
 * - Provides copy-to-clipboard functionality for the address.
 * - Supports linking to block explorers for address details.
 *
 * @param {AddressProps} props - The props for the Address component.
 * @param {AddressType} [props.address] - (Optional) The Ethereum address to display.
 * @param {boolean} [props.disableAddressLink] - (Optional) If true, disables the link to block explorer.
 * @param {"short" | "long"} [props.format] - (Optional) Display format for the address. "short" shows truncated version, "long" shows full address.
 * @param {"xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"} [props.size="base"] - (Optional) Size variant for the component display.
 * @param {Chain} [props.chain] - (Optional) The blockchain network to use for ENS resolution. Defaults to mainnet.
 * @param {CSSProperties} [props.style] - (Optional) Custom CSS styles to apply to the component.
 *   Performance Warning: Always memoize style objects to prevent unnecessary re-renders.
 * @param {string} [props.blockExplorerAddressLink] - (Optional) Custom block explorer URL for the address link.
 *
 * @example
 * <Address address="0x123..." />
 * <Address address="0x123..." format="long" size="lg" />
 * <Address address="0x123..." onlyEnsOrAddress disableAddressLink />
 * <Address address="0x123..." chain={mainnet} blockExplorerAddressLink="https://etherscan.io/address/0x123..." />
 */
export const Address: React.FC<AddressProps> = ({
  address,
  disableAddressLink,
  format,
  size = "base",
  chain,
  style,
  blockExplorerAddressLink,
}) => {
  const { chains: configuredChains } = useConfig();
  const chainToUse = chain ? chain : configuredChains[0] ? configuredChains[0] : mainnet;

  const {
    checkSumAddress,
    blockExplorerAddressLink: blockExplorerLink,
    isValidAddress,
    shortAddress,
    blockieUrl,
  } = useAddress({ address, chain: chainToUse });

  const addressSize = size;
  const blockieSize = size;

  const skeletonStyle = useMemo(() => {
    return {
      width: (blockieSizeMap[blockieSize] * 24) / blockieSizeMap["base"],
      height: (blockieSizeMap[blockieSize] * 24) / blockieSizeMap["base"],
    };
  }, [blockieSize]);

  // If address is provided but invalid, show error message
  if (address && !isValidAddress) {
    return (
      <DefaultStylesWrapper
        className="flex items-center text-sui-error"
        style={style}
      >
        <svg
          className="shrink-0"
          width={(blockieSizeMap[blockieSize] * 24) / blockieSizeMap["base"]}
          height={(blockieSizeMap[blockieSize] * 24) / blockieSizeMap["base"]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* prettier-ignore */}
          <circle cx="12" cy="12" r="10" />
          {/* prettier-ignore */}
          <line x1="12" y1="8" x2="12" y2="12" />
          {/* prettier-ignore */}
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="flex flex-col space-y-1">
          <span className={`ml-1.5 ${textSizeMap[addressSize]} font-bold`}>Invalid address</span>
          <span className={`ml-1.5 ${textSizeMap[addressSize]} break-all`}>{address}</span>
        </div>
      </DefaultStylesWrapper>
    );
  }

  // If address is not provided yet, show loading skeleton
  if (!checkSumAddress) {
    return (
      <DefaultStylesWrapper
        className="flex items-center text-sui-primary-content"
        style={style}
      >
        <div
          className="shrink-0 sui-skeleton !rounded-full"
          style={skeletonStyle}
        />
        <div className="flex flex-col space-y-1">
          <div className={`ml-1.5 sui-skeleton rounded-lg ${textSizeMap[addressSize]}`}>
            <span className="invisible">0x1234...56789</span>
          </div>
        </div>
      </DefaultStylesWrapper>
    );
  }

  // Valid address - prepare display variables
  blockExplorerAddressLink = blockExplorerAddressLink || blockExplorerLink;
  const displayAddress = format === "long" ? checkSumAddress : shortAddress;

  return (
    <DefaultStylesWrapper
      className="flex items-center shrink-0 text-sui-primary-content"
      style={style}
    >
      <div className="shrink-0">
        <img
          className="rounded-full"
          src={blockieUrl}
          width={(blockieSizeMap[blockieSize] * 24) / blockieSizeMap["base"]}
          height={(blockieSizeMap[blockieSize] * 24) / blockieSizeMap["base"]}
          alt={`${address} avatar`}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex">
          <span className={`ml-1.5 ${textSizeMap[addressSize]} font-normal`}>
            <AddressLinkWrapper
              disableAddressLink={disableAddressLink}
              blockExplorerAddressLink={blockExplorerAddressLink}
            >
              {displayAddress}
            </AddressLinkWrapper>
          </span>
          <AddressCopyIcon
            className={`ml-1 ${copyIconSizeMap[addressSize]} cursor-pointer`}
            address={checkSumAddress}
          />
        </div>
      </div>
    </DefaultStylesWrapper>
  );
};

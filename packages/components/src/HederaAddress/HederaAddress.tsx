"use client";

import React, { CSSProperties, useMemo } from "react";
import type { Address as AddressType, Chain } from "viem";
import { isAddress, getAddress } from "viem";
import {
  getBlockExplorerAddressLink,
  useAddress,
  useHederaAccountId,
  useHederaEvmAddress,
} from "@scaffold-hbar-ui/hooks";
import { AddressCopyIcon } from "../Address/AddressCopyIcon";
import { AddressLinkWrapper } from "../Address/AddressLinkWrapper";
import { textSizeMap, blockieSizeMap, copyIconSizeMap, getPrevSize } from "../Address/utils";
import { DefaultStylesWrapper } from "../utils/ComponentWrapper";

const HEDERA_ACCOUNT_ID_RE = /^\d+\.\d+\.\d+$/;

export type HederaAddressProps = {
  value?: string;
  chain: Chain;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  disableAddressLink?: boolean;
  avatarComponent?: React.ComponentType<{ address: string; size: number; ensImage: string | null }>;
  showEvmAddress?: boolean;
  style?: CSSProperties;
  blockExplorerAddressLink?: string;
};

const InvalidGlyph = ({ pixel }: { pixel: number }) => (
  <svg
    className="shrink-0"
    width={pixel}
    height={pixel}
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

export const HederaAddress = ({
  value,
  chain,
  format,
  size: sizeProp = "base",
  disableAddressLink,
  avatarComponent: AvatarComponent,
  showEvmAddress = true,
  style,
  blockExplorerAddressLink: blockExplorerAddressLinkProp,
}: HederaAddressProps) => {
  const size = sizeProp;
  const trimmed = value?.trim() ?? "";

  const isNativeFormat = HEDERA_ACCOUNT_ID_RE.test(trimmed);
  const isEvmFormat = trimmed.startsWith("0x") && trimmed.length === 42 && isAddress(trimmed, { strict: false });

  const evmFromProp: AddressType | undefined = isEvmFormat ? (getAddress(trimmed) as AddressType) : undefined;

  // EVM → accountId (only fires when value is an EVM address)
  const { accountId, isLoading: isLoadingAccountId } = useHederaAccountId(evmFromProp, chain.id);

  // accountId → EVM (only fires when value is a native 0.0.n)
  const { evmAddress: evmFromMirror, isLoading: isLoadingEvm } = useHederaEvmAddress(
    isNativeFormat ? trimmed : undefined,
    chain.id,
  );

  const resolvedEvm = evmFromProp ?? evmFromMirror;

  const { checkSumAddress, shortAddress, blockieUrl } = useAddress({
    address: resolvedEvm,
    chain,
  });

  const skeletonStyle = useMemo(() => {
    const px = (blockieSizeMap[size] * 24) / blockieSizeMap.base;
    return { width: px, height: px };
  }, [size]);

  const blockiePx = skeletonStyle.width;
  const secondarySizeKey = getPrevSize(textSizeMap, size);
  const secondaryTextClass = textSizeMap[secondarySizeKey];
  const secondaryCopyClass = copyIconSizeMap[secondarySizeKey as keyof typeof copyIconSizeMap];

  const isLoading = isLoadingAccountId || isLoadingEvm;

  // --- Empty state (skeleton) ---
  if (!trimmed) {
    return (
      <DefaultStylesWrapper
        className="flex items-center text-sui-primary-content"
        style={style}
      >
        <div
          className="shrink-0 sui-skeleton !rounded-full"
          style={skeletonStyle}
        />
        <div className="flex flex-col gap-1">
          <div className={`ml-1.5 sui-skeleton rounded-lg ${textSizeMap[size]}`}>
            <span className="invisible">0.0.12345</span>
          </div>
          <div className={`ml-1.5 sui-skeleton rounded-lg text-xs`}>
            <span className="invisible">EVM: 0x1234...5678</span>
          </div>
        </div>
      </DefaultStylesWrapper>
    );
  }

  // --- Invalid format ---
  if (!isNativeFormat && !isEvmFormat) {
    return (
      <DefaultStylesWrapper
        className="flex items-center text-sui-error"
        style={style}
      >
        <InvalidGlyph pixel={blockiePx} />
        <div className="ml-1.5 flex min-w-0 flex-col gap-1">
          <span className={`${textSizeMap[size]} font-bold`}>Invalid address</span>
          <span className={`${textSizeMap[size]} break-all`}>{trimmed}</span>
        </div>
      </DefaultStylesWrapper>
    );
  }

  // --- Resolve display values ---
  const resolvedAccountId = isNativeFormat ? trimmed : (accountId ?? undefined);
  const primaryRaw = resolvedAccountId ?? checkSumAddress ?? "";
  const isPrimaryHederaId = Boolean(resolvedAccountId);
  const primaryDisplay = format === "long" ? primaryRaw : isPrimaryHederaId ? primaryRaw : (shortAddress ?? primaryRaw);

  const secondaryRaw = resolvedAccountId && showEvmAddress && checkSumAddress ? checkSumAddress : undefined;
  const secondaryDisplay = secondaryRaw && (format === "long" ? secondaryRaw : (shortAddress ?? secondaryRaw));

  const computedExplorerLink = primaryRaw ? getBlockExplorerAddressLink(chain, primaryRaw) : "";
  const explorerLink = blockExplorerAddressLinkProp ?? computedExplorerLink;

  const blockieSource = checkSumAddress ?? primaryRaw;

  return (
    <DefaultStylesWrapper
      className="flex w-fit max-w-full shrink-0 flex-col items-start gap-1 text-sui-primary-content"
      style={style}
    >
      <div className="flex items-center">
        <div className="shrink-0">
          {AvatarComponent ? (
            <AvatarComponent
              address={blockieSource}
              size={blockiePx}
              ensImage={null}
            />
          ) : blockieUrl ? (
            <img
              src={blockieUrl}
              width={blockiePx}
              height={blockiePx}
              className="rounded-full"
              alt=""
            />
          ) : (
            <div
              className="shrink-0 sui-skeleton !rounded-full"
              style={{ width: blockiePx, height: blockiePx }}
            />
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center">
            <span className={`ml-1.5 ${textSizeMap[size]} font-normal`}>
              <AddressLinkWrapper
                disableAddressLink={disableAddressLink}
                blockExplorerAddressLink={explorerLink}
              >
                {primaryDisplay}
              </AddressLinkWrapper>
            </span>
            <AddressCopyIcon
              className={`ml-1 ${copyIconSizeMap[size]} cursor-pointer`}
              address={primaryRaw}
            />
          </div>
          {isLoading ? (
            <span className={`ml-1.5 ${secondaryTextClass} text-sui-primary-content/70 animate-pulse`}>
              {isNativeFormat ? "Resolving EVM address…" : "Resolving Hedera Account ID…"}
            </span>
          ) : null}
          {!isLoading && secondaryDisplay && secondaryRaw ? (
            <div className="ml-1.5 flex items-center gap-1">
              <span className={`${secondaryTextClass} text-sui-primary-content/70`}>EVM: {secondaryDisplay}</span>
              <AddressCopyIcon
                className={`${secondaryCopyClass} shrink-0 cursor-pointer`}
                address={secondaryRaw}
              />
            </div>
          ) : null}
        </div>
      </div>
    </DefaultStylesWrapper>
  );
};

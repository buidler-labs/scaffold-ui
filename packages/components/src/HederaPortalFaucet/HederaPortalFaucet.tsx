"use client";

import React from "react";
import { useAccount } from "wagmi";
import { hederaPortalFaucetUrl } from "./hederaPortalFaucetUrl";

const BanknotesGlyph = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    width={16}
    height={16}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
    />
  </svg>
);

const buttonVariantClass = "btn btn-primary btn-sm font-normal gap-1 inline-flex items-center";
const linkVariantClass = "link link-primary text-xs inline-flex items-center gap-1";

export type HederaPortalFaucetProps = {
  /** When set, used for the faucet pre-fill; when omitted, uses the connected wagmi address. */
  address?: string | null;
  className?: string;
  children?: React.ReactNode;
  label?: string;
  /** When `true`, shows the banknotes icon before the label. Omitted or `false` means no icon. */
  showIcon?: boolean;
  /** DaisyUI: primary small button vs inline text link (`link link-primary text-xs`). */
  variant?: "button" | "link";
};

/**
 * Link to the Hedera Portal faucet for testnet HBAR.
 * Pre-fills the connected wallet address when available unless `address` is passed.
 */
export const HederaPortalFaucet: React.FC<HederaPortalFaucetProps> = ({
  address: addressProp,
  className,
  children,
  label = "Get testnet HBAR",
  showIcon = true,
  variant = "button",
}) => {
  const { address: connectedAddress } = useAccount();
  const address = addressProp !== undefined ? addressProp : connectedAddress;
  const variantClass = variant === "link" ? linkVariantClass : buttonVariantClass;
  const mergedClassName = [variantClass, className].filter(Boolean).join(" ") || undefined;

  return (
    <a
      href={hederaPortalFaucetUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      className={mergedClassName}
    >
      {children ?? (
        <>
          {showIcon ? <BanknotesGlyph className="h-4 w-4 shrink-0" /> : null}
          <span>{label}</span>
        </>
      )}
    </a>
  );
};

"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { getAddress } from "viem";
import type { Address, Chain } from "viem";
import { hedera, hederaTestnet } from "viem/chains";
import { useDisconnect } from "wagmi";
import { Balance } from "@scaffold-ui/components";
import { getBlockExplorerAddressLink, useHederaAccountId } from "@scaffold-ui/hooks";
import { blo } from "blo";

const CHAIN_BY_ID: Record<number, Chain> = {
  [hederaTestnet.id]: hederaTestnet,
  [hedera.id]: hedera,
};

const HEDERA_CHAIN_IDS = new Set([296, 295]);

function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 800);
  };
  return { copy, isCopied };
}

function AddressDropdown({
  address,
  chain,
  blockExplorerAddressLink,
}: {
  address: Address;
  chain: { id: number; name: string };
  blockExplorerAddressLink: string;
}) {
  const { disconnect } = useDisconnect();
  const checkSumAddress = getAddress(address);
  const { accountId, isLoading: isAccountIdLoading } = useHederaAccountId(address, chain.id);
  const isHederaNetwork = HEDERA_CHAIN_IDS.has(chain.id);

  const { copy: copyAddress, isCopied: isAddressCopied } = useCopyToClipboard();
  const { copy: copyAccountId, isCopied: isAccountIdCopied } = useCopyToClipboard();
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const summaryLabel =
    isHederaNetwork && accountId ? accountId : `${checkSumAddress.slice(0, 6)}...${checkSumAddress.slice(-4)}`;

  return (
    <details ref={dropdownRef} className="dropdown dropdown-end">
      <summary className="btn btn-secondary btn-sm pl-0 pr-2 shadow-md gap-0 h-auto min-h-0 cursor-pointer list-none border border-primary/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={blo(checkSumAddress)}
          alt=""
          className="w-8 h-8 rounded-full flex-shrink-0"
          width={32}
          height={32}
        />
        <span className="ml-2 mr-1 text-sm font-mono">
          {isAccountIdLoading && isHederaNetwork ? "…" : summaryLabel}
        </span>
        <span className="ml-1 opacity-70">▾</span>
      </summary>
      <ul className="dropdown-content menu z-20 p-2 mt-2 shadow-lg bg-base-200 rounded-box gap-1 min-w-[220px] border border-base-300">
        {isHederaNetwork && accountId && (
          <li>
            <div
              className="flex gap-3 py-2 px-3 cursor-pointer rounded-lg hover:bg-base-300"
              onClick={() => copyAccountId(accountId)}
              onKeyDown={e => e.key === "Enter" && copyAccountId(accountId)}
              role="button"
              tabIndex={0}
            >
              {isAccountIdCopied ? (
                <span className="text-success text-sm">Copied!</span>
              ) : (
                <span className="text-sm">Copy account ID</span>
              )}
            </div>
            <div className="px-3 py-1 text-xs text-base-content/70 font-mono">{accountId}</div>
          </li>
        )}
        <li>
          <div
            className="flex gap-3 py-2 px-3 cursor-pointer rounded-lg hover:bg-base-300"
            onClick={() => copyAddress(checkSumAddress)}
            onKeyDown={e => e.key === "Enter" && copyAddress(checkSumAddress)}
            role="button"
            tabIndex={0}
          >
            {isAddressCopied ? (
              <span className="text-success text-sm">Copied!</span>
            ) : (
              <span className="text-sm">Copy address</span>
            )}
          </div>
          <div className="px-3 py-1 text-xs text-base-content/70 font-mono break-all">
            {checkSumAddress.slice(0, 10)}...{checkSumAddress.slice(-8)}
          </div>
        </li>
        <li>
          <a
            href={blockExplorerAddressLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 py-2 px-3 rounded-lg hover:bg-base-300 text-sm"
          >
            View on Block Explorer
          </a>
        </li>
        <li>
          <button
            type="button"
            className="text-error text-left text-sm py-2 px-3 rounded-lg hover:bg-base-300 w-full"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </li>
      </ul>
    </details>
  );
}

export const Header = () => {
  const pathname = usePathname();

  const getLinkClassName = (href: string) => {
    const isActive = pathname === href;
    const baseClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";

    if (isActive) {
      return `${baseClasses} bg-[var(--color-sui-primary)] text-[var(--color-sui-primary-content)] font-semibold`;
    }

    return `${baseClasses} text-[var(--color-sui-primary-content)] hover:text-[var(--color-sui-primary)] hover:bg-[var(--color-sui-primary-subtle)]`;
  };

  return (
    <header className="w-full bg-[var(--color-sui-primary-neutral)] border-[var(--color-sui-primary)] border-b-2 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Branding */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-[var(--color-sui-primary-content)]">Scaffold UI</h1>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className={getLinkClassName("/")}
              >
                Home
              </Link>
              <Link
                href="/debug"
                className={getLinkClassName("/debug")}
              >
                Debug Contracts
              </Link>
            </div>
          </nav>

          {/* Connect Button (custom: Balance + Hedera account ID dropdown) */}
          <div className="flex items-center gap-2">
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;
                const chainForExplorer = chain ? CHAIN_BY_ID[chain.id] : null;
                const blockExplorerAddressLink =
                  account && chainForExplorer
                    ? getBlockExplorerAddressLink(chainForExplorer, account.address)
                    : "#";

                if (!connected) {
                  return (
                    <button
                      type="button"
                      onClick={openConnectModal}
                      className="btn btn-primary btn-sm"
                    >
                      Connect Wallet
                    </button>
                  );
                }

                return (
                  <>
                    <div className="flex flex-col items-center">
                      <Balance
                        address={account.address as Address}
                        chain={chainForExplorer ?? hederaTestnet}
                        style={{ minHeight: "0", height: "auto", fontSize: "0.8em" }}
                      />
                      <span className="text-xs text-base-content/70">{chain.name}</span>
                    </div>
                    <AddressDropdown
                      address={account.address as Address}
                      chain={{ id: chain.id, name: chain.name ?? "Unknown" }}
                      blockExplorerAddressLink={blockExplorerAddressLink}
                    />
                  </>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </header>
  );
};

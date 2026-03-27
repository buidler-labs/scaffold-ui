"use client";

import type { ReactNode } from "react";
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
    <details
      ref={dropdownRef}
      className="dropdown dropdown-end"
    >
      <summary className="btn btn-ghost btn-sm rounded-full pl-1 pr-2 h-auto min-h-0 py-1.5 gap-1 cursor-pointer list-none border border-base-300 bg-base-200 shadow-none hover:bg-base-300">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={blo(checkSumAddress)}
          alt=""
          className="w-8 h-8 rounded-full flex-shrink-0"
          width={32}
          height={32}
        />
        <span className="ml-1 mr-0.5 text-sm font-mono text-base-content">
          {isAccountIdLoading && isHederaNetwork ? "…" : summaryLabel}
        </span>
        <span className="opacity-60 text-base-content">▾</span>
      </summary>
      <ul className="dropdown-content menu z-20 p-2 mt-2 shadow-lg bg-base-100 rounded-box gap-1 min-w-[220px] border border-base-300">
        {isHederaNetwork && accountId && (
          <li>
            <div
              className="flex gap-3 py-2 px-3 cursor-pointer rounded-lg hover:bg-base-200"
              onClick={() => copyAccountId(accountId)}
              onKeyDown={(e) => e.key === "Enter" && copyAccountId(accountId)}
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
            className="flex gap-3 py-2 px-3 cursor-pointer rounded-lg hover:bg-base-200"
            onClick={() => copyAddress(checkSumAddress)}
            onKeyDown={(e) => e.key === "Enter" && copyAddress(checkSumAddress)}
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
            className="flex gap-3 py-2 px-3 rounded-lg hover:bg-base-200 text-sm"
          >
            View on block explorer
          </a>
        </li>
        <li>
          <button
            type="button"
            className="text-error text-left text-sm py-2 px-3 rounded-lg hover:bg-base-200 w-full"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </li>
      </ul>
    </details>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`py-1.5 px-3 text-sm rounded-full transition-colors border ${
        isActive
          ? "bg-base-200 text-base-content font-semibold border-primary/35 shadow-sm"
          : "text-base-content/85 border-transparent hover:bg-base-200/70 hover:text-base-content hover:border-base-300"
      }`}
    >
      {children}
    </Link>
  );
}

export const Header = () => {
  return (
    <header className="sticky top-0 z-20 w-full shrink-0 border-b border-base-300 bg-base-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center min-h-14 h-14 gap-4">
          <div className="flex items-center gap-6 min-w-0">
            <Link
              href="/"
              className="shrink-0 font-bold text-base text-base-content"
            >
              Scaffold UI
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/debug">Debug contracts</NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <nav className="flex md:hidden items-center gap-1">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/debug">Debug</NavLink>
            </nav>
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, mounted }) => {
                const connected = mounted && account && chain;
                const chainForExplorer = chain ? CHAIN_BY_ID[chain.id] : null;
                const blockExplorerAddressLink =
                  account && chainForExplorer ? getBlockExplorerAddressLink(chainForExplorer, account.address) : "#";

                if (!connected) {
                  return (
                    <button
                      type="button"
                      onClick={openConnectModal}
                      className="btn btn-primary btn-sm"
                    >
                      Connect wallet
                    </button>
                  );
                }

                return (
                  <>
                    <div className="hidden sm:flex flex-col items-end">
                      <Balance
                        address={account.address as Address}
                        chain={chainForExplorer ?? hederaTestnet}
                        style={{ minHeight: "0", height: "auto", fontSize: "0.8em" }}
                      />
                      <span className="text-xs text-base-content/60">{chain.name}</span>
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

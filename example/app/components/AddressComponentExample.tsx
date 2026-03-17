"use client";

import React, { useState } from "react";
import type { Address as AddressType } from "viem";
import { hederaTestnet, mainnet } from "viem/chains";
import {
  Address,
  Balance,
  HederaAddress,
  HederaAddressInput,
  HbarInput,
} from "@scaffold-ui/components";
import { getBlockExplorerAddressLink, useMirrorNodeAccount } from "@scaffold-ui/hooks";
import { ExampleCard } from "./ExampleCard";

export const AddressComponentExample: React.FC = () => {
  const exampleEvmAddress = "0x0000000000000000000000000000000000000000";
  const exampleHederaAccountId = "0.0.10371555";
  /** Known testnet account for useMirrorNodeAccount demo (must exist on public mirror). */
  const mirrorDemoAccountId = "0.0.2";

  const [inputValue, setInputValue] = useState("");
  const [resolvedAddress, setResolvedAddress] = useState<AddressType | undefined>(undefined);

  return (
    <div className="flex flex-col gap-6 w-full items-center">
      <ExampleCard title="Address Component Usage (EVM)">
        <Address address={exampleEvmAddress} />
      </ExampleCard>

      <ExampleCard title="Address Component Usage (Hedera)">
        <HederaAddress
          address={exampleEvmAddress}
          hederaAccountId={exampleHederaAccountId}
          chain={hederaTestnet}
        />
      </ExampleCard>

      <ExampleCard title="Balance (Hedera / HBAR)">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-base-content/70">Address balance on Hedera testnet (click to toggle HBAR ↔ USD):</span>
          <Balance address={exampleEvmAddress} chain={hederaTestnet} />
        </div>
      </ExampleCard>

      <ExampleCard title="HederaAddressInput (EVM or 0.0.12345)">
        <div className="flex flex-col gap-4 w-full">
          <HederaAddressInput
            value={inputValue}
            onChange={addr => {
              setResolvedAddress(addr);
              setInputValue(addr);
            }}
            chainId={hederaTestnet.id}
            placeholder="0x... or 0.0.12345"
          />
          {resolvedAddress && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-base-content/70">Resolved address (upstream):</span>
              <HederaAddress address={resolvedAddress} chain={hederaTestnet} />
            </div>
          )}
        </div>
      </ExampleCard>

      <ExampleCard title="HbarInput (HBAR by default)">
        <div className="flex flex-col gap-4 w-full">
          <span className="text-xs text-base-content/70">Native token + USD toggle (defaults to Hedera testnet / HBAR):</span>
          <HbarInput placeholder="Amount in HBAR or USD" />
        </div>
      </ExampleCard>

      <ExampleCard title="HbarInput with ETH (chain=mainnet)">
        <div className="flex flex-col gap-4 w-full">
          <span className="text-xs text-base-content/70">Same component with chain=mainnet for ETH:</span>
          <HbarInput chain={mainnet} placeholder="Amount in ETH or USD" />
        </div>
      </ExampleCard>

      <ExampleCard title="useMirrorNodeAccount (single source of truth)">
        <MirrorNodeAccountDemo accountId={mirrorDemoAccountId} />
      </ExampleCard>

      <ExampleCard title="Connect dropdown (mocked)">
        <ConnectDropdownMock />
      </ExampleCard>
    </div>
  );
};

/** Mock of the scaffold-hbar connect dropdown: Balance + Hedera account ID + EVM address + HashScan link. */
function ConnectDropdownMock() {
  const mockEvmAddress = "0x0000000000000000000000000000000000000002" as AddressType;
  const mockAccountId = "0.0.2";
  const blockExplorerLink = getBlockExplorerAddressLink(hederaTestnet, mockAccountId);

  const [copied, setCopied] = useState<"accountId" | "address" | null>(null);

  const copy = (text: string, kind: "accountId" | "address") => {
    navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 800);
  };

  const summaryLabel = `${mockAccountId.slice(0, 4)}...${mockAccountId.slice(-4)}`;

  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-xs text-base-content/70 text-center">
        Mock of the connect dropdown when on Hedera: Balance + account ID in summary, dual copy + HashScan link.
      </p>
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <div className="flex flex-col items-center">
          <Balance address={mockEvmAddress} chain={hederaTestnet} style={{ minHeight: "0", height: "auto", fontSize: "0.8em" }} />
          <span className="text-xs text-base-content/70">{hederaTestnet.name}</span>
        </div>
        <details className="dropdown dropdown-end">
          <summary className="btn btn-secondary btn-sm pl-0 pr-2 shadow-md dropdown-toggle gap-0 h-auto! cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-base-300 flex-shrink-0" />
            <span className="ml-2 mr-1 font-mono text-sm">{summaryLabel}</span>
            <span className="ml-1">▾</span>
          </summary>
          <ul className="dropdown-content menu z-10 p-2 mt-2 shadow-lg bg-base-200 rounded-box gap-1 min-w-[200px]">
            <li>
              <div
                className="flex gap-3 py-2 px-3 cursor-pointer rounded-lg hover:bg-base-300"
                onClick={() => copy(mockAccountId, "accountId")}
                onKeyDown={e => e.key === "Enter" && copy(mockAccountId, "accountId")}
                role="button"
                tabIndex={0}
              >
                <span className="text-base-content/70">📋</span>
                {copied === "accountId" ? <span className="text-success">Copied!</span> : <span>Copy account ID</span>}
              </div>
              <div className="px-3 py-1 text-xs text-base-content/70 font-mono">{mockAccountId}</div>
            </li>
            <li>
              <div
                className="flex gap-3 py-2 px-3 cursor-pointer rounded-lg hover:bg-base-300"
                onClick={() => copy(mockEvmAddress, "address")}
                onKeyDown={e => e.key === "Enter" && copy(mockEvmAddress, "address")}
                role="button"
                tabIndex={0}
              >
                <span className="text-base-content/70">📋</span>
                {copied === "address" ? <span className="text-success">Copied!</span> : <span>Copy address</span>}
              </div>
              <div className="px-3 py-1 text-xs text-base-content/70 font-mono break-all">{mockEvmAddress.slice(0, 10)}...{mockEvmAddress.slice(-8)}</div>
            </li>
            <li>
              <a
                href={blockExplorerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 py-2 px-3 rounded-lg hover:bg-base-300"
              >
                <span className="text-base-content/70">↗</span>
                <span>View on Block Explorer</span>
              </a>
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
}

function MirrorNodeAccountDemo({ accountId }: { accountId: string }) {
  const { data, isLoading, isError, refetch } = useMirrorNodeAccount(accountId, {
    network: "testnet",
  });

  if (isLoading) {
    return <div className="text-sm text-base-content/70">Loading mirror account…</div>;
  }
  if (isError || !data) {
    return (
      <div className="flex flex-col gap-1">
        <p className="text-sm text-red-500">Failed to load account (or not found).</p>
        <button type="button" className="btn btn-sm btn-outline w-fit" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const hbar = Number(data.balance) / 1e8;
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div><span className="text-base-content/70">Account ID:</span> {data.accountId}</div>
      <div><span className="text-base-content/70">EVM address:</span> {data.evmAddress ?? "—"}</div>
      <div><span className="text-base-content/70">Key type:</span> {data.keyType}</div>
      <div><span className="text-base-content/70">Balance:</span> {hbar.toFixed(4)} HBAR (tinybars: {data.balance.toString()})</div>
      <div><span className="text-base-content/70">canSignEVM:</span> {data.canSignEVM ? "Yes" : "No"}</div>
      <button type="button" className="btn btn-sm btn-outline w-fit mt-1" onClick={() => refetch()}>
        Refetch
      </button>
    </div>
  );
}

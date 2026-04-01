"use client";

import type { ReactNode } from "react";
import type { Address as AddressType } from "viem";
import { Address } from "@scaffold-ui/components";
import { ExampleCard } from "../ExampleCard";
import { DEMO_EVM_ADDRESS } from "./demoConstants";
import { useChainId, useChains } from "wagmi";

function AddressExampleRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-base-content/10 pb-4 last:border-b-0 last:pb-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/45">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function AddressExample() {
  const chainId = useChainId();
  const chains = useChains();
  const activeChain = chains.find((chain) => chain.id === chainId);
  return (
    <ExampleCard
      maxWidth="wide"
      title="Address component (EVM)"
      description="All display modes: short and long text, copy + blockie, invalid input, loading skeleton, and optional link disable."
    >
      <div className="flex w-full flex-col gap-5">
        <AddressExampleRow label="Short (default)">
          <Address
            address={DEMO_EVM_ADDRESS}
            chain={activeChain}
          />
        </AddressExampleRow>
        <AddressExampleRow label='Long format (format="long")'>
          <Address
            address={DEMO_EVM_ADDRESS}
            format="long"
            chain={activeChain}
          />
        </AddressExampleRow>
        <AddressExampleRow label='Smaller size (size="sm")'>
          <Address
            address={DEMO_EVM_ADDRESS}
            size="sm"
            chain={activeChain}
          />
        </AddressExampleRow>
        <AddressExampleRow label="Explorer link disabled">
          <Address
            address={DEMO_EVM_ADDRESS}
            disableAddressLink
            chain={activeChain}
          />
        </AddressExampleRow>
        <AddressExampleRow label="Invalid address">
          <Address
            address={"0x1234" as AddressType}
            chain={activeChain}
          />
        </AddressExampleRow>
        <AddressExampleRow label="No address yet (skeleton)">
          <Address chain={activeChain} />
        </AddressExampleRow>
      </div>
    </ExampleCard>
  );
}

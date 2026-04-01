"use client";

import type { ReactNode } from "react";
import { hederaTestnet } from "viem/chains";
import { HederaAddress } from "@scaffold-ui/components";
import { useChainId, useChains } from "wagmi";
import { ExampleCard } from "../ExampleCard";
import { HEDERA_TESTNET_DEMO_EVM, INACTIVE_EVM_ADDRESS, MIRROR_NODE_DEMO_ACCOUNT_ID } from "./demoConstants";

function HederaAddressExampleRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-base-content/10 pb-4 last:border-b-0 last:pb-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/45">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function HederaAddressExample() {
  const chainId = useChainId();
  const chains = useChains();
  const chain = chains.find((candidate) => candidate.id === chainId) ?? hederaTestnet;

  return (
    <ExampleCard
      maxWidth="wide"
      title="Address component (Hedera)"
      description="Accepts a Hedera account ID (0.0.x) or a 0x address; the paired form is resolved from the network."
    >
      <div className="flex w-full flex-col gap-5">
        <HederaAddressExampleRow label="EVM address (resolves account ID from mirror)">
          <HederaAddress
            value={HEDERA_TESTNET_DEMO_EVM}
            chain={chain}
          />
        </HederaAddressExampleRow>
        <HederaAddressExampleRow label="Native account ID (resolves EVM from mirror)">
          <HederaAddress
            value={MIRROR_NODE_DEMO_ACCOUNT_ID}
            chain={chain}
          />
        </HederaAddressExampleRow>
        <HederaAddressExampleRow label='Smaller size (size="sm")'>
          <HederaAddress
            value={HEDERA_TESTNET_DEMO_EVM}
            chain={chain}
            size="sm"
          />
        </HederaAddressExampleRow>
        <HederaAddressExampleRow label="Explorer link disabled">
          <HederaAddress
            value={HEDERA_TESTNET_DEMO_EVM}
            chain={chain}
            disableAddressLink
          />
        </HederaAddressExampleRow>
        <HederaAddressExampleRow label="EVM not on Hedera testnet">
          <HederaAddress
            value={INACTIVE_EVM_ADDRESS}
            chain={chain}
          />
        </HederaAddressExampleRow>
        <HederaAddressExampleRow label="Invalid value (bad format)">
          <HederaAddress
            value="0.0.not-a-number"
            chain={chain}
          />
        </HederaAddressExampleRow>
        <HederaAddressExampleRow label="No value (skeleton)">
          <HederaAddress chain={chain} />
        </HederaAddressExampleRow>
      </div>
    </ExampleCard>
  );
}

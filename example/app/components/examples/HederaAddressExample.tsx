"use client";

import type { ReactNode } from "react";
import { hederaTestnet } from "viem/chains";
import { HederaAddress } from "@scaffold-ui/components";
import { ExampleCard } from "../ExampleCard";
import { DEMO_EVM_ADDRESS, DEMO_HEDERA_ACCOUNT_ID } from "./demoConstants";

function HederaAddressExampleRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-base-content/10 pb-4 last:border-b-0 last:pb-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-base-content/45">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function HederaAddressExample() {
  const chain = hederaTestnet;

  return (
    <ExampleCard
      maxWidth="wide"
      title="Address component (Hedera)"
      description="Same state patterns as Address: short/long, size, invalid inputs, skeleton, and optional explorer link."
    >
      <div className="flex w-full flex-col gap-5">
        <HederaAddressExampleRow label="Short (default) + resolved ID">
          <HederaAddress
            address={DEMO_EVM_ADDRESS}
            hederaAccountId={DEMO_HEDERA_ACCOUNT_ID}
            chain={chain}
          />
        </HederaAddressExampleRow>
        <HederaAddressExampleRow label='Smaller size (size="sm")'>
          <HederaAddress
            address={DEMO_EVM_ADDRESS}
            hederaAccountId={DEMO_HEDERA_ACCOUNT_ID}
            chain={chain}
            size="sm"
          />
        </HederaAddressExampleRow>
        <HederaAddressExampleRow label="Explorer link disabled">
          <HederaAddress
            address={DEMO_EVM_ADDRESS}
            hederaAccountId={DEMO_HEDERA_ACCOUNT_ID}
            chain={chain}
            disableAddressLink
          />
        </HederaAddressExampleRow>
        <HederaAddressExampleRow label="Invalid Hedera account ID prop">
          <HederaAddress
            address={DEMO_EVM_ADDRESS}
            hederaAccountId="0.0."
            chain={chain}
          />
        </HederaAddressExampleRow>
        <HederaAddressExampleRow label="No address / no account ID (skeleton)">
          <HederaAddress chain={chain} />
        </HederaAddressExampleRow>
      </div>
    </ExampleCard>
  );
}

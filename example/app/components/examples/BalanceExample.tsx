"use client";

import { hederaTestnet } from "viem/chains";
import { Balance } from "@scaffold-ui/components";
import { ExampleCard } from "../ExampleCard";
import { DEMO_EVM_ADDRESS } from "./demoConstants";

export function BalanceExample() {
  return (
    <ExampleCard
      maxWidth="wide"
      title="Balance (HBAR)"
      description="Address balance on Hedera testnet. Click the amount to toggle HBAR and USD."
    >
      <div className="flex flex-col gap-1 items-start">
        <Balance
          address={DEMO_EVM_ADDRESS}
          chain={hederaTestnet}
        />
      </div>
    </ExampleCard>
  );
}

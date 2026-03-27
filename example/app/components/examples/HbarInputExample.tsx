"use client";

import { HbarInput } from "@scaffold-ui/components";
import { ExampleCard } from "../ExampleCard";

export function HbarInputExample() {
  return (
    <ExampleCard
      maxWidth="wide"
      title="HbarInput"
      description="Native HBAR amount with USD toggle (defaults to Hedera testnet)."
      padding="comfortable"
    >
      <div className="flex w-full max-w-lg flex-col gap-4">
        <HbarInput placeholder="Amount in HBAR or USD" />
      </div>
    </ExampleCard>
  );
}

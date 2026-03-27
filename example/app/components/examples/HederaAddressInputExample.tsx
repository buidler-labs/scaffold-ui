"use client";

import { useState } from "react";
import { hederaTestnet } from "viem/chains";
import { HederaAddressInput } from "@scaffold-ui/components";
import { ExampleCard } from "../ExampleCard";

export function HederaAddressInputExample() {
  const [inputValue, setInputValue] = useState("");

  return (
    <ExampleCard
      maxWidth="wide"
      title="HederaAddressInput"
      description="Accepts 0x… or 0.0.12345-style account IDs and resolves to an EVM address when possible."
      padding="comfortable"
    >
      <div className="w-full max-w-lg">
        <HederaAddressInput
          value={inputValue}
          onChange={setInputValue}
          chainId={hederaTestnet.id}
          placeholder="0x... or 0.0.12345"
        />
      </div>
    </ExampleCard>
  );
}

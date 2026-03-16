"use client";

import React, { useState } from "react";
import type { Address as AddressType } from "viem";
import { hederaTestnet } from "viem/chains";
import { Address, HederaAddress, HederaAddressInput } from "@scaffold-ui/components";
import { ExampleCard } from "./ExampleCard";

export const AddressComponentExample: React.FC = () => {
  const exampleEvmAddress = "0x0000000000000000000000000000000000000000";
  const exampleHederaAccountId = "0.0.10371555";

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
    </div>
  );
};

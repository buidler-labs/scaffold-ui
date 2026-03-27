"use client";

import {
  AddressExample,
  BalanceExample,
  HbarInputExample,
  HederaAddressExample,
  HederaAddressInputExample,
  IntegerInputExample,
  MirrorNodeAccountExample,
} from "./examples";

export function HomeContent() {
  return (
    <div className="flex flex-col items-stretch w-full max-w-4xl mx-auto px-5 py-10 gap-6 grow">
      <div className="text-center">
        <h1 className="text-xl font-bold m-0">Component examples</h1>
        <p className="text-sm text-base-content/70 m-0 mt-2">
          Address, balance, Hedera inputs, debug-contracts inputs, and hooks — each example lives in its own file under{" "}
          <code className="text-xs opacity-80">components/examples/</code>.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full items-stretch">
        <AddressExample />
        <HederaAddressExample />
        <BalanceExample />
        <HederaAddressInputExample />
        <HbarInputExample />
        <IntegerInputExample />
        <MirrorNodeAccountExample />
      </div>
    </div>
  );
}

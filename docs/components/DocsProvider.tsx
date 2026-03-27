"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { hedera, hederaTestnet } from "viem/chains";
import { createConfig, http } from "wagmi";
import "@scaffold-ui/components/styles.css";
import "@scaffold-ui/debug-contracts/styles.css";

/** Hedera-only docs: `hedera` first so `Address` without `chain` defaults to Hedera mainnet. */
export const chains = [hedera, hederaTestnet] as const;

const wagmiConfig = createConfig({
  chains,
  connectors: [],
  ssr: true,
  transports: {
    [hedera.id]: http(),
    [hederaTestnet.id]: http(),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

export function DocsProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
import { darkTheme, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { hederaTestnet } from "viem/chains";
import { WagmiProvider } from "wagmi";
import { useTheme } from "next-themes";
import { wagmiConfig } from "./wagmiConfig";
import { SwitchTheme } from "./components/SwitchTheme";
import { Header } from "./components/Header";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const ScaffoldHbarShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <Header />
      <main className="relative flex flex-col flex-1">{children}</main>
      <SwitchTheme />
    </div>
  );
};

export const ScaffoldHbarAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === "dark";

  const rainbowKitTheme = mounted
    ? isDarkMode
      ? darkTheme({
          accentColor: "#8259ef",
          accentColorForeground: "white",
          borderRadius: "large",
          fontStack: "system",
          overlayBlur: "small",
        })
      : lightTheme({
          accentColor: "#4f46e5",
          accentColorForeground: "white",
          borderRadius: "large",
          fontStack: "system",
          overlayBlur: "small",
        })
    : lightTheme({
        accentColor: "#4f46e5",
        accentColorForeground: "white",
        borderRadius: "large",
        fontStack: "system",
        overlayBlur: "small",
      });

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          coolMode
          initialChain={hederaTestnet}
          theme={rainbowKitTheme}
        >
          <ScaffoldHbarShell>{children}</ScaffoldHbarShell>
        </RainbowKitProvider>
      </QueryClientProvider>
      <Toaster />
    </WagmiProvider>
  );
};

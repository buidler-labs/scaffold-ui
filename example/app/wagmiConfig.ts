import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { createConfig } from "wagmi";
import { hedera, hederaTestnet } from "viem/chains";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createClient, http } from "viem";
import { rainbowkitBurnerWallet } from "burner-connector";

const wallets = [metaMaskWallet, rainbowkitBurnerWallet];

export const CHAINS = [hedera, hederaTestnet] as const;

export const wagmiConnectors = () => {
  const walletGroups = [
    {
      groupName: "Supported Wallets",
      wallets,
    },
    {
      groupName: "Development",
      wallets: [rainbowkitBurnerWallet],
    },
  ];

  return connectorsForWallets(walletGroups, {
    appName: "scaffold-hbar",
    projectId: "3a8170812b534d0ff9d794f19a901d64",
  });
};

export const wagmiConfig = createConfig({
  chains: CHAINS,
  connectors: wagmiConnectors(),
  ssr: true,
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

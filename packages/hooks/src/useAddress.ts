import { type Address as AddressType, type Chain, getAddress, isAddress } from "viem";
import { blo } from "blo";
import { hedera, hederaTestnet, mainnet } from "viem/chains";

type UseAddressOptions = {
  address?: AddressType;
  chain?: Chain;
};

function hashscanBaseUrlForChainId(chainId: number): string {
  if (chainId === hedera.id) return "https://hashscan.io/mainnet";
  if (chainId === hederaTestnet.id) return "https://hashscan.io/testnet";
  return "https://hashscan.io/testnet";
}

function isHederaChainId(chainId: number): boolean {
  return chainId === hedera.id || chainId === hederaTestnet.id;
}

/** HashScan uses `/account/`; EVM explorers use `/address/`. Without explorer config, falls back to HashScan. */
export function getBlockExplorerAddressLink(network: Chain, address: string) {
  const blockExplorerBaseURL = network.blockExplorers?.default?.url;

  if (!blockExplorerBaseURL) {
    return `${hashscanBaseUrlForChainId(network.id)}/account/${address}`;
  }

  const pathSegment = isHederaChainId(network.id) ? "account" : "address";
  return `${blockExplorerBaseURL}/${pathSegment}/${address}`;
}

// make the chain optional, if not provided, it will use from wagmi conig
export const useAddress = (UseAddressOptions: UseAddressOptions) => {
  const checkSumAddress =
    UseAddressOptions?.address &&
    (isAddress(UseAddressOptions?.address) ? getAddress(UseAddressOptions.address) : undefined);

  const isValidAddress = Boolean(checkSumAddress);

  const shortAddress = checkSumAddress ? `${checkSumAddress.slice(0, 6)}...${checkSumAddress.slice(-4)}` : undefined;

  const blockExplorerAddressLink = checkSumAddress
    ? getBlockExplorerAddressLink(UseAddressOptions?.chain ?? mainnet, checkSumAddress)
    : "";

  const blockieUrl = checkSumAddress ? blo(checkSumAddress) : undefined;

  return {
    checkSumAddress,
    ens: undefined,
    ensAvatar: undefined,
    isEnsNameLoading: false,
    blockExplorerAddressLink,
    isValidAddress,
    shortAddress,
    blockieUrl,
  };
};

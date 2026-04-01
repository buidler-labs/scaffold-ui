import * as chains from "viem/chains";

/**
 * Gives the block explorer transaction URL, returns empty string if the network is a local chain
 */
export function getBlockExplorerTxLink(chainId: number, txnHash: string) {
  const chainNames = Object.keys(chains);

  const targetChainArr = chainNames.filter((chainName) => {
    const wagmiChain = chains[chainName as keyof typeof chains];
    return wagmiChain.id === chainId;
  });

  if (targetChainArr.length === 0) {
    return "";
  }

  const targetChain = targetChainArr[0] as keyof typeof chains;
  const blockExplorerTxURL = chains[targetChain]?.blockExplorers?.default?.url;

  if (!blockExplorerTxURL) {
    return "";
  }

  return `${blockExplorerTxURL}/tx/${txnHash}`;
}

function hashscanBaseUrlForChainId(chainId: number): string {
  if (chainId === chains.hedera.id) return "https://hashscan.io/mainnet";
  if (chainId === chains.hederaTestnet.id) return "https://hashscan.io/testnet";
  return "https://hashscan.io/testnet";
}

function isHederaChainId(chainId: number): boolean {
  return chainId === chains.hedera.id || chainId === chains.hederaTestnet.id;
}

/**
 * Gives the block explorer URL for a given address.
 * Hedera chains use HashScan with `/account/`; EVM explorers use `/address/`.
 * If no explorer is configured on the chain, falls back to HashScan (mainnet / testnet by id, else testnet).
 */
export function getBlockExplorerAddressLink(network: chains.Chain, address: string) {
  const blockExplorerBaseURL = network.blockExplorers?.default?.url;
  if (network.id === chains.hardhat.id) {
    return `/blockexplorer/address/${address}`;
  }

  if (!blockExplorerBaseURL) {
    return `${hashscanBaseUrlForChainId(network.id)}/account/${address}`;
  }

  const pathSegment = isHederaChainId(network.id) ? "account" : "address";
  return `${blockExplorerBaseURL}/${pathSegment}/${address}`;
}

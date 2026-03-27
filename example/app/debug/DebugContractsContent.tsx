"use client";

import { Contract } from "@scaffold-ui/debug-contracts";
import { getBlockExplorerAddressLink } from "@scaffold-ui/hooks";
import * as viemChains from "viem/chains";
import type { Abi, Address, Chain } from "viem";
import { extractChain, isAddressEqual, zeroAddress } from "viem";
import { hederaTestnet } from "viem/chains";
import { useChainId } from "wagmi";
import { deployedContracts } from "../contracts/deployedContracts";

/** Must match a key under each chain in `deployedContracts`. */
const DEBUG_CONTRACT_NAME = "HederaToken" as const;

type Deployment = {
  address: Address;
  abi: Abi | readonly unknown[];
  inheritedFunctions?: Record<string, string>;
  deployedOnBlock?: number;
};

function pickContractForChain(chainId: number): { deployment: Deployment; effectiveChainId: number } {
  const map = deployedContracts as Record<number, Record<string, Deployment>>;
  if (map[chainId]?.[DEBUG_CONTRACT_NAME]) {
    return { deployment: map[chainId][DEBUG_CONTRACT_NAME], effectiveChainId: chainId };
  }
  const fallbackId = hederaTestnet.id;
  const deployment = map[fallbackId][DEBUG_CONTRACT_NAME];
  return { deployment, effectiveChainId: fallbackId };
}

export function DebugContractsContent() {
  const chainId = useChainId();
  const { deployment, effectiveChainId } = pickContractForChain(chainId);

  const chain = extractChain({
    chains: Object.values(viemChains),
    // viem: chain id union is exhaustive; runtime id always matches a known chain in `viem/chains`
    id: effectiveChainId,
  } as { chains: readonly Chain[]; id: Chain["id"] });

  const contract = {
    address: deployment.address,
    abi: deployment.abi as Abi,
  };

  const blockExplorerAddressLink = getBlockExplorerAddressLink(chain, contract.address);
  const needsAddress = isAddressEqual(contract.address, zeroAddress);
  const chainMismatch = chainId !== effectiveChainId;

  return (
    <div className="flex flex-col grow w-full bg-base-200">
      <h1 className="text-center text-xl font-bold py-6 px-4 m-0 text-base-content">Debug contracts</h1>

      {chainMismatch ? (
        <div className="max-w-3xl mx-auto px-4 w-full pb-2">
          <div
            role="alert"
            className="rounded-box border border-base-300 border-l-4 border-l-primary bg-base-100 text-base-content text-sm shadow-sm px-4 py-3"
          >
            <span className="leading-relaxed">
              No deployment for chain{" "}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-base-200 text-base-content">
                {chainId}
              </code>{" "}
              in{" "}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-base-200 text-base-content">
                deployedContracts.ts
              </code>
              . Showing{" "}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-base-200 text-base-content">
                {DEBUG_CONTRACT_NAME}
              </code>{" "}
              for Hedera testnet ({effectiveChainId}).
            </span>
          </div>
        </div>
      ) : null}

      {needsAddress ? (
        <div className="max-w-3xl mx-auto px-4 w-full pb-4">
          <div
            role="alert"
            className="rounded-box border border-base-300 border-l-4 border-l-warning bg-base-100 text-base-content text-sm shadow-sm px-4 py-3"
          >
            <span className="leading-relaxed">
              Set a non-zero contract address for{" "}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-base-200 text-base-content">
                {DEBUG_CONTRACT_NAME}
              </code>{" "}
              in{" "}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded-md bg-base-200 text-base-content">
                example/app/contracts/deployedContracts.ts
              </code>
              .
            </span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col items-stretch w-full pb-10">
        <Contract
          contractName={DEBUG_CONTRACT_NAME}
          contract={contract}
          chainId={effectiveChainId}
          blockExplorerAddressLink={blockExplorerAddressLink}
        />
      </div>
    </div>
  );
}

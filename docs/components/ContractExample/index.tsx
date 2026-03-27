import React from "react";
import { hederaTestnet } from "viem/chains";
import { Contract } from "@scaffold-ui/debug-contracts";
import { deployedContracts } from "./deployedContracts";
import "./mobile.css";

export const ContractExample = () => {
  const chainId = hederaTestnet.id;
  const contractName = "HederaToken" as const;
  const contract = deployedContracts[chainId][contractName];
  return (
    <div className="contract-mobile-frame">
      <Contract
        contractName={contractName}
        contract={contract}
        chainId={chainId}
      />
    </div>
  );
};

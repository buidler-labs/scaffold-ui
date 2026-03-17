"use client";

import { useEffect, useMemo, useState } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import {
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  transformAbiFunction,
} from "../utils/contracts";
import { displayTxResult } from "../utils/utilsDisplay";
import { getParsedError } from "../utils/getParsedError";
import { ContractInput } from "./ContractInput";
import { notification } from "../utils/notification";
import { useContractConfig } from "../contexts/ContractConfigContext";

const HEDERA_CHAIN_IDS = new Set([295, 296, 31337]);
const NATIVE_ACCOUNT_ID_REGEX = /^\d+\.\d+\.\d+$/;

type ReadOnlyFunctionFormProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  inheritedFrom?: string;
  abi: Abi;
};

export const ReadOnlyFunctionForm = ({
  contractAddress,
  abiFunction,
  inheritedFrom,
  abi,
}: ReadOnlyFunctionFormProps) => {
  const { chainId } = useContractConfig();
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [result, setResult] = useState<unknown>();

  const { isFetching, refetch, error } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: abi,
    args: getParsedContractFunctionArgs(form),
    chainId: chainId,
    query: {
      enabled: false,
      retry: false,
    },
  });

  useEffect(() => {
    if (error) {
      const parsedError = getParsedError(error);
      console.log("The parsedError is:", parsedError);
      notification.error(parsedError);
    }
  }, [error]);

  const transformedFunction = transformAbiFunction(abiFunction);
  const hasUnresolvedHederaAddress = useMemo(() => {
    if (!HEDERA_CHAIN_IDS.has(chainId)) return false;
    return transformedFunction.inputs.some(
      (input, inputIndex) =>
        input.type === "address" &&
        NATIVE_ACCOUNT_ID_REGEX.test(String(form[getFunctionInputKey(abiFunction.name, input, inputIndex)] ?? "")),
    );
  }, [chainId, form, abiFunction.name, transformedFunction.inputs]);

  const inputElements = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={setForm}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });

  return (
    <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
      <div className="font-medium my-0 break-words">
        {abiFunction.name}
        <InheritanceTooltip inheritedFrom={inheritedFrom} />
      </div>
      {inputElements}
      <div className="flex flex-col md:flex-row justify-between gap-2 flex-wrap">
        <div className="grow w-full md:max-w-[80%]">
          {result !== null && result !== undefined && (
            <div className="bg-sui-primary-subtle rounded-3xl text-sm px-4 py-1.5 break-words overflow-auto">
              <p className="font-bold m-0 mb-1">Result:</p>
              <pre className="whitespace-pre-wrap break-words">{displayTxResult(result, "sm")}</pre>
            </div>
          )}
        </div>
        <button
          className="btn-dc btn-dc-secondary btn-sm self-end md:self-start"
          onClick={async () => {
            const { data } = await refetch();
            setResult(data);
          }}
          disabled={isFetching || hasUnresolvedHederaAddress}
          title={hasUnresolvedHederaAddress ? "Resolve Hedera account ID (0.0.x) first" : undefined}
        >
          {isFetching && <span className="loading-dc loading-dc-spinner loading-xs"></span>}
          Read 📡
        </button>
      </div>
    </div>
  );
};

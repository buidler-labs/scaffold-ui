"use client";

import { useState } from "react";
import { InheritanceTooltip } from "./InheritanceTooltip";
import { Abi, AbiFunction } from "abitype";
import { Address } from "viem";
import { useConfig } from "wagmi";
import { readContract } from "wagmi/actions";
import {
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  resolveHederaNativeAccountIdsInForm,
  transformAbiFunction,
} from "../utils/contracts";
import { displayTxResult } from "../utils/utilsDisplay";
import { getParsedError } from "../utils/getParsedError";
import { ContractInput } from "./ContractInput";
import { notification } from "../utils/notification";
import { useContractConfig } from "../contexts/ContractConfigContext";

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
  const config = useConfig();
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [result, setResult] = useState<unknown>();
  const [isFetching, setIsFetching] = useState(false);

  const transformedFunction = transformAbiFunction(abiFunction);

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

  const handleRead = async () => {
    setIsFetching(true);
    try {
      const resolvedForm = await resolveHederaNativeAccountIdsInForm(form, abiFunction, chainId);
      const args = getParsedContractFunctionArgs(resolvedForm);
      const data = await readContract(config, {
        address: contractAddress,
        abi,
        functionName: abiFunction.name,
        args,
        chainId,
      });
      setResult(data);
    } catch (error) {
      const parsedError = getParsedError(error);
      console.log("The parsedError is:", parsedError);
      notification.error(parsedError);
    } finally {
      setIsFetching(false);
    }
  };

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
          onClick={handleRead}
          disabled={isFetching}
        >
          {isFetching && <span className="loading-dc loading-dc-spinner loading-xs"></span>}
          Read 📡
        </button>
      </div>
    </div>
  );
};

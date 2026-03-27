"use client";

import { Dispatch, SetStateAction, useCallback } from "react";
import { AbiParameter } from "abitype";
import { BaseInput, HederaAddressInput } from "@scaffold-ui/components";
import { Bytes32Input } from "./inputs/Bytes32Input";
import { BytesInput } from "./inputs/BytesInput";
import { IntegerInput } from "./inputs/IntegerInput";
import { IntegerVariant } from "../utils/inputs";
import { AbiParameterTuple } from "../utils/contracts";
import { Tuple } from "./Tuple";
import { TupleArray } from "./TupleArray";
import { useContractConfig } from "../contexts/ContractConfigContext";

/** Hedera chain IDs – use HederaAddressInput (0x or 0.0.x) on these. Includes local fork (31337). */
const HEDERA_CHAIN_IDS = new Set([295, 296, 31337]);

type ContractInputProps = {
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any> | undefined;
  stateObjectKey: string;
  paramType: AbiParameter;
};

/**
 * Generic Input component to handle input's based on their function param type
 */
export const ContractInput = ({ setForm, form, stateObjectKey, paramType }: ContractInputProps) => {
  const { chainId } = useContractConfig();

  const onAddressChange = useCallback(
    (value: any) => {
      setForm((prev) => ({ ...prev, [stateObjectKey]: value }));
    },
    [setForm, stateObjectKey],
  );

  const inputProps = {
    name: stateObjectKey,
    value: form?.[stateObjectKey],
    placeholder: paramType.name ? `${paramType.type} ${paramType.name}` : paramType.type,
    onChange: onAddressChange,
  };

  const renderInput = () => {
    switch (paramType.type) {
      case "address":
        if (HEDERA_CHAIN_IDS.has(chainId)) {
          return (
            <HederaAddressInput
              name={inputProps.name}
              value={String(inputProps.value ?? "")}
              placeholder={inputProps.placeholder}
              onChange={onAddressChange}
              chainId={chainId}
            />
          );
        }
        return (
          <BaseInput
            name={inputProps.name}
            value={String(inputProps.value ?? "")}
            placeholder={inputProps.placeholder}
            onChange={onAddressChange}
          />
        );
      case "bytes32":
        return <Bytes32Input {...inputProps} />;
      case "bytes":
        return <BytesInput {...inputProps} />;
      case "string":
        return <BaseInput {...inputProps} />;
      case "tuple":
        return (
          <Tuple
            setParentForm={setForm}
            parentForm={form}
            abiTupleParameter={paramType as AbiParameterTuple}
            parentStateObjectKey={stateObjectKey}
          />
        );
      default:
        // Handling 'int' types and 'tuple[]' types
        if (paramType.type.includes("int") && !paramType.type.includes("[")) {
          return (
            <IntegerInput
              {...inputProps}
              variant={paramType.type as IntegerVariant}
            />
          );
        } else if (paramType.type.startsWith("tuple[")) {
          return (
            <TupleArray
              setParentForm={setForm}
              parentForm={form}
              abiTupleParameter={paramType as AbiParameterTuple}
              parentStateObjectKey={stateObjectKey}
            />
          );
        } else {
          return <BaseInput {...inputProps} />;
        }
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center ml-2">
        {paramType.name && <span className="text-xs font-medium mr-2 leading-none">{paramType.name}</span>}
        <span className="block text-xs font-extralight leading-none">{paramType.type}</span>
      </div>
      {renderInput()}
    </div>
  );
};

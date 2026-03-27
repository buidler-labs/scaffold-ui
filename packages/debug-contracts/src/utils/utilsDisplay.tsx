import { ReactElement, useState } from "react";
import { TransactionBase, TransactionReceipt, formatEther, formatUnits, isAddress, isHex } from "viem";
import { Address } from "@scaffold-ui/components";
import { Tooltip } from "../components/Tooltip";
import { useContractConfig } from "../contexts/ContractConfigContext";

// To be used in JSON.stringify when a field might be bigint
// https://wagmi.sh/react/faq#bigint-serialization
export const replacer = (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

type DisplayContent =
  | string
  | number
  | bigint
  | Record<string, any>
  | TransactionBase
  | TransactionReceipt
  | undefined
  | unknown;

type ResultFontSize = "sm" | "base" | "xs" | "lg" | "xl" | "2xl" | "3xl";

const AddressWithConfig = ({ address, size }: { address: string; size: ResultFontSize }) => {
  const { chain, blockExplorerAddressLink } = useContractConfig();
  return (
    <Address
      address={address as `0x${string}`}
      size={size}
      chain={chain}
      blockExplorerAddressLink={blockExplorerAddressLink}
    />
  );
};

export const displayTxResult = (
  displayContent: DisplayContent | DisplayContent[],
  fontSize: ResultFontSize = "base",
): string | ReactElement | number => {
  if (displayContent == null) {
    return "";
  }

  if (typeof displayContent === "bigint") {
    return <NumberDisplay value={displayContent} />;
  }

  if (typeof displayContent === "string") {
    if (isAddress(displayContent)) {
      return (
        <AddressWithConfig
          address={displayContent}
          size={fontSize}
        />
      );
    }

    if (isHex(displayContent)) {
      return displayContent; // don't add quotes
    }

    return displayContent; // plain string (e.g. ERC20 name/symbol)
  }

  if (Array.isArray(displayContent)) {
    return (
      <ArrayDisplay
        values={displayContent}
        size={fontSize}
      />
    );
  }

  if (typeof displayContent === "object") {
    return (
      <StructDisplay
        struct={displayContent}
        size={fontSize}
      />
    );
  }

  return JSON.stringify(displayContent, replacer, 2);
};

type BigIntDisplayMode = "raw" | "e8" | "e18";

const NumberDisplay = ({ value }: { value: bigint }) => {
  const [mode, setMode] = useState<BigIntDisplayMode>("raw");

  const asNumber = Number(value);
  if (asNumber <= Number.MAX_SAFE_INTEGER && asNumber >= Number.MIN_SAFE_INTEGER) {
    return String(value);
  }

  const displayText = mode === "raw" ? value.toString() : mode === "e8" ? formatUnits(value, 8) : formatEther(value);

  const segments: { mode: BigIntDisplayMode; label: string; tooltip: string }[] = [
    { mode: "raw", label: "Raw", tooltip: "Raw Format" },
    { mode: "e8", label: "8", tooltip: "8 Decimals" },
    { mode: "e18", label: "18", tooltip: "18 Decimals" },
  ];

  return (
    <div className="flex min-w-0 flex-col gap-1.5 font-sans">
      <div className="min-w-0 w-full overflow-x-auto overscroll-x-contain py-0.5 [scrollbar-width:thin]">
        <span className="inline-block whitespace-nowrap tabular-nums text-sui-primary-content">{displayText}</span>
      </div>
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-sui-primary-content/40">
          Format
        </span>
        <div
          className="inline-flex shrink-0 gap-1"
          role="group"
          aria-label="Number format"
        >
          {segments.map(({ mode: m, label, tooltip }) => {
            const active = mode === m;
            return (
              <Tooltip
                key={m}
                content={tooltip}
                position="bottom"
              >
                <button
                  type="button"
                  className={[
                    "min-w-[2.75rem] rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                    active
                      ? "bg-sui-primary/40 text-sui-primary-content"
                      : "cursor-pointer bg-sui-primary-content/[0.06] text-sui-primary-content/60 hover:bg-sui-primary-content/[0.12] hover:text-sui-primary-content",
                  ].join(" ")}
                  aria-pressed={active}
                  onClick={() => setMode(m)}
                >
                  {label}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ObjectFieldDisplay = ({
  name,
  value,
  size,
  leftPad = true,
}: {
  name: string;
  value: DisplayContent;
  size: ResultFontSize;
  leftPad?: boolean;
}) => {
  return (
    <div className={`flex min-w-0 flex-row items-baseline ${leftPad ? "ml-4" : ""}`}>
      <span className="shrink-0 text-sui-primary-content/60 mr-2">{name}:</span>
      <span className="min-w-0 flex-1 text-sui-primary-content">{displayTxResult(value, size)}</span>
    </div>
  );
};

const ArrayDisplay = ({ values, size }: { values: DisplayContent[]; size: ResultFontSize }) => {
  return (
    <div className="flex flex-col gap-y-1">
      {values.length ? "array" : "[]"}
      {values.map((v, i) => (
        <ObjectFieldDisplay
          key={i}
          name={`[${i}]`}
          value={v}
          size={size}
        />
      ))}
    </div>
  );
};

const StructDisplay = ({ struct, size }: { struct: Record<string, any>; size: ResultFontSize }) => {
  return (
    <div className="flex flex-col gap-y-1">
      struct
      {Object.entries(struct).map(([k, v]) => (
        <ObjectFieldDisplay
          key={k}
          name={k}
          value={v}
          size={size}
        />
      ))}
    </div>
  );
};

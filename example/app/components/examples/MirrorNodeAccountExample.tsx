"use client";

import { useMirrorNodeAccount } from "@scaffold-ui/hooks";
import { ExampleCard } from "../ExampleCard";
import { MIRROR_NODE_DEMO_ACCOUNT_ID } from "./demoConstants";

export function MirrorNodeAccountExample() {
  return (
    <ExampleCard
      maxWidth="wide"
      title="useMirrorNodeAccount"
      description="Single mirror-node snapshot for account id, EVM address, balance, and signing capability."
      padding="comfortable"
    >
      <MirrorNodeAccountDemo accountId={MIRROR_NODE_DEMO_ACCOUNT_ID} />
    </ExampleCard>
  );
}

function MirrorNodeAccountDemo({ accountId }: { accountId: string }) {
  const { data, isLoading, isError, refetch } = useMirrorNodeAccount(accountId, {
    network: "testnet",
  });

  if (isLoading) {
    return <div className="text-sm text-base-content/70">Loading mirror account…</div>;
  }
  if (isError || !data) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-error m-0">Failed to load account (or not found).</p>
        <button
          type="button"
          className="btn btn-sm btn-outline w-fit"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const hbar = Number(data.balance) / 1e8;
  return (
    <div className="flex flex-col gap-2 text-sm w-full max-w-lg">
      <div>
        <span className="text-base-content/60">Account ID:</span> {data.accountId}
      </div>
      <div>
        <span className="text-base-content/60">EVM address:</span> {data.evmAddress ?? "—"}
      </div>
      <div>
        <span className="text-base-content/60">Key type:</span> {data.keyType}
      </div>
      <div>
        <span className="text-base-content/60">Balance:</span> {hbar.toFixed(4)} HBAR (tinybars:{" "}
        {data.balance.toString()})
      </div>
      <div>
        <span className="text-base-content/60">canSignEVM:</span> {data.canSignEVM ? "Yes" : "No"}
      </div>
      <button
        type="button"
        className="btn btn-sm btn-outline w-fit mt-1"
        onClick={() => refetch()}
      >
        Refetch
      </button>
    </div>
  );
}

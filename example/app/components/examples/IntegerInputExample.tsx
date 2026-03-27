"use client";

import { useState } from "react";
import { IntegerInput } from "@scaffold-ui/debug-contracts";
import { ExampleCard } from "../ExampleCard";

export function IntegerInputExample() {
  const [integerValue, setIntegerValue] = useState("");

  return (
    <ExampleCard
      maxWidth="wide"
      title="IntegerInput (debug-contracts)"
      description="Integer entry with ×1e8 (tinybars) or ×1e18 (wei) multipliers for contract args."
      padding="comfortable"
    >
      <div className="flex w-full max-w-lg flex-col gap-4">
        <IntegerInput
          value={integerValue}
          onChange={setIntegerValue}
          placeholder="0"
        />
      </div>
    </ExampleCard>
  );
}

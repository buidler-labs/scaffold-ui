"use client";

import React, { useState } from "react";
import type { Address } from "viem";
import { HederaAddressInput } from "@scaffold-ui/components";
import type { CSSProperties } from "react";

interface HederaAddressInputExampleProps {
  initialValue?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: CSSProperties;
  chainId?: number;
}

export const HederaAddressInputExample = ({
  initialValue = "",
  placeholder,
  disabled,
  style,
  chainId = 296,
}: HederaAddressInputExampleProps) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (addr: Address) => {
    setValue(addr);
  };

  return (
    <HederaAddressInput
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      style={style}
      chainId={chainId}
    />
  );
};

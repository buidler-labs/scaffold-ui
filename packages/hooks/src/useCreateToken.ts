import { AccountId, TokenCreateTransaction, TokenSupplyType, TokenType } from "@hiero-ledger/sdk";
import { useMutation } from "@tanstack/react-query";
import { useNativeTransaction } from "./useNativeTransaction";

export type CreateTokenParams = { name: string; symbol: string; initialSupply?: string };

export type CreateTokenResult = {
  transactionId: string;
  symbol: string;
  name: string;
  initialSupply: number;
  treasuryAccountId: string;
};

export type UseCreateTokenOptions = {
  /** Return treasury account id (e.g. connected account); throw if not available. */
  getTreasuryAccountId: () => string;
};

const TOKEN_SYMBOL_REGEX = /^[A-Z0-9]{1,10}$/;

export function useCreateToken(options: UseCreateTokenOptions) {
  const { sendTransaction } = useNativeTransaction();
  const { getTreasuryAccountId } = options;

  return useMutation({
    mutationFn: async ({ name, symbol, initialSupply = "0" }: CreateTokenParams): Promise<CreateTokenResult> => {
      const treasuryAccountId = getTreasuryAccountId();

      const normalizedName = name.trim();
      const normalizedSymbol = symbol.trim().toUpperCase();
      if (!normalizedName || !normalizedSymbol) throw new Error("name and symbol are required");
      if (normalizedName.length > 100) throw new Error("name must be ≤ 100 characters");
      if (!TOKEN_SYMBOL_REGEX.test(normalizedSymbol)) throw new Error("symbol must be 1-10 uppercase letters/numbers");

      const parsedSupply = Number(initialSupply);
      if (!Number.isFinite(parsedSupply) || !Number.isInteger(parsedSupply) || parsedSupply < 0) {
        throw new Error("initialSupply must be a non-negative integer");
      }

      const tx = new TokenCreateTransaction()
        .setTokenName(normalizedName)
        .setTokenSymbol(normalizedSymbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(0)
        .setInitialSupply(parsedSupply)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(AccountId.fromString(treasuryAccountId));

      const result = await sendTransaction(tx);
      if (!result?.transactionId) throw new Error("No transactionId returned from wallet");
      return {
        transactionId: result.transactionId,
        symbol: normalizedSymbol,
        name: normalizedName,
        initialSupply: parsedSupply,
        treasuryAccountId,
      };
    },
  });
}

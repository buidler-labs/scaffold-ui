/** Partial shape of Hedera mirror node `GET /api/v1/accounts/{id}` JSON */
export type MirrorNodeAccountJson = {
  account?: string;
  evm_address?: string | null;
  alias?: string;
  key?: { _type?: string } | null;
  balance?: { balance?: number };
};

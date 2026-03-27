export const MIRROR_BASE_URLS: Record<string, string> = {
  testnet: process.env.HEDERA_MIRROR_TESTNET_URL ?? "https://testnet.mirrornode.hedera.com",
  mainnet: process.env.HEDERA_MIRROR_MAINNET_URL ?? "https://mainnet.mirrornode.hedera.com",
};

export const EVM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
export const NATIVE_ACCOUNT_ID_RE = /^\d+\.\d+\.\d+$/;

/** Next `fetch` revalidate for EVM ↔ account ID lookups */
export const REVALIDATE_ACCOUNT_LOOKUP_SEC = 60;
/** Next `fetch` revalidate for full mirror account payload */
export const REVALIDATE_FULL_ACCOUNT_SEC = 30;

export const API_LOG_PREFIX = "[api/hedera]";

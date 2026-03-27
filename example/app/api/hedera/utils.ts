import { MIRROR_BASE_URLS } from "./constants";

export function mirrorBaseUrl(network: string): string {
  return MIRROR_BASE_URLS[network] ?? MIRROR_BASE_URLS.testnet;
}

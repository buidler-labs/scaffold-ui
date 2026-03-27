import { NextResponse } from "next/server";
import {
  API_LOG_PREFIX,
  EVM_ADDRESS_RE,
  NATIVE_ACCOUNT_ID_RE,
  REVALIDATE_ACCOUNT_LOOKUP_SEC,
  REVALIDATE_FULL_ACCOUNT_SEC,
} from "./constants";
import type { MirrorNodeAccountJson } from "./types";

export async function handleEvmToAccountId(base: string, evm: string): Promise<NextResponse> {
  if (!EVM_ADDRESS_RE.test(evm)) {
    return NextResponse.json({ error: "Missing or invalid EVM address" }, { status: 400 });
  }

  const url = `${base}/api/v1/accounts/${evm}`;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_ACCOUNT_LOOKUP_SEC } });
    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ accountId: null });
      }
      return NextResponse.json({ error: "Mirror node request failed", status: res.status }, { status: 502 });
    }
    const data = (await res.json()) as { account?: string };
    const accountId = typeof data.account === "string" ? data.account : null;
    return NextResponse.json({ accountId });
  } catch (e) {
    console.error(API_LOG_PREFIX, e);
    return NextResponse.json({ error: "Resolution failed" }, { status: 502 });
  }
}

export async function handleAccountIdToEvm(base: string, accountId: string): Promise<NextResponse> {
  if (!NATIVE_ACCOUNT_ID_RE.test(accountId)) {
    return NextResponse.json({ error: "Missing or invalid Hedera account ID (expected 0.0.12345)" }, { status: 400 });
  }

  const url = `${base}/api/v1/accounts/${accountId}`;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_ACCOUNT_LOOKUP_SEC } });
    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "Account not found on Hedera" }, { status: 404 });
      }
      return NextResponse.json({ error: "Mirror node request failed", status: res.status }, { status: 502 });
    }
    const data = (await res.json()) as { evm_address?: string; alias?: string };
    const evmAddress =
      typeof data.evm_address === "string"
        ? data.evm_address
        : typeof data.alias === "string" && data.alias.startsWith("0x")
          ? data.alias
          : null;
    return NextResponse.json({ evmAddress });
  } catch (e) {
    console.error(API_LOG_PREFIX, e);
    return NextResponse.json({ error: "Resolution failed" }, { status: 502 });
  }
}

export async function handleMirrorAccountFull(base: string, input: string): Promise<NextResponse> {
  const trimmed = input.trim();
  const isEvm = EVM_ADDRESS_RE.test(trimmed);
  const isNative = NATIVE_ACCOUNT_ID_RE.test(trimmed);
  if (!isEvm && !isNative) {
    return NextResponse.json(
      { error: "Invalid input: expected 0x... (EVM) or 0.0.12345 (account ID)" },
      { status: 400 },
    );
  }

  const url = `${base}/api/v1/accounts/${encodeURIComponent(trimmed)}?transactions=false`;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_FULL_ACCOUNT_SEC } });
    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }
      return NextResponse.json({ error: "Mirror node request failed", status: res.status }, { status: 502 });
    }
    const data = (await res.json()) as MirrorNodeAccountJson;
    const accountId = typeof data.account === "string" ? data.account : null;
    const evmAddress = typeof data.evm_address === "string" && data.evm_address.length > 0 ? data.evm_address : null;
    const keyTypeRaw = data.key?._type;
    const keyType = keyTypeRaw === "ECDSA_SECP256K1" ? "ECDSA_SECP256K1" : "ED25519";
    const balanceTinybars = typeof data.balance?.balance === "number" ? data.balance.balance : 0;
    if (!accountId) {
      return NextResponse.json({ error: "Invalid mirror response" }, { status: 502 });
    }
    return NextResponse.json({
      accountId,
      evmAddress,
      keyType,
      balance: String(balanceTinybars),
    });
  } catch (e) {
    console.error(API_LOG_PREFIX, e);
    return NextResponse.json({ error: "Resolution failed" }, { status: 502 });
  }
}

import { NextResponse } from "next/server";

const MIRROR_BASE: Record<string, string> = {
  testnet: process.env.HEDERA_MIRROR_TESTNET_URL ?? "https://testnet.mirrornode.hedera.com",
  mainnet: process.env.HEDERA_MIRROR_MAINNET_URL ?? "https://mainnet.mirrornode.hedera.com",
};

const EVM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;
const NATIVE_ACCOUNT_ID_REGEX = /^\d+\.\d+\.\d+$/;

type MirrorAccountResponse = {
  account?: string;
  evm_address?: string | null;
  key?: { _type?: string } | null;
  balance?: { balance?: number };
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get("input");
  const network = (searchParams.get("network") ?? "testnet").toLowerCase();

  if (!input || typeof input !== "string") {
    return NextResponse.json({ error: "Missing input (EVM address or account ID)" }, { status: 400 });
  }

  const trimmed = input.trim();
  const isEvm = EVM_ADDRESS_RE.test(trimmed);
  const isNative = NATIVE_ACCOUNT_ID_REGEX.test(trimmed);

  if (!isEvm && !isNative) {
    return NextResponse.json(
      { error: "Invalid input: expected 0x... (EVM) or 0.0.12345 (account ID)" },
      { status: 400 },
    );
  }

  const base = MIRROR_BASE[network] ?? MIRROR_BASE.testnet;
  const url = `${base}/api/v1/accounts/${encodeURIComponent(trimmed)}?transactions=false`;

  try {
    const res = await fetch(url, { next: { revalidate: 30 } });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "Account not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Mirror node request failed", status: res.status },
        { status: 502 },
      );
    }

    const data = (await res.json()) as MirrorAccountResponse;

    const accountId =
      typeof data.account === "string" ? data.account : null;
    const evmAddress =
      typeof data.evm_address === "string" && data.evm_address.length > 0
        ? data.evm_address
        : null;

    const keyTypeRaw = data.key?._type;
    const keyType =
      keyTypeRaw === "ECDSA_SECP256K1" ? "ECDSA_SECP256K1" : "ED25519";

    const balanceTinybars =
      typeof data.balance?.balance === "number" ? data.balance.balance : 0;

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
    console.error("[api/hedera/mirror-account]", e);
    return NextResponse.json({ error: "Resolution failed" }, { status: 502 });
  }
}

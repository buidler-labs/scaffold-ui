import { NextResponse } from "next/server";
import { handleAccountIdToEvm, handleEvmToAccountId, handleMirrorAccountFull } from "./handlers";
import { mirrorBaseUrl } from "./utils";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const network = (searchParams.get("network") ?? "testnet").toLowerCase();
  const base = mirrorBaseUrl(network);

  const inputRaw = searchParams.get("input");
  if (inputRaw !== null && inputRaw.trim() !== "") {
    return handleMirrorAccountFull(base, inputRaw);
  }

  const evm = searchParams.get("evm");
  if (evm !== null && evm !== "") {
    return handleEvmToAccountId(base, evm);
  }

  const accountId = searchParams.get("accountId");
  if (accountId !== null && accountId !== "") {
    return handleAccountIdToEvm(base, accountId);
  }

  return NextResponse.json(
    { error: "Missing query: provide input=, evm=, or accountId= (plus optional network=)" },
    { status: 400 },
  );
}

#!/usr/bin/env node
import { loadMetadata } from "../load-metadata.js";
import { createMcpServer } from "../server.js";
import { runHttp } from "../transports/http.js";
import { runStdio } from "../transports/stdio.js";

const args = process.argv.slice(2);

async function main(): Promise<void> {
  const metadata = loadMetadata();

  if (args.includes("--http")) {
    const port = Number(process.env.PORT ?? "3100");
    const host = process.env.HOST ?? "0.0.0.0";
    runHttp(() => createMcpServer(metadata), { port, host });
    return;
  }

  const server = createMcpServer(metadata);
  await runStdio(server);
}

void main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

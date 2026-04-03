# @scaffold-ui/mcp-server

Model Context Protocol (MCP) server that exposes **scaffold-ui** documentation, TypeScript props, hook signatures, and example app code so AI agents can answer with accurate imports and APIs.

## Features

- **Tools**: `search_components`, `search_hooks`, `get_component_props`, `get_hook_signature`, `get_component_example`, `get_hook_example`, `get_installation_guide`, `get_theming_guide`
- **Resources**: `scaffold-ui://` URIs for MDX docs, examples, and JSON API listings
- **Prompts**: `scaffold-ui/use-component`, `scaffold-ui/hedera-dapp-setup`
- **Transports**: stdio (default) for Cursor / Claude Desktop, or **Streamable HTTP** with `--http` for remote agents

## Build

From the monorepo root:

```bash
pnpm install
cd packages/mcp-server && pnpm build
```

This runs `extract` (generates `src/generated/metadata.json` from docs and sources) and compiles TypeScript.

## Usage

### stdio (local)

```json
{
  "mcpServers": {
    "scaffold-ui": {
      "command": "node",
      "args": ["/absolute/path/to/scaffold-ui/packages/mcp-server/dist/esm/bin/scaffold-ui-mcp.js"]
    }
  }
}
```

Or after publishing: `"command": "npx", "args": ["@scaffold-ui/mcp-server"]`

### HTTP (remote)

```bash
PORT=3100 node ./dist/esm/bin/scaffold-ui-mcp.js --http
```

Optional auth:

```bash
SCAFFOLD_UI_MCP_KEY=secret node ./dist/esm/bin/scaffold-ui-mcp.js --http
```

Clients must send `Authorization: Bearer <secret>`.

Connect with:

```json
{
  "mcpServers": {
    "scaffold-ui": {
      "url": "http://localhost:3100/mcp"
    }
  }
}
```

**Streamable HTTP** clients must send `Accept: application/json, text/event-stream` (MCP requirement). Example:

```bash
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'
```

## Docker

See [Dockerfile](./Dockerfile) in this package. Build from the **repository root** so the extract step can read `docs/` and `packages/`:

```bash
docker build -f packages/mcp-server/Dockerfile -t scaffold-ui-mcp .
```

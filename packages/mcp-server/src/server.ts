import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";
import type { ScaffoldUiMetadata } from "./types.js";

function templateParam(
  name: string | string[] | undefined,
): string | undefined {
  if (name === undefined) return undefined;
  return Array.isArray(name) ? name[0] : name;
}

export function createMcpServer(metadata: ScaffoldUiMetadata): McpServer {
  const server = new McpServer(
    {
      name: "scaffold-ui",
      version: "0.1.0",
      websiteUrl: "https://github.com/buidler-labs/scaffold-ui",
    },
    {},
  );

  const searchInCatalog = (
    query: string,
    items: Array<{ name: string; description: string }>,
    bodies: Record<string, { body: string }>,
  ) => {
    const q = query.toLowerCase();
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (bodies[c.name]?.body.toLowerCase().includes(q) ?? false),
    );
  };

  server.registerTool(
    "search_components",
    {
      title: "Search scaffold-ui components",
      description:
        "Search public @scaffold-ui/components by name or keyword (Address, Balance, Hedera, input, etc.).",
      inputSchema: {
        query: z.string().describe("Search term"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query }) => {
      const matches = searchInCatalog(
        query,
        metadata.catalog.components,
        metadata.components,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(matches, null, 2) }],
      };
    },
  );

  server.registerTool(
    "search_hooks",
    {
      title: "Search scaffold-ui hooks",
      description:
        "Search @scaffold-ui/hooks exports (useBalance, useMirrorNodeAccount, etc.).",
      inputSchema: { query: z.string().describe("Search term") },
      annotations: { readOnlyHint: true },
    },
    async ({ query }) => {
      const matches = searchInCatalog(
        query,
        metadata.catalog.hooks,
        metadata.hooks,
      );
      return {
        content: [{ type: "text", text: JSON.stringify(matches, null, 2) }],
      };
    },
  );

  server.registerTool(
    "get_component_props",
    {
      title: "Get component props (TypeScript)",
      description:
        "Return the exported props type for a component (Address, Balance, HederaAddress, BaseInput, HederaAddressInput, HbarInput).",
      inputSchema: {
        name: z
          .string()
          .describe(
            "Component name without suffix, e.g. Address, HederaAddressInput",
          ),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ name }) => {
      const props = metadata.componentProps[name];
      if (!props) {
        return {
          content: [
            {
              type: "text",
              text: `No props found for "${name}". Known: ${Object.keys(metadata.componentProps).join(", ")}`,
            },
          ],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: props }] };
    },
  );

  server.registerTool(
    "get_hook_signature",
    {
      title: "Get hook signature and JSDoc",
      description:
        "Return JSDoc and signature excerpt for a hook in @scaffold-ui/hooks.",
      inputSchema: { name: z.string().describe("Hook name, e.g. useBalance") },
      annotations: { readOnlyHint: true },
    },
    async ({ name }) => {
      const sig = metadata.hookSignatures[name];
      if (!sig) {
        return {
          content: [
            {
              type: "text",
              text: `No signature metadata for "${name}". Known hooks: ${Object.keys(metadata.hookSignatures).join(", ")}`,
            },
          ],
          isError: true,
        };
      }
      const text = [sig.jsdoc ? `${sig.jsdoc}\n\n` : "", sig.signature].join(
        "",
      );
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "get_component_example",
    {
      title: "Get example app code for a component",
      description:
        "Return TSX example from the scaffold-ui example app when available (e.g. AddressExample).",
      inputSchema: {
        name: z
          .string()
          .describe(
            "Example module name, often like AddressExample or HederaAddressExample",
          ),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ name }) => {
      const ex = metadata.examples[name];
      if (!ex) {
        return {
          content: [
            {
              type: "text",
              text: `No example named "${name}". Available: ${Object.keys(metadata.examples).join(", ")}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: `// ${ex.path}\n\n${ex.content}` }],
      };
    },
  );

  server.registerTool(
    "get_hook_example",
    {
      title: "Get hook documentation and usage",
      description:
        "Return MDX documentation body for a hook page from the official docs (usage patterns and code samples).",
      inputSchema: {
        name: z
          .string()
          .describe("Hook doc id, e.g. useBalance, useMirrorNodeAccount"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ name }) => {
      const doc = metadata.hooks[name];
      if (!doc) {
        return {
          content: [
            {
              type: "text",
              text: `No hook doc for "${name}". Known: ${Object.keys(metadata.hooks).join(", ")}`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: `# ${doc.title}\n\n${doc.body}` }],
      };
    },
  );

  server.registerTool(
    "get_installation_guide",
    {
      title: "Installation and peer dependencies",
      description:
        "Install commands, peer deps, and README excerpts for scaffold-ui packages.",
      inputSchema: {
        package: z
          .enum(["components", "hooks", "debug-contracts", "all"])
          .optional()
          .describe("Which package README to emphasize; default all"),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ package: pkg }) => {
      const parts: string[] = [metadata.installationSnippet];
      const readmes = metadata.packageReadmes;
      if (pkg === "components" || pkg === "all" || pkg === undefined) {
        parts.push(
          "\n\n## @scaffold-ui/components README\n\n",
          readmes["components"] ?? "",
        );
      }
      if (pkg === "hooks" || pkg === "all" || pkg === undefined) {
        parts.push(
          "\n\n## @scaffold-ui/hooks README\n\n",
          readmes["hooks"] ?? "",
        );
      }
      if (pkg === "debug-contracts" || pkg === "all" || pkg === undefined) {
        parts.push(
          "\n\n## @scaffold-ui/debug-contracts README\n\n",
          readmes["debug-contracts"] ?? "",
        );
      }
      return { content: [{ type: "text", text: parts.join("") }] };
    },
  );

  server.registerTool(
    "get_theming_guide",
    {
      title: "Theming (CSS variables)",
      description:
        "Official theming guide: --color-sui-*, --font-sui-family, and related tokens.",
      inputSchema: {
        section: z
          .string()
          .optional()
          .describe("Optional hint (ignored; full guide is returned)"),
      },
      annotations: { readOnlyHint: true },
    },
    async () => ({
      content: [
        {
          type: "text",
          text: metadata.themeDoc || "Theming documentation not available.",
        },
      ],
    }),
  );

  server.registerResource(
    "getting-started",
    "scaffold-ui://getting-started",
    {
      title: "Getting started",
      description: "Introduction, installation, and index content",
      mimeType: "text/markdown",
    },
    async () => ({
      contents: [
        {
          uri: "scaffold-ui://getting-started",
          mimeType: "text/markdown",
          text: `${metadata.gettingStarted}\n\n---\n\n${metadata.installationSnippet}`,
        },
      ],
    }),
  );

  server.registerResource(
    "api-components",
    "scaffold-ui://api/components",
    {
      title: "Components API listing",
      description: "Catalog and extracted props types",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "scaffold-ui://api/components",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              catalog: metadata.catalog.components,
              props: metadata.componentProps,
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "api-hooks",
    "scaffold-ui://api/hooks",
    {
      title: "Hooks API listing",
      description: "Catalog and hook signature metadata",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "scaffold-ui://api/hooks",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              catalog: metadata.catalog.hooks,
              signatures: metadata.hookSignatures,
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerResource(
    "component-doc",
    new ResourceTemplate("scaffold-ui://components/{name}", {
      list: undefined,
    }),
    {
      title: "Component documentation (MDX)",
      description: "Vocs documentation for a component page",
      mimeType: "text/markdown",
    },
    async (uri, vars) => {
      const name = templateParam(vars.name);
      if (!name) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: "Missing template parameter: name",
            },
          ],
        };
      }
      const doc = metadata.components[name];
      if (!doc) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: `Unknown component "${name}". Known: ${Object.keys(metadata.components).join(", ")}`,
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: `# ${doc.title}\n\n${doc.body}`,
          },
        ],
      };
    },
  );

  server.registerResource(
    "hook-doc",
    new ResourceTemplate("scaffold-ui://hooks/{name}", { list: undefined }),
    {
      title: "Hook documentation (MDX)",
      description: "Vocs documentation for a hook page",
      mimeType: "text/markdown",
    },
    async (uri, vars) => {
      const name = templateParam(vars.name);
      if (!name) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: "Missing template parameter: name",
            },
          ],
        };
      }
      const doc = metadata.hooks[name];
      if (!doc) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: `Unknown hook doc "${name}". Known: ${Object.keys(metadata.hooks).join(", ")}`,
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: `# ${doc.title}\n\n${doc.body}`,
          },
        ],
      };
    },
  );

  server.registerResource(
    "debug-contracts-doc",
    new ResourceTemplate("scaffold-ui://debug-contracts/{name}", {
      list: undefined,
    }),
    {
      title: "Debug contracts documentation",
      mimeType: "text/markdown",
    },
    async (uri, vars) => {
      const name = templateParam(vars.name);
      if (!name) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: "Missing template parameter: name",
            },
          ],
        };
      }
      const doc = metadata.debugContracts[name];
      if (!doc) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: `Unknown page "${name}". Known: ${Object.keys(metadata.debugContracts).join(", ")}`,
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/markdown",
            text: `# ${doc.title}\n\n${doc.body}`,
          },
        ],
      };
    },
  );

  server.registerResource(
    "example-code",
    new ResourceTemplate("scaffold-ui://examples/{name}", { list: undefined }),
    {
      title: "Example app TSX",
      mimeType: "text/typescript",
    },
    async (uri, vars) => {
      const name = templateParam(vars.name);
      if (!name) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: "Missing template parameter: name",
            },
          ],
        };
      }
      const ex = metadata.examples[name];
      if (!ex) {
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "text/plain",
              text: `Unknown example "${name}". Known: ${Object.keys(metadata.examples).join(", ")}`,
            },
          ],
        };
      }
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "text/typescript",
            text: `// ${ex.path}\n\n${ex.content}`,
          },
        ],
      };
    },
  );

  server.registerResource(
    "api-debug-contracts",
    "scaffold-ui://api/debug-contracts",
    {
      title: "Debug contracts props",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "scaffold-ui://api/debug-contracts",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              catalog: metadata.catalog.debugContracts,
              props: metadata.debugProps,
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.registerPrompt(
    "scaffold-ui/use-component",
    {
      title: "Use a scaffold-ui component",
      description:
        "Template for answering with correct imports, props, and Hedera/wagmi context.",
      argsSchema: {
        component: z
          .string()
          .describe("Component name, e.g. HederaAddress or Balance"),
        requirements: z.string().describe("User goals and constraints"),
      },
    },
    ({ component, requirements }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Help me use the scaffold-ui component "${component}" from @scaffold-ui/components.\n\nRequirements: ${requirements}\n\nUse scaffold-ui MCP tools (get_component_props, get_component_example, get_installation_guide) and official docs. Use viem Hedera chains (hedera, hederaTestnet). Components require @scaffold-ui/hooks.`,
          },
        },
      ],
    }),
  );

  server.registerPrompt(
    "scaffold-ui/hedera-dapp-setup",
    {
      title: "Hedera dApp setup with scaffold-ui",
      description:
        "High-level checklist for wagmi, styles, and Hedera-specific hooks.",
      argsSchema: {
        network: z
          .enum(["mainnet", "testnet", "local"])
          .optional()
          .describe("Target Hedera network"),
      },
    },
    ({ network }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Summarize how to set up a Hedera dApp with scaffold-ui (@scaffold-ui/components, @scaffold-ui/hooks), wagmi/viem, required CSS imports, and ${network ?? "testnet"} networking. Mention mirror node / resolver configuration when relevant.`,
          },
        },
      ],
    }),
  );

  return server;
}

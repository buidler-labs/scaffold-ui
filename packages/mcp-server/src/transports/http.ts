import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import cors from "cors";
import type { Request, Response } from "express";

export type HttpTransportOptions = {
  port: number;
  host?: string;
};

/**
 * Stateless Streamable HTTP transport (one MCP server instance per request).
 * Suitable for read-only documentation servers.
 */
export function runHttp(
  getServer: () => McpServer,
  options: HttpTransportOptions,
): void {
  const host = options.host ?? "0.0.0.0";
  const app = createMcpExpressApp({ host });

  app.use(cors());

  const apiKey = process.env.SCAFFOLD_UI_MCP_KEY;

  const authMiddleware = (req: Request, res: Response, next: () => void) => {
    if (!apiKey) {
      next();
      return;
    }
    const auth = req.headers.authorization;
    if (auth !== `Bearer ${apiKey}`) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Set Authorization: Bearer <SCAFFOLD_UI_MCP_KEY>",
      });
      return;
    }
    next();
  };

  app.post("/mcp", authMiddleware, async (req: Request, res: Response) => {
    const server = getServer();
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
    } catch (error) {
      console.error("scaffold-ui-mcp HTTP error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  app.get("/mcp", authMiddleware, async (_req: Request, res: Response) => {
    res
      .status(405)
      .set("Allow", "POST")
      .json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Method not allowed. Use POST for MCP.",
        },
        id: null,
      });
  });

  app.delete("/mcp", authMiddleware, async (_req: Request, res: Response) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed" },
      id: null,
    });
  });

  app.listen(options.port, host, (err?: Error) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.error(
      `scaffold-ui MCP (HTTP) listening on http://${host}:${options.port}/mcp`,
    );
  });
}

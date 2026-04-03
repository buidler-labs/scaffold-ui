/**
 * Build-time script: reads docs, examples, and TypeScript sources from the monorepo
 * and writes src/generated/metadata.json for the MCP server bundle.
 */
import {
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, "..");
const REPO_ROOT = join(PKG_ROOT, "..", "..");

function read(p) {
  return readFileSync(p, "utf8");
}

function readMdx(dir, name) {
  const path = join(dir, `${name}.mdx`);
  if (!existsSync(path)) return null;
  const raw = read(path);
  const { data, content } = matter(raw);
  return {
    title: data.title ?? name,
    body: content.trim(),
    path: path.replace(REPO_ROOT + "/", ""),
  };
}

function skipStringAndComments(content, i) {
  const c = content[i];
  if (c === "/" && content[i + 1] === "/") {
    while (i < content.length && content[i] !== "\n") i++;
    return i;
  }
  if (c === "/" && content[i + 1] === "*") {
    i += 2;
    while (
      i < content.length - 1 &&
      !(content[i] === "*" && content[i + 1] === "/")
    )
      i++;
    return i + 2;
  }
  if (c === '"' || c === "'" || c === "`") {
    const q = c;
    i++;
    while (i < content.length) {
      if (content[i] === "\\") {
        i += 2;
        continue;
      }
      if (content[i] === q) break;
      i++;
    }
    return i + 1;
  }
  return i;
}

/** Parses `export type Name = ...;` including generics and object types. */
function extractTypeAlias(content, name) {
  const prefix = `export type ${name}`;
  const start = content.indexOf(prefix);
  if (start === -1) return extractInterface(content, name);
  const eq = content.indexOf("=", start);
  if (eq === -1) return null;
  let i = eq + 1;
  while (/\s/.test(content[i])) i++;
  let angle = 0;
  let brace = 0;
  let paren = 0;
  while (i < content.length) {
    const next = skipStringAndComments(content, i);
    if (next > i) {
      i = next;
      continue;
    }
    const c = content[i];
    if (c === "<") angle++;
    else if (c === ">") angle--;
    else if (c === "{") brace++;
    else if (c === "}") brace--;
    else if (c === "(") paren++;
    else if (c === ")") paren--;
    if (c === ";" && angle === 0 && brace === 0 && paren === 0) {
      return content.slice(start, i + 1).trim();
    }
    i++;
  }
  return null;
}

function extractInterface(content, name) {
  const prefix = `export interface ${name}`;
  const start = content.indexOf(prefix);
  if (start === -1) return null;
  let i = start + prefix.length;
  while (/\s/.test(content[i])) i++;
  if (content[i] !== "{") return null;
  let depth = 0;
  for (; i < content.length; i++) {
    const c = content[i];
    if (c === "{") depth++;
    if (c === "}") {
      depth--;
      if (depth === 0) {
        return content.slice(start, i + 1).trim();
      }
    }
  }
  return null;
}

function extractHookHeader(content, hookName) {
  const patterns = [
    new RegExp(
      `(/\\*\\*[\\s\\S]*?\\*/)\\s*export function ${hookName}\\s*\\(`,
      "m",
    ),
    new RegExp(`(/\\*\\*[\\s\\S]*?\\*/)\\s*export const ${hookName}\\s*=`, "m"),
  ];
  for (const re of patterns) {
    const m = content.match(re);
    if (m) {
      const jsdoc = m[1]?.trim() ?? "";
      const sigStart = content.indexOf(m[0]) + m[0].length;
      const rest = content.slice(sigStart, sigStart + 800);
      const lineEnd = rest.indexOf("{");
      const sig = rest.slice(0, lineEnd > -1 ? lineEnd : 200).trim();
      return { jsdoc, signature: `${hookName}(${sig}) { ... }` };
    }
  }
  const fn = new RegExp(
    `export (?:function|const) ${hookName}[\\s\\S]{0,1200}?\\{`,
    "m",
  );
  const m2 = content.match(fn);
  return {
    jsdoc: "",
    signature: m2
      ? m2[0].replace(/\{$/, "").trim() + " { ... }"
      : `${hookName}(...)`,
  };
}

const COMPONENT_PROP_SOURCES = {
  Address: "packages/components/src/Address/Address.tsx",
  Balance: "packages/components/src/Balance.tsx",
  HederaAddress: "packages/components/src/HederaAddress/HederaAddress.tsx",
  BaseInput: "packages/components/src/Input/BaseInput.tsx",
  HederaAddressInput: "packages/components/src/Input/HederaAddressInput.tsx",
  HbarInput: "packages/components/src/Input/HbarInput.tsx",
};

const DEBUG_PROP_SOURCES = {
  Contract: "packages/debug-contracts/src/Contract.tsx",
  IntegerInput:
    "packages/debug-contracts/src/components/inputs/IntegerInput.tsx",
  BytesInput: "packages/debug-contracts/src/components/inputs/BytesInput.tsx",
  Bytes32Input:
    "packages/debug-contracts/src/components/inputs/Bytes32Input.tsx",
  DecimalMultiplierButtons:
    "packages/debug-contracts/src/components/inputs/DecimalMultiplierButtons.tsx",
};

const HOOK_SOURCES = {
  useAddress: "packages/hooks/src/useAddress.ts",
  useBalance: "packages/hooks/src/balance/useBalance.ts",
  useWatchBalance: "packages/hooks/src/balance/useWatchBalance.ts",
  useFetchNativeCurrencyPrice:
    "packages/hooks/src/useFetchNativeCurrencyPrice.ts",
  useFetchHbarPrice: "packages/hooks/src/useFetchHbarPrice.ts",
  useHederaAccountId: "packages/hooks/src/useHederaAccountId.ts",
  useHederaEvmAddress: "packages/hooks/src/useHederaEvmAddress.ts",
  useMirrorNodeAccount: "packages/hooks/src/useMirrorNodeAccount.ts",
  useHederaAddressInput: "packages/hooks/src/useHederaAddressInput.ts",
  useHbarInput: "packages/hooks/src/useHbarInput.ts",
  useNativeTransaction: "packages/hooks/src/useNativeTransaction.ts",
  useCreateTopic: "packages/hooks/src/useCreateTopic.ts",
  useCreateToken: "packages/hooks/src/useCreateToken.ts",
};

const PROP_TYPE_NAMES = {
  Address: "AddressProps",
  Balance: "BalanceProps",
  HederaAddress: "HederaAddressProps",
  BaseInput: "BaseInputProps",
  HederaAddressInput: "HederaAddressInputProps",
  HbarInput: "HbarInputProps",
  Contract: "ContractProps",
  IntegerInput: "IntegerInputProps",
  BytesInput: "BytesInputProps",
  Bytes32Input: "Bytes32InputProps",
  DecimalMultiplierButtons: "DecimalMultiplierButtonsProps",
};

function listMdxBasenames(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function main() {
  const componentsDir = join(REPO_ROOT, "docs/pages/components");
  const hooksDir = join(REPO_ROOT, "docs/pages/hooks");
  const debugDir = join(REPO_ROOT, "docs/pages/debug-contracts");
  const examplesDir = join(REPO_ROOT, "example/app/components/examples");
  const indexPage = join(REPO_ROOT, "docs/pages/index.mdx");

  const components = {};
  for (const base of listMdxBasenames(componentsDir)) {
    const doc = readMdx(componentsDir, base);
    if (doc) components[base] = doc;
  }

  const hooks = {};
  for (const base of listMdxBasenames(hooksDir)) {
    if (base === "index") continue;
    const doc = readMdx(hooksDir, base);
    if (doc) hooks[base] = doc;
  }

  const debugContracts = {};
  for (const base of listMdxBasenames(debugDir)) {
    const doc = readMdx(debugDir, base);
    if (doc) debugContracts[base] = doc;
  }

  const examples = {};
  if (existsSync(examplesDir)) {
    for (const f of readdirSync(examplesDir)) {
      if (!f.endsWith(".tsx")) continue;
      if (f === "index.ts") continue;
      const base = f.replace(/\.tsx$/, "");
      const p = join(examplesDir, f);
      examples[base] = {
        content: read(p),
        path: p.replace(REPO_ROOT + "/", ""),
      };
    }
  }

  let gettingStarted = "";
  if (existsSync(indexPage)) {
    const { content } = matter(read(indexPage));
    gettingStarted = content.trim();
  }

  const packageReadmes = {
    components: read(join(REPO_ROOT, "packages/components/README.md")),
    hooks: read(join(REPO_ROOT, "packages/hooks/README.md")),
    debugContracts: read(join(REPO_ROOT, "packages/debug-contracts/README.md")),
  };

  const componentProps = {};
  for (const [comp, rel] of Object.entries(COMPONENT_PROP_SOURCES)) {
    const full = join(REPO_ROOT, rel);
    const propName = PROP_TYPE_NAMES[comp];
    if (!propName) continue;
    const src = read(full);
    const block = extractTypeAlias(src, propName);
    if (block) componentProps[comp] = block;
  }

  const debugProps = {};
  for (const [comp, rel] of Object.entries(DEBUG_PROP_SOURCES)) {
    const full = join(REPO_ROOT, rel);
    const propName = PROP_TYPE_NAMES[comp];
    if (!propName) continue;
    const src = read(full);
    const block = extractTypeAlias(src, propName);
    if (block) debugProps[comp] = block;
  }

  const hookSignatures = {};
  for (const [hook, rel] of Object.entries(HOOK_SOURCES)) {
    const full = join(REPO_ROOT, rel);
    const src = read(full);
    hookSignatures[hook] = extractHookHeader(src, hook);
  }

  if (!debugProps.IntegerInput) {
    debugProps.IntegerInput = `type IntegerInputProps = CommonInputProps<string> & {\n  variant?: IntegerVariant;\n};`;
  }
  if (!debugProps.BytesInput) {
    debugProps.BytesInput = `Props: CommonInputProps<string> (same as BaseInput for string values).`;
  }
  if (!debugProps.Bytes32Input) {
    debugProps.Bytes32Input = `Props: CommonInputProps<string> (32-byte hex / string toggle via suffix).`;
  }

  const themePath = join(REPO_ROOT, "docs/pages/components/Theming.mdx");
  const themeDoc = existsSync(themePath)
    ? matter(read(themePath)).content.trim()
    : "";

  const installationSnippet = [
    "## Packages",
    "",
    "- `@scaffold-ui/components` — UI components",
    "- `@scaffold-ui/hooks` — React hooks (required peer of components)",
    "- `@scaffold-ui/debug-contracts` — Contract debug UI",
    "",
    "### Install",
    "",
    "```bash",
    "pnpm add @scaffold-ui/components @scaffold-ui/hooks",
    "# optional:",
    "pnpm add @scaffold-ui/debug-contracts",
    "```",
    "",
    peerDepsSection(),
    "",
    "### Package READMEs (summary)",
    "",
    packageReadmes.components.slice(0, 2000),
  ].join("\n");

  function peerDepsSection() {
    return [
      "### Peer dependencies",
      "",
      "React 19, `viem`, `wagmi`, `@tanstack/react-query`, `@types/react`.",
      "For Hedera native transaction hooks: `@hiero-ledger/sdk`.",
      "Import styles once at app root:",
      "",
      "```ts",
      'import "@scaffold-ui/components/styles.css";',
      'import "@scaffold-ui/debug-contracts/styles.css"; // if using debug UI',
      "```",
    ].join("\n");
  }

  const catalog = {
    components: Object.keys(components).map((name) => ({
      name,
      description: firstLine(components[name].body),
    })),
    hooks: Object.keys(hooks).map((name) => ({
      name,
      description: firstLine(hooks[name].body),
    })),
    debugContracts: Object.keys(debugContracts).map((name) => ({
      name,
      description: firstLine(debugContracts[name].body),
    })),
  };

  const outDir = join(PKG_ROOT, "src/generated");
  mkdirSync(outDir, { recursive: true });

  const metadata = {
    version: 1,
    generatedAt: new Date().toISOString(),
    components,
    hooks,
    debugContracts,
    examples,
    gettingStarted,
    packageReadmes,
    installationSnippet,
    themeDoc,
    componentProps,
    debugProps,
    hookSignatures,
    catalog,
  };

  writeFileSync(
    join(outDir, "metadata.json"),
    JSON.stringify(metadata, null, 2),
    "utf8",
  );
  console.log(
    "Wrote metadata.json with",
    Object.keys(metadata.components).length,
    "components,",
    Object.keys(metadata.hooks).length,
    "hooks",
  );
}

function firstLine(md) {
  const line = md
    .split("\n")
    .find((l) => l.trim().length > 0 && !l.trim().startsWith("#"));
  return line ? line.replace(/^[*-]\s*/, "").slice(0, 200) : "";
}

main();

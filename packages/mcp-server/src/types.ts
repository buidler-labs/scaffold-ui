export type MdxDoc = {
  title: string;
  body: string;
  path: string;
};

export type ExampleEntry = {
  content: string;
  path: string;
};

export type HookSignature = {
  jsdoc: string;
  signature: string;
};

export type ScaffoldUiMetadata = {
  version: number;
  generatedAt: string;
  components: Record<string, MdxDoc>;
  hooks: Record<string, MdxDoc>;
  debugContracts: Record<string, MdxDoc>;
  examples: Record<string, ExampleEntry>;
  gettingStarted: string;
  packageReadmes: Record<string, string>;
  installationSnippet: string;
  themeDoc: string;
  componentProps: Record<string, string>;
  debugProps: Record<string, string>;
  hookSignatures: Record<string, HookSignature>;
  catalog: {
    components: Array<{ name: string; description: string }>;
    hooks: Array<{ name: string; description: string }>;
    debugContracts: Array<{ name: string; description: string }>;
  };
};

import { defineConfig } from "vocs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Project repo (used for GitHub and Examples links in nav). */
const GITHUB_REPO = "https://github.com/buidler-labs/scaffold-ui";

export default defineConfig({
  rootDir: ".",
  title: "Scaffold UI",
  description: "React components and hooks for Hedera dApps",
  vite: {
    envDir: __dirname,
    envPrefix: "VITE_",
  },
  sidebar: [
    {
      text: "Getting Started",
      items: [{ text: "Introduction", link: "/" }],
    },
    {
      text: "Components",
      items: [
        { text: "Installation", link: "/components" },
        {
          text: "Hedera Native",
          collapsed: false,
          items: [
            { text: "HederaAddress", link: "/components/HederaAddress" },
            { text: "HederaAddressInput", link: "/components/HederaAddressInput" },
            { text: "HbarInput", link: "/components/HbarInput" },
          ],
        },
        {
          text: "Hedera EVM Compatible",
          collapsed: false,
          items: [
            { text: "Address", link: "/components/Address" },
            { text: "Balance", link: "/components/Balance" },
            { text: "BaseInput", link: "/components/BaseInput" },
            { text: "Styling", link: "/components/Styling" },
            { text: "Theming", link: "/components/Theming" },
          ],
        },
      ],
    },
    {
      text: "Hooks",
      items: [
        { text: "Installation", link: "/hooks" },
        {
          text: "Hedera Native",
          collapsed: false,
          items: [
            { text: "useMirrorNodeAccount", link: "/hooks/useMirrorNodeAccount" },
            { text: "useNativeTransaction", link: "/hooks/useNativeTransaction" },
            { text: "useHbarInput", link: "/hooks/useHbarInput" },
            { text: "useHederaAddressInput", link: "/hooks/useHederaAddressInput" },
            { text: "useHederaAccountId", link: "/hooks/useHederaAccountId" },
            { text: "useHederaEvmAddress", link: "/hooks/useHederaEvmAddress" },
          ],
        },
        {
          text: "Hedera EVM Compatible",
          collapsed: false,
          items: [
            { text: "useAddress", link: "/hooks/useAddress" },
            { text: "useBalance", link: "/hooks/useBalance" },
          ],
        },
      ],
    },
    {
      text: "Debug Contracts",
      items: [
        { text: "Contract", link: "/debug-contracts/Contract" },
        { text: "IntegerInput", link: "/debug-contracts/IntegerInput" },
      ],
    },
  ],
  topNav: [
    { text: "Components", link: "/components/Address" },
    { text: "Hooks", link: "/hooks/useAddress" },
    { text: "Debug Contracts", link: "/debug-contracts/Contract" },
    {
      text: "Examples",
      link: `${GITHUB_REPO}/tree/main/example`,
    },
    { text: "GitHub", link: GITHUB_REPO },
  ],
  theme: {
    // Align with example/app globals.css (daisy light / dark — Hedera palette)
    accentColor: {
      light: "#4f46e5",
      dark: "#8259ef",
    },
    variables: {
      fontFamily: {
        default: '"Styrene A Web", "Montserrat", ui-sans-serif, system-ui, sans-serif',
        mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
      },
      color: {
        background: { light: "#f7f7f8", dark: "#11151d" },
        background2: { light: "#ffffff", dark: "#181c27" },
        background3: { light: "#e8e8ec", dark: "#0a0d14" },
        text: { light: "#11151d", dark: "#f0f0f2" },
        text2: { light: "#4b5563", dark: "#9b9b9d" },
        text3: { light: "#6b7280", dark: "#9b9b9d" },
        border: { light: "#e8e8ec", dark: "#2a3040" },
        border2: { light: "#e8e8ec", dark: "#2a3040" },
        link: { light: "#2d84eb", dark: "#2d84eb" },
        linkHover: { light: "#0031ff", dark: "#5ba3f0" },
        heading: { light: "#11151d", dark: "#f0f0f2" },
        codeBlockBackground: { light: "#f0f0f2", dark: "#0a0d14" },
        codeInlineBackground: { light: "#e8e8ec", dark: "#181c27" },
        codeInlineBorder: { light: "#e8e8ec", dark: "#2a3040" },
      },
    },
  },
});

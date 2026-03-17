import { defineConfig } from "vocs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Project repo (used for GitHub and Examples links in nav). */
const GITHUB_REPO = "https://github.com/buidler-labs/scaffold-ui";

export default defineConfig({
  rootDir: ".",
  title: "Scaffold UI",
  description: "React components and hooks for Ethereum dApps",
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
            { text: "AddressInput", link: "/components/AddressInput" },
            { text: "EtherInput", link: "/components/EtherInput" },
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
            { text: "useHbarInput", link: "/hooks/useHbarInput" },
          ],
        },
        {
          text: "Hedera EVM Compatible",
          collapsed: false,
          items: [
            { text: "useAddress", link: "/hooks/useAddress" },
            { text: "useAddressInput", link: "/hooks/useAddressInput" },
            { text: "useBalance", link: "/hooks/useBalance" },
            { text: "useEtherInput", link: "/hooks/useEtherInput" },
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
    accentColor: "#007ACC",
  },
});

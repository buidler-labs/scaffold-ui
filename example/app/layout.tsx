import type { Metadata } from "next";
import "@scaffold-ui/components/styles.css";
import "@scaffold-ui/debug-contracts/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { ScaffoldHbarAppWithProviders } from "./ScaffoldHbarProvider";
import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "Scaffold Hedera UI",
  description: "Hedera-styled Web3 UI components using @scaffold-ui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ScaffoldHbarAppWithProviders>{children}</ScaffoldHbarAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}

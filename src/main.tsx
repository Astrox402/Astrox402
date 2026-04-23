import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { PrivyProvider } from "@privy-io/react-auth";
import { getRouter } from "./router";
import "./styles.css";

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string;

const router = getRouter();

const rootElement = document.getElementById("root")!;
createRoot(rootElement).render(
  <StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "google", "github", "wallet"],
        embeddedWallets: {
          solana: { createOnLogin: "users-without-wallets" },
        },
        appearance: {
          theme: "dark",
          accentColor: "#22d3ee",
          showWalletLoginFirst: false,
          walletList: ["phantom", "solflare", "backpack"],
        },
      }}
    >
      <RouterProvider router={router} />
    </PrivyProvider>
  </StrictMode>
);

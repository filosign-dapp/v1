import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./lib/context/theme-provider";
import { ErrorBoundary } from "./lib/components/errors/ErrorBoundary";
import { RouterProvider } from "@tanstack/react-router";
import { PrivyProvider } from "./lib/context/privy-provider";
import { WagmiProvider } from "./lib/context/wagmi-provider";
import { QueryClientProvider } from "./lib/context/query-client-provider";
import { Toaster } from "sonner";
import router from "./pages/app";
import "./styles/globals.css";

// Root element
const rootElement = document.getElementById("root")!;
if (!rootElement) throw new Error("Failed to find the root element");

// App
const app = (
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider>
        <PrivyProvider>
          <WagmiProvider>
            <ThemeProvider defaultTheme="dark" storageKey="theme">
              <RouterProvider router={router} />
              <Toaster position="bottom-right" theme="dark" />
            </ThemeProvider>
          </WagmiProvider>
        </PrivyProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);

// Hot module replacement
if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(rootElement));
  root.render(app);
} else {
  createRoot(rootElement).render(app);
}
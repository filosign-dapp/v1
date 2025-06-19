// lib/hooks/useAnalytics.ts
import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

const GA_MEASUREMENT_ID = "G-GYHERFF9X1"; // replace with your ID

export function useAnalytics() {
  const location = useRouterState({ select: (s) => s.location });

  useEffect(() => {
    if (!window.gtag) return;

    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: location.pathname + location.search,
    });
  }, [location]);
}

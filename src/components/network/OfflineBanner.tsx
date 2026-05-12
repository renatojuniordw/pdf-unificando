"use client";

import { useEffect, useRef, useState } from "react";
import { StateBanner } from "@/components/shared/StateBanner";

const HEALTHCHECK_URL = "/api/health";
const HEALTHCHECK_TIMEOUT_MS = 2500;
const OFFLINE_DEBOUNCE_MS = 400;

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const verifyConnectivity = async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(
        () => controller.abort(),
        HEALTHCHECK_TIMEOUT_MS,
      );

      try {
        const response = await fetch(HEALTHCHECK_URL, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!cancelled) {
          setIsOffline(!response.ok);
        }
      } catch {
        if (!cancelled) {
          setIsOffline(true);
        }
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    const scheduleVerification = (delay = 0) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void verifyConnectivity();
      }, delay);
    };

    const handleOnline = () => scheduleVerification();
    const handleOffline = () => scheduleVerification(OFFLINE_DEBOUNCE_MS);

    scheduleVerification();

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      cancelled = true;
      clearTimer();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 md:left-auto md:right-6 md:w-[28rem]">
      <StateBanner
        tone="info"
        title="VOCÊ ESTÁ OFFLINE"
        message="Algumas ferramentas dependem da rede e podem falhar até a conexão voltar."
      />
    </div>
  );
}

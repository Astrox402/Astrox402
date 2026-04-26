import { useEffect, useRef, useCallback } from "react";
import type { ApiPayment } from "@/lib/api";

export function usePaymentStream(userId: string | null, onPayment: (p: ApiPayment) => void) {
  const onPaymentRef = useRef(onPayment);
  onPaymentRef.current = onPayment;

  const connect = useCallback(() => {
    if (!userId) return () => {};
    let es: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const open = () => {
      es = new EventSource(`/api/events/stream`, { withCredentials: false });

      es.addEventListener("message", (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "payment" && msg.payment) {
            onPaymentRef.current(msg.payment as ApiPayment);
          }
        } catch {}
      });

      es.onerror = () => {
        es?.close();
        es = null;
        retryTimeout = setTimeout(open, 5000);
      };
    };

    open();

    return () => {
      retryTimeout && clearTimeout(retryTimeout);
      es?.close();
    };
  }, [userId]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);
}

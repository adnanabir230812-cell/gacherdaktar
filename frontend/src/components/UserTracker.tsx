"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Generate a simple unique session ID
function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("krishisathi_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("krishisathi_session_id", sessionId);
  }
  return sessionId;
}

export default function UserTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string>("");

  useEffect(() => {
    // Avoid double tracking the same path
    const isNewPath = pathname !== lastTrackedPath.current;
    
    // Do not track admin panels to avoid leaking admin paths in standard logs
    if (pathname.startsWith('/gorto') || pathname.startsWith('/api/admin')) return;

    const sessionId = getOrCreateSessionId();
    lastTrackedPath.current = pathname;

    // Track page visit
    let timer: NodeJS.Timeout | null = null;
    if (isNewPath) {
      const trackPageVisit = async () => {
        try {
          await fetch("/api/track", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionId: sessionId,
              pageVisited: pathname,
              action: "visit",
              location: localStorage.getItem("krishisathi_user_district") || "Unknown"
            }),
          });
        } catch (err) {
          console.error("Failed to track page view:", err);
        }
      };
      timer = setTimeout(trackPageVisit, 500);
    }

    // Active heartbeat track every 30s to measure live audience
    const heartbeatTimer = setInterval(async () => {
      try {
        await fetch("/api/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: sessionId,
            pageVisited: pathname,
            action: "heartbeat",
            location: localStorage.getItem("krishisathi_user_district") || "Unknown"
          }),
        });
      } catch (err) {
        console.error("Heartbeat track failed:", err);
      }
    }, 30000);

    return () => {
      if (timer) clearTimeout(timer);
      clearInterval(heartbeatTimer);
    };
  }, [pathname]);

  return null;
}

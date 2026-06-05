import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { API } from "@/lib/api";

type SystemInfo = {
  boot_time: number;
  uptime_seconds: number;
};

export function ServerClock() {
  const { accessToken } = useAuth();
  const [serverOffset, setServerOffset] = useState<number | null>(null);
  const [time, setTime] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    fetch(API.systemMonitor, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data: { system: SystemInfo }) => {
        if (cancelled) return;
        const serverTimeSec = data.system.boot_time + data.system.uptime_seconds;
        const offset = serverTimeSec - Date.now() / 1000;
        setServerOffset(offset);
      })
      .catch(() => {
        // silently fail, clock won't show
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  useEffect(() => {
    if (serverOffset === null) return;

    const tick = () => {
      const now = new Date(Date.now() + serverOffset * 1000);
      setTime(now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }));
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [serverOffset]);

  if (serverOffset === null) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground tabular-nums">
      <Clock className="h-3.5 w-3.5" />
      <span>{time}</span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!now) {
    return <div className="h-[86px]" aria-hidden />;
  }

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-sm font-medium tracking-wide text-zinc-400 capitalize">
        {format(now, "EEEE, d MMMM yyyy", { locale: ru })}
      </p>
      <p className="tabular bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.25)] sm:text-6xl">
        {format(now, "HH:mm:ss")}
      </p>
    </div>
  );
}

"use client";

import { useMemo } from "react";

export function TrackerList() {
  // Placeholder list until wired to API
  const trackers = useMemo(
    () => [
      { id: "t1", name: "Daily Wellness", fields: ["mood", "sleepHours", "steps"] },
      { id: "t2", name: "Weight & Steps", fields: ["weight", "steps"] },
    ],
    []
  );

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Your trackers</div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {trackers.map((t) => (
          <li key={t.id} className="rounded-2xl border p-3">
            <div className="font-medium">{t.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{t.fields.join(", ")}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}



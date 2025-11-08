"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PlanEbookWizard() {
  const [goal, setGoal] = useState("");
  const [durationWeeks, setDurationWeeks] = useState<number | "">("");
  const [daysPerWeek, setDaysPerWeek] = useState<number | "">("");
  const [constraints, setConstraints] = useState("");

  const disabled =
    !goal.trim() || !durationWeeks || !daysPerWeek || Number(durationWeeks) <= 0 || Number(daysPerWeek) <= 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Primary goal</label>
          <Input
            placeholder="e.g., lose 10 lbs, build muscle, improve cardio"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Duration (weeks)</label>
          <Input
            type="number"
            min={1}
            value={durationWeeks}
            onChange={(e) => setDurationWeeks(e.target.value ? Number(e.target.value) : "")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Days per week</label>
          <Input
            type="number"
            min={1}
            max={7}
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value ? Number(e.target.value) : "")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Constraints & preferences</label>
        <textarea
          placeholder="Equipment access, injuries, schedule limits, dietary preferences..."
          className="w-full min-h-[120px] rounded-2xl border bg-transparent p-3 text-sm"
          value={constraints}
          onChange={(e) => setConstraints(e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button type="button" disabled={disabled}>
          Generate plan
        </Button>
      </div>
    </div>
  );
}



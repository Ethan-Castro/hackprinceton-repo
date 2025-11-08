"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { DynamicTemplateDocument, TemplateDocumentSkeleton } from "@/components/ai-elements";
import type { TemplateDocumentPayload } from "@/types/ai-tool-output";

export function PlanEbookWizard() {
  const [goal, setGoal] = useState("");
  const [durationWeeks, setDurationWeeks] = useState<number | "">("");
  const [daysPerWeek, setDaysPerWeek] = useState<number | "">("");
  const [constraints, setConstraints] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [protocol, setProtocol] = useState<TemplateDocumentPayload | null>(null);

  const disabled =
    !goal.trim() || !durationWeeks || !daysPerWeek || Number(durationWeeks) <= 0 || Number(daysPerWeek) <= 0;

  const handleGenerate = () => {
    if (disabled) return;
    setIsGenerating(true);
    setProtocol(null);
    setTimeout(() => {
      const template = buildHealthTemplate({
        goal,
        durationWeeks: Number(durationWeeks),
        daysPerWeek: Number(daysPerWeek),
        constraints,
      });
      setProtocol(template);
      setIsGenerating(false);
    }, 650);
  };

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
        <Button type="button" disabled={disabled || isGenerating} onClick={handleGenerate} className="gap-2">
          {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
          {isGenerating ? "Assembling protocol..." : "Generate protocol"}
        </Button>
      </div>

      {(isGenerating || protocol) && (
        <div className="pt-2">
          {isGenerating && <TemplateDocumentSkeleton />}
          {!isGenerating && protocol && (
            <DynamicTemplateDocument template={protocol} />
          )}
        </div>
      )}
    </div>
  );
}

function buildHealthTemplate({
  goal,
  durationWeeks,
  daysPerWeek,
  constraints,
}: {
  goal: string;
  durationWeeks: number;
  daysPerWeek: number;
  constraints: string;
}): TemplateDocumentPayload {
  const intensity =
    daysPerWeek >= 5 ? "High accountability" : daysPerWeek >= 3 ? "Steady cadence" : "Ease-in";
  const sessions = `${daysPerWeek}x / week`;
  const compression = durationWeeks <= 4 ? "Sprint" : durationWeeks <= 8 ? "Focused block" : "Seasonal cycle";

  return {
    type: "health-protocol",
    title: `${goal} — Follow-up Protocol`,
    subtitle: `${compression} across ${durationWeeks} weeks`,
    summary:
      "High-touch follow-up protocol designed to keep the member compliant between visits. Includes weekly focus, daily touchpoints, and escalation triggers that care teams can personalize or email in one click.",
    audience: "Member + Coach",
    duration: `${durationWeeks} weeks`,
    difficulty: intensity,
    owner: "Health Coach Automation",
    tags: ["Health", "Follow-up", "Protocol"],
    status: {
      label: "Ready to send",
      state: "ready",
      progress: 100,
      updatedAt: "Just now",
    },
    metrics: [
      { label: "Weekly Sessions", value: sessions, helper: "Consistency target", trend: "up" },
      { label: "Recovery Days", value: `${7 - daysPerWeek} flexible`, helper: "Auto-scheduled" },
      {
        label: "Check-in cadence",
        value: daysPerWeek >= 4 ? "3 touchpoints" : "2 touchpoints",
        helper: "Coach + SMS",
      },
    ],
    sections: [
      {
        accent: "Weekly Rhythm",
        title: "Macro focus & anchor actions",
        description: "Blend habit stacking, micro goals, and stress management to keep progress compounding.",
        layout: "grid",
        blocks: [
          {
            type: "timeline",
            title: "Week-by-week arc",
            steps: Array.from({ length: durationWeeks }).map((_, index) => {
              const weekNumber = index + 1;
              const status = index === 0 ? "current" : "pending";
              return {
                title: `Week ${weekNumber}`,
                detail:
                  weekNumber === 1
                    ? "Baseline + movement screen"
                    : weekNumber === durationWeeks
                    ? "Deload + photo/metric recap"
                    : "Progressive overload / skills focus",
                status,
                timestamp: weekNumber === durationWeeks ? "Celebrate & reassess" : "Focus: momentum",
              };
            }),
          },
          {
            type: "list",
            style: "cards",
            title: "Anchor sessions",
            items: [
              {
                title: "Primary training days",
                detail: `${sessions} — mix of interval conditioning + strength complexes tailored to member energy windows.`,
                badge: "Coach-led",
              },
              {
                title: "Recovery micro-routines",
                detail: "10-min lymph flush or parasympathetic breath work stacked to nightly hygiene.",
                badge: "Self-serve",
              },
              {
                title: "Metrics to watch",
                detail: "Morning RPE, sleep efficiency, cravings, HRV delta vs baseline.",
                badge: "Auto logged",
              },
            ],
          },
        ],
      },
      {
        accent: "Daily Loop",
        title: "Follow-up and escalation",
        description: "Keeps the coach synced to client signals without ping fatigue.",
        blocks: [
          {
            type: "checklist",
            title: "Daily message template",
            items: [
              {
                label: "AM readiness check",
                note: "1-5 energy, soreness, mood emoji.",
                checked: true,
              },
              {
                label: "Session confirmation",
                note: "Auto reminder 2h prior with playlist or warm-up micro-video.",
              },
              {
                label: "PM reflection",
                note: "Win of the day + tomorrow’s biggest friction. Flag 'red' for coach follow-up.",
              },
            ],
          },
          {
            type: "callout",
            tone: "info",
            title: "Escalation triggers",
            body: "3 skipped sessions, mood < 3, or pain mention auto-routes to care channel with a ready-to-send Loom template.",
          },
          {
            type: "text",
            title: "Constraints noted",
            body: constraints || "No constraints provided. Default to standard recovery guidance.",
            variant: "muted",
          },
        ],
      },
      {
        accent: "Touchpoints",
        title: "Coach comms + resources",
        layout: "grid",
        blocks: [
          {
            type: "list",
            style: "ordered",
            title: "Weekly follow-up sequence",
            items: [
              {
                title: "Monday pulse",
                detail: "Short loom recapping focus, confirm equipment + scheduling friction.",
              },
              {
                title: "Mid-week micro-survey",
                detail: "1-min Typeform collecting soreness, cravings, stress. Auto-summarized for charting.",
              },
              {
                title: "Friday wins + primer",
                detail: "Celebrate PRs, attach annotated clip, preview upcoming block.",
              },
            ],
          },
          {
            type: "resources",
            title: "Attachments",
            items: [
              { title: "Habit primer", description: "PDF of the week’s nutritional focus." },
              { title: "Coach voice memo", description: "Use QuickTime template to personalize check-ins." },
            ],
          },
        ],
      },
    ],
    resources: [
      {
        title: "Copy email draft",
        description: "Opens a pre-filled email with the protocol summary.",
        url: "mailto:?subject=Health%20Protocol",
      },
    ],
  };
}

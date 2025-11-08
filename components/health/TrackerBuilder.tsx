"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FieldType = "number" | "text" | "enum" | "boolean";

type Field = {
  id: string;
  name: string;
  type: FieldType;
  options?: string[]; // for enum
};

export function TrackerBuilder() {
  const [name, setName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("number");
  const [newFieldOptions, setNewFieldOptions] = useState("");

  const addField = () => {
    const trimmed = newFieldName.trim();
    if (!trimmed) return;
    const id = `${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${fields.length + 1}`;
    const field: Field = {
      id,
      name: trimmed,
      type: newFieldType,
      options:
        newFieldType === "enum"
          ? newFieldOptions
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : undefined,
    };
    setFields((prev) => [...prev, field]);
    setNewFieldName("");
    setNewFieldType("number");
    setNewFieldOptions("");
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const canCreate = name.trim().length > 0 && fields.length > 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Tracker name</label>
        <Input
          placeholder="e.g., Daily Wellness, Weight & Steps, Sleep Quality"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="rounded-2xl border p-3 md:p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Field name (e.g., Steps, Weight, Mood)"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
          />
          <select
            className="rounded-xl border bg-transparent px-3 py-2 text-sm"
            value={newFieldType}
            onChange={(e) => setNewFieldType(e.target.value as FieldType)}
          >
            <option value="number">Number</option>
            <option value="text">Text</option>
            <option value="enum">Enum</option>
            <option value="boolean">Boolean</option>
          </select>
          {newFieldType === "enum" ? (
            <Input
              placeholder="Comma-separated options (e.g., low, medium, high)"
              value={newFieldOptions}
              onChange={(e) => setNewFieldOptions(e.target.value)}
            />
          ) : (
            <div />
          )}
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={addField} disabled={!newFieldName.trim()}>
            Add field
          </Button>
        </div>
        {fields.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Fields</div>
            <ul className="space-y-1 text-sm">
              {fields.map((f) => (
                <li key={f.id} className="flex items-center justify-between rounded-xl border px-3 py-2">
                  <span>
                    <span className="font-medium">{f.name}</span>{" "}
                    <span className="text-muted-foreground">({f.type})</span>
                    {f.type === "enum" && f.options && (
                      <span className="text-muted-foreground"> — {f.options.join(", ")}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => removeField(f.id)}
                    title="Remove"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="button" disabled={!canCreate}>
          Create tracker
        </Button>
      </div>
    </div>
  );
}



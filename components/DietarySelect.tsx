"use client";

import { useMemo } from "react";
import { COMMON_DIETARY_OPTIONS } from "@/lib/allergens";

function parseValue(value: string) {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const known = parts.filter((part) =>
    (COMMON_DIETARY_OPTIONS as readonly string[]).includes(part),
  );
  const otherPart = parts.find((part) => part.startsWith("Otro: "));
  const other = otherPart ? otherPart.slice("Otro: ".length) : "";
  return { known, other };
}

function buildValue(known: string[], other: string) {
  const parts = [...known];
  if (other.trim()) parts.push(`Otro: ${other.trim()}`);
  return parts.join(", ");
}

export function DietarySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const parsed = useMemo(() => parseValue(value), [value]);

  function toggleOption(option: string) {
    const known = parsed.known.includes(option)
      ? parsed.known.filter((item) => item !== option)
      : [...parsed.known, option];
    onChange(buildValue(known, parsed.other));
  }

  function handleOtherChange(text: string) {
    onChange(buildValue(parsed.known, text));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {COMMON_DIETARY_OPTIONS.map((option) => {
          const active = parsed.known.includes(option);
          return (
            <label
              key={option}
              className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
                active
                  ? "border-neutral-900 dark:border-neutral-100 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                  : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              <input
                type="checkbox"
                checked={active}
                onChange={() => toggleOption(option)}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
      <input
        placeholder="Otro (especifica)"
        value={parsed.other}
        onChange={(event) => handleOtherChange(event.target.value)}
        className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-sm"
      />
    </div>
  );
}

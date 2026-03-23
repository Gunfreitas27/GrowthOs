"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const PRESETS = [
  { label: "Hoje", value: "today" },
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Este mês", value: "this_month" },
  { label: "Último mês", value: "last_month" },
  { label: "Este trimestre", value: "this_quarter" },
];

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentPreset = PRESETS.find((p) => p.value === value) || PRESETS[2];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        style={{
          background: "rgba(26,24,46,0.6)",
          borderColor: "rgba(107,79,232,0.2)",
          color: "#F8F7FC",
        }}
      >
        <Calendar className="w-4 h-4" style={{ color: "var(--velox-pulse)" }} />
        <span className="text-sm">{currentPreset.label}</span>
        <ChevronDown
          className="w-3 h-3 ml-1"
          style={{ color: "var(--velox-mist)" }}
        />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full left-0 mt-2 z-50 p-2 rounded-lg shadow-xl min-w-[200px]"
            style={{
              background: "#1A182E",
              border: "1px solid rgba(107,79,232,0.25)",
            }}
          >
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => {
                  onChange(preset.value);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm rounded transition-colors"
                style={{
                  color:
                    preset.value === value ? "var(--velox-pulse)" : "#F8F7FC",
                  background:
                    preset.value === value
                      ? "rgba(107,79,232,0.15)"
                      : "transparent",
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

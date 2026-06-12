import * as React from "react";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

interface EmergencyCardProps extends React.ComponentProps<"div"> {
  patientName: string;
  age: number;
  bloodGroup?: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
}

export function EmergencyCard({
  patientName,
  age,
  bloodGroup,
  allergies,
  medications,
  conditions,
  className,
  ...props
}: EmergencyCardProps) {
  return (
    <div
      role="alert"
      aria-label={`Emergency card for ${patientName}`}
      className={cn(
        "bg-amber-50 rounded-lg p-8 w-full max-w-xl",
        "border border-amber-500/25",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <TriangleAlert
          className="w-5 h-5 text-amber-700"
          strokeWidth={2}
          aria-hidden
        />
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-amber-700">
          Emergency
        </span>
      </div>

      {/* Patient identity */}
      <h1 className="font-serif text-[2rem] font-semibold text-ink-900 tracking-[-0.015em] leading-tight">
        {patientName}
      </h1>
      <p className="text-sm font-medium text-ink-500 mt-1 mb-8">
        {age} years old{bloodGroup ? ` · ${bloodGroup}` : ""}
      </p>

      {/* Allergies — highest prominence */}
      {allergies.length > 0 && (
        <section className="mb-6">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.04em] text-status-alert mb-3">
            Allergies
          </h3>
          <ul className="space-y-1.5">
            {allergies.map((allergy) => (
              <li
                key={allergy}
                className="text-sm font-semibold text-ink-900 flex items-center gap-2"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full bg-status-alert flex-shrink-0"
                  aria-hidden
                />
                {allergy}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Current medications */}
      {medications.length > 0 && (
        <section className="mb-6">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-500 mb-3">
            Current Medications
          </h3>
          <ul className="space-y-1.5">
            {medications.map((med) => (
              <li key={med} className="text-sm text-ink-700 leading-snug">
                {med}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Chronic conditions */}
      {conditions.length > 0 && (
        <section>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-500 mb-3">
            Chronic Conditions
          </h3>
          <ul className="space-y-1.5">
            {conditions.map((condition) => (
              <li key={condition} className="text-sm text-ink-700 leading-snug">
                {condition}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Empty guard */}
      {allergies.length === 0 &&
        medications.length === 0 &&
        conditions.length === 0 && (
          <p className="text-sm text-ink-300 italic">
            No critical information on record.
          </p>
        )}
    </div>
  );
}

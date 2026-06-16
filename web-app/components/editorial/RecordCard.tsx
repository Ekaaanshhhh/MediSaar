import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, ExternalLink } from "lucide-react";

interface RecordCardProps extends React.ComponentProps<"div"> {
  date: string;
  hospital: string;
  type: string;
  summary: string;
  sourceUrl?: string;
  loading?: boolean;
}

export function RecordCard({
  date,
  hospital,
  type,
  summary,
  sourceUrl,
  loading = false,
  className,
  ...props
}: RecordCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          "bg-surface rounded-sm shadow-soft p-4 flex items-start gap-4",
          className
        )}
        aria-busy
      >
        <div className="w-8 h-8 rounded-sm bg-surface-sunk animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-surface-sunk rounded-xs animate-pulse w-1/3" />
          <div className="h-3.5 bg-surface-sunk rounded-xs animate-pulse w-1/2" />
          <div className="h-3 bg-surface-sunk rounded-xs animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-surface rounded-sm shadow-soft p-4",
        "hover:shadow-lift transition-shadow duration-[220ms]",
        "flex items-start gap-4",
        className
      )}
      {...props}
    >
      <div className="w-8 h-8 flex items-center justify-center rounded-sm bg-sage-50 flex-shrink-0 mt-0.5">
        <FileText className="w-4 h-4 text-sage-600" strokeWidth={1.5} aria-hidden />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300 leading-none">
            {date} · {hospital}
          </p>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-medium uppercase tracking-[0.04em] text-sage-600 hover:text-sage-800 flex items-center gap-0.5 transition-colors duration-[140ms] flex-shrink-0 leading-none"
              aria-label={`Source document for ${type}`}
            >
              source
              <ExternalLink className="w-3 h-3 ml-0.5" strokeWidth={1.5} aria-hidden />
            </a>
          )}
        </div>
        <p className="text-sm font-semibold text-ink-900 mb-0.5 leading-snug">{type}</p>
        <p className="text-sm text-ink-500 leading-relaxed line-clamp-2">{summary}</p>
      </div>
    </div>
  );
}

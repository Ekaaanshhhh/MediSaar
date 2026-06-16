import * as React from "react";
import { cn } from "@/lib/utils";

interface AISummaryCardProps extends React.ComponentProps<"div"> {
  generatedAt?: string;
  sourceCount?: number;
  isLoading?: boolean;
  isStreaming?: boolean;
  children?: React.ReactNode;
}

export function AISummaryCard({
  generatedAt,
  sourceCount,
  isLoading = false,
  isStreaming = false,
  className,
  children,
  ...props
}: AISummaryCardProps) {
  const timeLabel = generatedAt
    ? `AI · GENERATED ${generatedAt}`
    : "AI · GENERATED";

  return (
    <div
      role="region"
      aria-label={`AI-generated summary${generatedAt ? `, last updated ${generatedAt}` : ""}${sourceCount != null ? `, based on ${sourceCount} source records` : ""}`}
      className={cn(
        "bg-[#F7FAF7] rounded-[14px] shadow-soft relative overflow-hidden",
        "border-l-[3px] border-l-[#E0902C]",
        className
      )}
      {...props}
    >
      {/* AI identity tag */}
      <div className="absolute top-4 right-4">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E0902C] select-none">
          {timeLabel}
        </span>
      </div>

      <div className="p-6 pt-10">
        {isLoading ? (
          <div className="space-y-2.5">
            <div className="h-3.5 bg-[#FBF0DC] rounded-xs animate-pulse w-4/5" />
            <div className="h-3.5 bg-[#FBF0DC] rounded-xs animate-pulse w-full" />
            <div className="h-3.5 bg-[#FBF0DC] rounded-xs animate-pulse w-3/4" />
            <div className="h-3.5 bg-[#FBF0DC] rounded-xs animate-pulse w-5/6" />
          </div>
        ) : (
          <div className="text-sm leading-relaxed text-ink-700">
            {children}
            {isStreaming && (
              <span
                aria-hidden
                className="inline-block w-px h-4 bg-[#E0902C] ml-0.5 align-text-bottom animate-amber-blink"
              />
            )}
          </div>
        )}
      </div>

      {sourceCount != null && !isLoading && (
        <div className="px-6 pb-5 border-t border-sage-100 pt-3 mt-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-ink-300">
            Based on {sourceCount} source record{sourceCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

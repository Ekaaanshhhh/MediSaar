import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AICardProps {
  title: string;
  summary: string;
}

export function AICard({ title, summary }: AICardProps) {
  return (
    <Card className="border-l-[3px] border-l-amber-500 bg-surface shadow-soft relative overflow-hidden border-y border-r border-border/50">
      {/* AI Tag */}
      <span className="absolute top-4 right-4 text-[11px] font-medium uppercase tracking-[0.06em] text-amber-500 font-sans select-none">
        AI
      </span>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-ink-900 font-sans">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-ink-700 font-sans">{summary}</p>
      </CardContent>
    </Card>
  );
}

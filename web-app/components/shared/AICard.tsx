import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AICardProps {
  title: string;
  summary: string;
}

export function AICard({ title, summary }: AICardProps) {
  return (
    <Card className="border-l-[3px] border-l-[#E0902C] bg-[#F7FAF7] shadow-soft relative overflow-hidden border-y border-r border-border/50">
      {/* AI Tag */}
      <span className="absolute top-4 right-4 text-[10px] font-semibold uppercase tracking-wider text-[#E0902C] font-sans select-none">
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

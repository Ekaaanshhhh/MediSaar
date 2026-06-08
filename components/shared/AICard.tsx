import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AICardProps {
  title: string;
  summary: string;
}

export function AICard({ title, summary }: AICardProps) {
  return (
    <Card className="border-accent/30 bg-accent/5 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4 text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
      </CardContent>
    </Card>
  );
}

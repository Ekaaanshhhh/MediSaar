import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Visit, Report } from '@/data/mockData';
import { format } from 'date-fns';
import { FileText, Stethoscope, Calendar } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  type: 'VISIT' | 'REPORT';
  title: string;
  description: string;
}

interface TimelineWidgetProps {
  visits: Visit[];
  reports: Report[];
  maxItems?: number;
}

export function TimelineWidget({ visits, reports, maxItems = 5 }: TimelineWidgetProps) {
  // Combine and sort events
  const events: TimelineEvent[] = [
    ...visits.map(v => ({
      id: v.id,
      date: v.date,
      type: 'VISIT' as const,
      title: v.status === 'COMPLETED' ? 'Completed Visit' : 'Scheduled Visit',
      description: v.diagnosis || 'Routine checkup'
    })),
    ...reports.map(r => ({
      id: r.id,
      date: r.date,
      type: 'REPORT' as const,
      title: r.title,
      description: `Report Type: ${r.type.replace('_', ' ')}`
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, maxItems);

  return (
    <Card className="shadow-sm border-border h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {events.map((event, index) => (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  {event.type === 'VISIT' ? <Stethoscope className="h-4 w-4 text-accent" /> : <FileText className="h-4 w-4 text-primary" />}
                </div>
                {/* Content */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border bg-card shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    <time className="text-xs text-muted-foreground font-medium">{format(new Date(event.date), 'MMM dd, yyyy')}</time>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No recent medical history</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

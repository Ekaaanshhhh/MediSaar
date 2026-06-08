'use client'
import { getPatientDetails } from '@/data/mockData';
import { TimelineWidget } from '@/components/shared/TimelineWidget';
import { useAuth } from '@/hooks/useAuth';

export default function TimelinePage() {
  const { user } = useAuth();
  if (!user) return null;
  
  const details = getPatientDetails(user.id);
  const { visits, reports } = details;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Medical Timeline</h1>
        <p className="text-muted-foreground">A chronological history of your visits, reports, and procedures.</p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <TimelineWidget visits={visits} reports={reports} maxItems={50} />
      </div>
    </div>
  );
}

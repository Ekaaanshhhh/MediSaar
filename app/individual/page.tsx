'use client'
import { useAuth } from '@/hooks/useAuth';
import { getPatientDetails } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Stethoscope, Building, Pill, ActivitySquare } from 'lucide-react';
import { AICard } from '@/components/shared/AICard';
import { HealthSnapshot } from '@/components/shared/HealthSnapshot';
import { TimelineWidget } from '@/components/shared/TimelineWidget';

export default function IndividualDashboard() {
  const { user } = useAuth();
  if (!user) return null;
  const details = getPatientDetails(user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">Here is an overview of your medical journey.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Visits', value: details.visits.length, icon: Stethoscope },
          { title: 'Reports', value: details.reports.length, icon: FileText },
          { title: 'Prescriptions', value: details.prescriptions.length, icon: Pill },
          { title: 'Institutions', value: new Set(details.visits.map(v => v.institutionId)).size, icon: Building },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <HealthSnapshot profile={details.profile} latestVisit={details.visits[0]} activePrescriptions={details.prescriptions} />
          <TimelineWidget visits={details.visits} reports={details.reports} maxItems={4} />
        </div>
        <div className="space-y-6">
          <AICard 
            title="AI Health Snapshot" 
            summary="Your HbA1c levels show moderate improvement. Continue your current Metformin dosage and monitor blood pressure. Next scheduled checkup is in 5 days." 
          />
          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ActivitySquare className="h-4 w-4 text-accent" />
                Upcoming Follow Ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {details.visits.filter(v => v.status === 'SCHEDULED').length > 0 ? (
                <ul className="space-y-3">
                  {details.visits.filter(v => v.status === 'SCHEDULED').map(v => (
                    <li key={v.id} className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                      <span className="font-medium">Dr. Sarah Smith</span>
                      <span className="text-muted-foreground">{new Date(v.date).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-sm text-muted-foreground">No upcoming appointments.</span>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

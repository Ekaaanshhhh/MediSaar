'use client'

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Stethoscope, Building, Pill, ActivitySquare, Loader2, Info } from 'lucide-react';
import { AICard } from '@/components/shared/AICard';
import { HealthSnapshot } from '@/components/shared/HealthSnapshot';
import { TimelineWidget } from '@/components/shared/TimelineWidget';

interface DashboardData {
  summary: {
    totalVisits: number;
    totalReports: number;
    totalPrescriptions: number;
    totalInstitutions: number;
  };
  profile: any;
  healthSnapshot: any;
  aiSummary: string | null;
  timelineEvents: any[];
  recentReports: any[];
  recentInstitutions: any[];
  upcomingFollowUps: any[];
  lastUpdated: string;
}

export default function IndividualDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      if (!user) return;
      try {
        const res = await fetch('/api/individual/dashboard');
        const result = await res.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch dashboard data');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Info className="h-10 w-10 text-destructive mb-4" />
        <p className="text-destructive font-medium">{error || 'Unable to load dashboard'}</p>
      </div>
    );
  }

  // Map the Timeline Events from backend to what TimelineWidget expects
  // The backend already formatted them nicely, but let's ensure compatibility.
  // Note: TimelineWidget natively takes "visits" and "reports" props and maps them itself.
  // Since we pre-mapped them on the backend, we need to adapt TimelineWidget or just pass them as fake visits/reports if we didn't refactor it.
  // Actually, wait, TimelineWidget takes visits and reports. Let's pass the raw timelineEvents to it or adapt the widget.
  // Since we shouldn't heavily modify TimelineWidget if not explicitly told, let's map timelineEvents back to fake visits/reports so it renders.
  const mappedVisits = data.timelineEvents
    .filter(e => e.type === 'VISIT' || e.type === 'DIAGNOSIS')
    .map((e, idx) => ({
      id: e.id || String(idx),
      date: e.date,
      status: e.type === 'VISIT' ? 'COMPLETED' : 'SCHEDULED', // Hack to make the icon distinct
      diagnosis: e.title,
      chiefComplaint: e.description,
      institutionId: e.institutionId || 'unknown'
    }));
    
  const mappedReports = data.timelineEvents
    .filter(e => e.type === 'REPORT')
    .map((e, idx) => ({
      id: e.id || String(idx),
      date: e.date,
      type: e.title,
      title: e.description,
      visitId: 'unknown',
      fileUrl: ''
    }));

  // Adapt HealthSnapshot props
  // It expects `profile` object with `bloodGroup`, `currentConditions`, `allergies`
  // And `latestVisit` with `date`
  // And `activePrescriptions` with `medications`
  const fakeProfile = {
    ...data.profile,
    bloodGroup: data.healthSnapshot.bloodGroup,
    allergies: data.healthSnapshot.allergies,
    currentConditions: data.healthSnapshot.currentConditions
  };
  const fakeLatestVisit = data.healthSnapshot.latestVisitDate ? { date: data.healthSnapshot.latestVisitDate } : undefined;
  const fakeActivePrescriptions = [{
    id: '1', visitId: '1', date: new Date().toISOString(),
    medications: data.healthSnapshot.activeMedications
  }];

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
          { title: 'Total Visits', value: data.summary.totalVisits, icon: Stethoscope },
          { title: 'Reports', value: data.summary.totalReports, icon: FileText },
          { title: 'Prescriptions', value: data.summary.totalPrescriptions, icon: Pill },
          { title: 'Institutions', value: data.summary.totalInstitutions, icon: Building },
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
          <HealthSnapshot 
            profile={fakeProfile as any} 
            latestVisit={fakeLatestVisit as any} 
            activePrescriptions={fakeActivePrescriptions as any} 
          />
          <TimelineWidget visits={mappedVisits as any} reports={mappedReports as any} maxItems={5} />
        </div>
        <div className="space-y-6">
          {data.aiSummary ? (
             <AICard 
               title="AI Health Snapshot" 
               summary={data.aiSummary} 
             />
          ) : (
            <Card className="shadow-sm border-border bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ActivitySquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">AI Summary</h3>
                <p className="text-sm text-muted-foreground">AI Summary Coming Soon</p>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ActivitySquare className="h-4 w-4 text-accent" />
                Upcoming Follow Ups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.upcomingFollowUps.length > 0 ? (
                <ul className="space-y-3">
                  {data.upcomingFollowUps.map((v, idx) => (
                    <li key={idx} className="flex flex-col text-sm border-b border-border/50 pb-3 last:border-0 last:pb-0">
                      <span className="font-medium text-primary">{v.institutionName}</span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-muted-foreground line-clamp-1">{v.chiefComplaint || 'Follow up'}</span>
                        <span className="text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(v.date).toLocaleDateString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-center">
                  <span className="text-sm text-muted-foreground">No upcoming appointments.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

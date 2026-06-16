'use client'
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { HealthSnapshot } from '@/components/shared/HealthSnapshot';
import { TimelineWidget } from '@/components/shared/TimelineWidget';
import { AICard } from '@/components/shared/AICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, ActivitySquare, Pill, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PatientMedicalSummaryPage() {
  const params = useParams();
  const patientId = params.id as string;
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const res = await fetch(`/api/doctor/patient/${patientId}`);
        const data = await res.json();
        if (data.success) {
          setDetails(data.data);
        } else {
          toast.error(data.message || "Failed to load patient details.");
        }
      } catch (error) {
        toast.error("Network error while loading patient details.");
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchPatientDetails();
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!details || !details.user || !details.profile) {
    return <div>Patient not found.</div>;
  }

  const { user, profile, visits, reports, prescriptions } = details;
  const latestVisit = visits.length > 0 ? visits.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/doctor/search">
          <Button variant="outline" size="icon" className="rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-muted-foreground">{profile.medisaarId} • {profile.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <HealthSnapshot profile={profile} latestVisit={latestVisit} activePrescriptions={prescriptions} />

          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-6 space-x-6 overflow-x-auto">
              <TabsTrigger value="timeline" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3">Timeline</TabsTrigger>
              <TabsTrigger value="reports" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3">Reports</TabsTrigger>
              <TabsTrigger value="prescriptions" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3">Prescriptions</TabsTrigger>
              <TabsTrigger value="diagnoses" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3">Diagnoses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline">
              <TimelineWidget visits={visits} reports={reports} maxItems={10} />
            </TabsContent>
            
            <TabsContent value="reports">
              {reports.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reports.map((r: any) => (
                    <Card key={r.id} className="cursor-pointer hover:border-primary transition-colors">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <Badge variant="outline">{r.type.replace('_', ' ')}</Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(r.date), 'MMM dd, yyyy')}</span>
                        </div>
                        <CardTitle className="text-base mt-2">{r.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Button variant="ghost" className="w-full mt-2 h-8 text-xs text-primary" size="sm">
                          <FileText className="mr-2 h-3 w-3" /> View Report
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState icon={FileText} title="No Reports Found" description="This patient doesn't have any uploaded reports yet." />
              )}
            </TabsContent>

            <TabsContent value="prescriptions">
               {prescriptions.length > 0 ? (
                 <div className="space-y-4">
                   {prescriptions.map((p: any) => (
                     <Card key={p.id}>
                       <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                         <CardTitle className="text-sm font-medium flex items-center gap-2">
                           <Pill className="h-4 w-4 text-accent" />
                           Prescribed on {format(new Date(p.date), 'MMM dd, yyyy')}
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="p-4 pt-2">
                         <ul className="space-y-2">
                           {p.medications.map((m: any, idx: number) => (
                             <li key={idx} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                               <span className="font-medium">{m.name} <span className="text-muted-foreground font-normal ml-1">({m.dosage})</span></span>
                               <span className="text-muted-foreground text-xs">{m.frequency} • {m.duration}</span>
                             </li>
                           ))}
                         </ul>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               ) : (
                 <EmptyState icon={Pill} title="No Prescriptions" description="This patient doesn't have any active prescriptions." />
               )}
            </TabsContent>
            
            <TabsContent value="diagnoses">
               {visits.filter((v: any) => v.diagnosis).length > 0 ? (
                 <div className="space-y-4">
                   {visits.filter((v: any) => v.diagnosis).map((v: any) => (
                     <Card key={v.id}>
                       <CardHeader className="p-4 pb-2">
                         <span className="text-xs text-muted-foreground">{format(new Date(v.date), 'MMM dd, yyyy')}</span>
                         <CardTitle className="text-base mt-1">{v.diagnosis}</CardTitle>
                       </CardHeader>
                       <CardContent className="p-4 pt-0">
                         <p className="text-sm text-muted-foreground">{v.notes}</p>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               ) : (
                 <EmptyState icon={ActivitySquare} title="No Diagnoses" description="No specific diagnoses recorded for this patient yet." />
               )}
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <AICard 
            title="AI Clinical Summary" 
            summary={profile.currentAISummary || "No AI clinical summary generated yet."} 
          />
          
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4 text-primary" /> Request New Report
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Pill className="mr-2 h-4 w-4 text-accent" /> Add Prescription
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

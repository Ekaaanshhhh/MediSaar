'use client'
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { HealthSnapshot } from '@/components/shared/HealthSnapshot';

import { AICard } from '@/components/shared/AICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, FileText, ActivitySquare, Pill, Loader2, Sparkles, TriangleAlert } from 'lucide-react';
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
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

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
        <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
      </div>
    );
  }

  if (!details || !details.user || !details.profile) {
    return (
      <div className="p-8 text-center text-ink-500 font-sans italic">
        Patient not found.
      </div>
    );
  }

  const { user, profile, visits, reports, prescriptions } = details;
  const latestVisit = visits.length > 0 ? visits.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;
  const patientAge = profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 'Unknown';

  if (isEmergencyMode) {
    return (
      <div className="fixed inset-0 z-[100] bg-amber-50/98 flex flex-col items-center justify-center p-6 md:p-12 transition-all duration-300 overflow-y-auto">
        <div className="w-full max-w-2xl bg-surface border-l-4 border-l-amber-500 rounded-lg p-8 md:p-10 shadow-lift relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <TriangleAlert className="w-5 h-5 text-status-alert" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-status-alert font-sans">
                EMERGENCY MEDICAL ARTIFACT
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-sage-800 text-ink-700 hover:bg-sage-50 font-sans text-xs"
              onClick={() => setIsEmergencyMode(false)}
            >
              Exit Emergency Mode
            </Button>
          </div>

          {/* Patient Identity */}
          <div className="mb-8">
            <h1 className="font-serif text-[40px] font-semibold text-ink-900 leading-tight">
              {user.name}
            </h1>
            <p className="text-sm font-medium text-ink-500 mt-1 font-sans">
              {patientAge} years old {profile.bloodGroup ? `· Blood Group ${profile.bloodGroup}` : ""} · ID: {profile.mediSaarId || profile.medisaarId}
            </p>
          </div>

          <div className="space-y-6">
            {/* 1. Allergies */}
            <section className="bg-status-alert/5 border border-status-alert/15 rounded-md p-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-status-alert mb-3 font-sans">
                CRITICAL ALLERGIES
              </h3>
              {profile.allergies && profile.allergies.length > 0 ? (
                <ul className="space-y-2">
                  {profile.allergies.map((allergy: string) => (
                    <li key={allergy} className="text-sm font-semibold text-ink-900 flex items-center gap-2.5 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-status-alert shrink-0" />
                      {allergy}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-300 italic font-sans">No critical allergies on record</p>
              )}
            </section>

            {/* 2. Current Medications */}
            <section className="border border-border/50 rounded-md p-5 bg-canvas">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-500 mb-3 font-sans">
                CURRENT MEDICATIONS
              </h3>
              {prescriptions && prescriptions.length > 0 ? (
                <ul className="space-y-2">
                  {prescriptions.flatMap((p: any) => p.medicines || []).map((med: any, idx: number) => (
                    <li key={idx} className="text-sm text-ink-900 font-semibold flex items-center gap-2 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage-400 shrink-0" />
                      {med.name} <span className="text-ink-500 font-normal ml-1">({med.dosage} • {med.frequency})</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-300 italic font-sans">No current medications on record</p>
              )}
            </section>

            {/* 3. Chronic Conditions */}
            <section className="border border-border/50 rounded-md p-5 bg-canvas">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-500 mb-3 font-sans">
                CHRONIC CONDITIONS
              </h3>
              {profile.currentConditions && profile.currentConditions.length > 0 ? (
                <ul className="space-y-2">
                  {profile.currentConditions.map((cond: string) => (
                    <li key={cond} className="text-sm text-ink-900 font-semibold flex items-center gap-2 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage-400 shrink-0" />
                      {cond}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-ink-300 italic font-sans">No chronic conditions on record</p>
              )}
            </section>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-border/40">
            <Button 
              className="bg-sage-600 hover:bg-sage-800 text-surface rounded-sm h-11 px-8 text-sm font-medium w-full sm:w-auto font-sans"
              onClick={() => window.print()}
            >
              Print Record
            </Button>
            <Button 
              variant="outline" 
              className="rounded-sm h-11 px-8 text-sm font-medium border-sage-800 text-ink-700 hover:bg-sage-50 w-full sm:w-auto font-sans"
              onClick={() => alert('Record link copied to clipboard')}
            >
              Share Record
            </Button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-20">
      {/* Header section with back navigation and metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/30 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/doctor/search">
            <Button variant="outline" size="icon" className="rounded-full border-border/80 h-10 w-10 hover:bg-sage-50 hover:text-sage-800">
              <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
            </Button>
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-serif text-[36px] font-semibold text-ink-900 leading-tight">
                {user.name}
              </h1>
              {profile.allergies && profile.allergies.length > 0 && (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-xs bg-status-alert/10 text-status-alert border border-status-alert">
                  Allergy: {profile.allergies[0]}
                </span>
              )}
            </div>
            <p className="text-sm text-ink-500 mt-1 font-sans">
              {patientAge} years old · Blood Group {profile.bloodGroup} · ID: {profile.mediSaarId || profile.medisaarId} · Phone: {profile.phone || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Main layout: 2/3 main, 1/3 right rail */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Main patient history and details */}
        <div className="xl:col-span-2 space-y-6">
          <HealthSnapshot profile={profile} latestVisit={latestVisit} activePrescriptions={prescriptions} />

          <Tabs defaultValue="reports" className="w-full">
            <TabsList variant="line" className="w-full justify-start border-b border-border/40 h-auto p-0 mb-6 space-x-6 overflow-x-auto">

              <TabsTrigger value="reports" className="px-0 py-3 font-sans text-[15px] font-medium text-ink-500 data-[state=active]:text-sage-800">Reports</TabsTrigger>
              <TabsTrigger value="prescriptions" className="px-0 py-3 font-sans text-[15px] font-medium text-ink-500 data-[state=active]:text-sage-800">Prescriptions</TabsTrigger>
              <TabsTrigger value="diagnoses" className="px-0 py-3 font-sans text-[15px] font-medium text-ink-500 data-[state=active]:text-sage-800">Diagnoses</TabsTrigger>
            </TabsList>
            

            
            <TabsContent value="reports">
              {reports && reports.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reports.map((r: any) => (
                    <Card key={r._id || r.id} className="cursor-pointer border-border/60 hover:border-sage-600 bg-surface shadow-soft transition-all duration-[220ms]">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.04em] rounded-xs bg-sage-50 text-sage-800 border border-sage-200 font-sans">
                            {r.reportType ? r.reportType.replace('_', ' ') : r.type.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-ink-300 font-sans">{r.reportDate ? format(new Date(r.reportDate), 'MMM dd, yyyy') : format(new Date(r.date), 'MMM dd, yyyy')}</span>
                        </div>
                        <CardTitle className="text-base font-semibold text-ink-900 font-sans mt-3">{r.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Button variant="ghost" className="w-full mt-2 h-8 text-xs text-sage-600 hover:text-sage-800 hover:bg-sage-50 font-sans" size="sm">
                          <FileText className="mr-2 h-4.5 w-4.5 text-sage-600" strokeWidth={1.5} /> View Report
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
               {prescriptions && prescriptions.length > 0 ? (
                 <div className="space-y-4">
                   {prescriptions.map((p: any) => (
                     <Card key={p._id || p.id} className="bg-surface border-border/60 shadow-soft">
                       <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                         <CardTitle className="text-sm font-semibold text-ink-900 font-sans flex items-center gap-2">
                           <Pill className="h-4 w-4 text-sage-600" strokeWidth={1.5} />
                           Prescribed on {p.createdAt ? format(new Date(p.createdAt), 'MMM dd, yyyy') : format(new Date(p.date), 'MMM dd, yyyy')}
                         </CardTitle>
                       </CardHeader>
                       <CardContent className="p-4 pt-2">
                         <ul className="space-y-2">
                           {(p.medicines || p.medications || []).map((m: any, idx: number) => (
                             <li key={idx} className="flex justify-between items-center text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0">
                               <span className="font-semibold text-ink-900 font-sans">{m.name} <span className="text-ink-500 font-normal ml-1 font-sans">({m.dosage})</span></span>
                               <span className="text-ink-500 text-xs font-sans">{m.frequency} • {m.duration}</span>
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
               {visits && visits.filter((v: any) => v.diagnosis).length > 0 ? (
                 <div className="space-y-4">
                   {visits.filter((v: any) => v.diagnosis).map((v: any) => (
                     <Card key={v._id || v.id} className="bg-surface border-border/60 shadow-soft">
                       <CardHeader className="p-4 pb-2">
                         <span className="text-xs text-ink-300 font-sans">{v.visitDate ? format(new Date(v.visitDate), 'MMM dd, yyyy') : format(new Date(v.date), 'MMM dd, yyyy')}</span>
                         <CardTitle className="text-base font-semibold text-ink-900 font-sans mt-1">{v.diagnosis}</CardTitle>
                       </CardHeader>
                       <CardContent className="p-4 pt-0">
                         <p className="text-sm text-ink-700 font-sans leading-relaxed">{v.notes}</p>
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
        
        {/* Right rail: critical status alerts, AI summaries, and actions */}
        <div className="space-y-6 xl:sticky xl:top-[88px] h-fit">
          
          {/* Emergency mode trigger panel */}
          <div className="bg-surface rounded-lg border-l-4 border-l-status-alert border-y border-r border-border/50 p-6 shadow-soft flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-status-alert uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <span className="w-2 h-2 rounded-full bg-status-alert animate-pulse" />
                Critical Context
              </span>
              <Button 
                size="sm"
                variant="destructive" 
                className="bg-status-alert hover:bg-status-alert/90 text-white font-sans text-xs h-8 px-3 rounded-sm font-semibold transition-colors duration-[140ms]"
                onClick={() => setIsEmergencyMode(true)}
              >
                Emergency Mode
              </Button>
            </div>
            <p className="text-xs text-ink-500 font-sans leading-relaxed">
              Surfaces allergies, active prescriptions, and critical chronic illnesses on a single page optimized for immediate clinical actions.
            </p>
          </div>

          <AICard 
            title="AI Clinical Summary" 
            summary={profile.currentAISummary || "No AI clinical summary generated yet."} 
          />
          
          <Card className="shadow-soft border-border bg-surface">
            <CardHeader className="pb-3 border-b border-border/30">
              <CardTitle className="text-sm font-semibold text-ink-900 font-sans">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-4">
              <Button className="w-full justify-start border-border/80 text-ink-700 hover:bg-sage-50 hover:text-sage-800 hover:border-sage-300 font-sans text-xs rounded-sm h-10 px-4" variant="outline">
                <FileText className="mr-2 h-4.5 w-4.5 text-sage-600" strokeWidth={1.5} /> Request New Report
              </Button>
              <Button className="w-full justify-start border-border/80 text-ink-700 hover:bg-sage-50 hover:text-sage-800 hover:border-sage-300 font-sans text-xs rounded-sm h-10 px-4" variant="outline">
                <Pill className="mr-2 h-4.5 w-4.5 text-sage-600" strokeWidth={1.5} /> Add Prescription
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating quiet RAG search input */}
      <div className="fixed bottom-6 right-6 z-40 max-w-sm w-full bg-surface border border-border/60 rounded-lg shadow-lift p-3 flex gap-2 items-center">
        <input 
          type="text" 
          placeholder="Ask about this patient..." 
          className="flex-1 bg-transparent border-0 outline-none text-sm font-sans text-ink-900 placeholder:text-ink-300 font-medium"
        />
        <Button size="sm" className="bg-sage-600 hover:bg-sage-800 text-white rounded-sm h-8 px-3.5 text-xs font-semibold font-sans transition-colors duration-[140ms]">
          Ask AI
        </Button>
      </div>
    </div>
  );
}

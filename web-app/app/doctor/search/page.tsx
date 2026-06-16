'use client'

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User as UserIcon, Loader2, Hospital, ActivitySquare, FileText, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { toast } from 'sonner';

interface PatientResult {
  patientId: string;
  name: string;
  mediSaarId: string;
  email: string;
  institutions: Array<{ institutionId: string; institutionName: string }>;
  recentDiagnoses: string[];
  lastVisitDate: string | null;
  totalVisits: number;
  totalReports: number;
  totalDiagnoses: number;
  currentAISummary: string | null;
}

export default function PatientSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<PatientResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/doctor/search?q=${debouncedQuery}&limit=20`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data.patients);
        } else {
          toast.error(data.message || "Failed to fetch patients");
        }
      } catch (error) {
        toast.error("Network error while searching patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [debouncedQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="text-center max-w-2xl mx-auto mt-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Global Patient Search</h1>
        <p className="text-muted-foreground mb-8">Search across all of MediSaar by name, email, or MediSaar ID to view longitudinal medical records.</p>
        
        <div className="relative max-w-xl mx-auto shadow-sm">
          <Search className="absolute left-3 top-3 h-6 w-6 text-muted-foreground" />
          <Input 
            className="h-12 pl-12 text-lg rounded-xl border-border bg-card"
            placeholder="Search patients..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map(patient => (
              <Link key={patient.patientId} href={`/doctor/patient/${patient.patientId}`}>
                <Card className="hover:border-primary transition-all cursor-pointer shadow-sm hover:shadow-md h-full flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                        <UserIcon className="h-6 w-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg leading-tight">{patient.name}</h3>
                        <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{patient.mediSaarId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 mt-2">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <ActivitySquare className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                          <span className="font-semibold">{patient.totalVisits}</span> Visits
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <FileText className="h-4 w-4 mx-auto mb-1 text-green-500" />
                          <span className="font-semibold">{patient.totalReports}</span> Reports
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <ActivitySquare className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                          <span className="font-semibold">{patient.totalDiagnoses}</span> Diagnoses
                        </div>
                      </div>

                      {patient.institutions.length > 0 && (
                        <div className="text-xs space-y-1">
                          <div className="flex items-center text-muted-foreground mb-1">
                            <Hospital className="h-3 w-3 mr-1" /> Known Institutions
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {patient.institutions.slice(0, 2).map(inst => (
                              <span key={inst.institutionId} className="bg-accent/10 text-accent px-2 py-0.5 rounded-full text-[10px]">
                                {inst.institutionName}
                              </span>
                            ))}
                            {patient.institutions.length > 2 && (
                              <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-[10px]">
                                +{patient.institutions.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {patient.recentDiagnoses.length > 0 && (
                        <div className="text-xs">
                          <span className="text-muted-foreground">Recent: </span>
                          <span className="font-medium">{patient.recentDiagnoses.join(', ')}</span>
                        </div>
                      )}

                      {patient.currentAISummary && (
                        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex gap-2">
                          <Brain className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                          <p className="text-xs text-blue-700/90 leading-relaxed line-clamp-2">
                            {patient.currentAISummary}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {results.length === 0 && (
              <div className="col-span-1 md:col-span-2 py-12 text-center text-muted-foreground">
                No patients found {searchQuery ? `matching "${searchQuery}"` : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
                <Card className="border-[#DCE8DC] hover:border-[#2E5D3F] bg-[#F7FAF7] shadow-soft rounded-[14px] transition-all cursor-pointer h-full flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-[#EEF3EC] flex items-center justify-center shrink-0">
                        <UserIcon className="h-6 w-6 text-[#2E5D3F]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-lg leading-tight text-[#1F3F2C]">{patient.name}</h3>
                        <div className="flex gap-2 text-sm text-[#5E726E] mt-1">
                          <span className="font-mono text-xs bg-[#EEF3EC] text-[#2E5D3F] border border-[#B8D0B9] px-1.5 py-0.5 rounded">{patient.mediSaarId}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 mt-2">
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-[#EEF3EC] rounded-[10px] p-2 text-[#5E726E] font-sans">
                          <ActivitySquare className="h-4 w-4 mx-auto mb-1 text-[#2E5D3F]" strokeWidth={1.5} />
                          <span className="font-semibold text-[#1F3F2C]">{patient.totalVisits}</span> Visits
                        </div>
                        <div className="bg-[#EEF3EC] rounded-[10px] p-2 text-[#5E726E] font-sans">
                          <FileText className="h-4 w-4 mx-auto mb-1 text-[#2E5D3F]" strokeWidth={1.5} />
                          <span className="font-semibold text-[#1F3F2C]">{patient.totalReports}</span> Reports
                        </div>
                        <div className="bg-[#EEF3EC] rounded-[10px] p-2 text-[#5E726E] font-sans">
                          <ActivitySquare className="h-4 w-4 mx-auto mb-1 text-[#2E5D3F]" strokeWidth={1.5} />
                          <span className="font-semibold text-[#1F3F2C]">{patient.totalDiagnoses}</span> Diagnoses
                        </div>
                      </div>

                      {patient.institutions.length > 0 && (
                        <div className="text-xs space-y-1">
                          <div className="flex items-center text-[#5E726E] mb-1 font-sans">
                            <Hospital className="h-3 w-3 mr-1 text-[#2E5D3F]" strokeWidth={1.5} /> Known Institutions
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {patient.institutions.slice(0, 2).map(inst => (
                              <span key={inst.institutionId} className="bg-[#EEF3EC] text-[#2E5D3F] border border-[#B8D0B9] px-2 py-0.5 rounded-full text-[10px] font-sans">
                                {inst.institutionName}
                              </span>
                            ))}
                            {patient.institutions.length > 2 && (
                              <span className="bg-[#DCE8DC] text-[#5E726E] px-2 py-0.5 rounded-full text-[10px] font-sans">
                                +{patient.institutions.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {patient.recentDiagnoses.length > 0 && (
                        <div className="text-xs font-sans text-[#5E726E]">
                          <span className="text-[#5E726E]">Recent: </span>
                          <span className="font-semibold text-[#1F3F2C]">{patient.recentDiagnoses.join(', ')}</span>
                        </div>
                      )}

                      {patient.currentAISummary && (
                        <div className="mt-4 p-3 bg-[#F7FAF7] border-l-[3px] border-l-[#E0902C] border-y border-r border-[#DCE8DC] rounded-r-[10px] flex gap-2">
                          <Brain className="h-4 w-4 text-[#E0902C] shrink-0 mt-0.5" strokeWidth={1.5} />
                          <p className="text-xs text-[#E0902C] leading-relaxed line-clamp-2 font-sans">
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
              <div className="col-span-1 md:col-span-2 py-12 text-center text-[#5E726E] font-sans">
                No patients found {searchQuery ? `matching "${searchQuery}"` : ''}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

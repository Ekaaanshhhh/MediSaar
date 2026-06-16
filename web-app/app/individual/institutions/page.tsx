'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Calendar, MapPin, ArrowRight, Loader2, Info } from 'lucide-react';
import { format } from 'date-fns';

interface InstitutionSummary {
  institutionId: string;
  institutionName: string;
  institutionType: string;
  totalVisits: number;
  lastVisitDate: string;
}

export default function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<InstitutionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        const res = await fetch('/api/individual/institutions');
        const data = await res.json();
        if (data.success) {
          setInstitutions(data.data);
        } else {
          setError(data.message || 'Failed to fetch institutions');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchInstitutions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Info className="h-10 w-10 text-destructive mb-4" />
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (institutions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-card border rounded-2xl p-12 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-primary mb-2">No Institutions Visited</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            You haven't visited any institutions in the MediSaar network yet. 
            Once you do, your medical history will automatically appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight">Institutions Visited</h1>
        <p className="text-muted-foreground mt-2">
          View your complete healthcare journey across all MediSaar-enabled institutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {institutions.map((inst) => (
          <Link 
            key={inst.institutionId} 
            href={`/individual/institutions/${inst.institutionId}`}
            className="group"
          >
            <div className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all hover:border-primary/50 relative flex flex-col h-full">
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                    {inst.institutionType}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {inst.institutionName}
                </h3>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ActivitySquare className="h-4 w-4 mr-2" />
                    <span>{inst.totalVisits} {inst.totalVisits === 1 ? 'Visit' : 'Visits'}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {inst.lastVisitDate 
                        ? `Last Visit: ${format(new Date(inst.lastVisitDate), 'dd MMM yyyy')}` 
                        : 'No visits yet'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-muted/50 border-t flex items-center text-sm font-medium text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                View Medical History
                <ArrowRight className="ml-auto h-4 w-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ActivitySquare({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M17 12h-2l-2 5-2-10-2 5H7" />
    </svg>
  );
}

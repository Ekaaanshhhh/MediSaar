'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Calendar, FileText, ActivitySquare, Pill, FileSymlink, 
  ArrowLeft, Loader2, Info, Clock, User as UserIcon
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';



interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface Visit {
  visitId: string;
  visitDate: string;
  chiefComplaint: string;
  status: string;
  doctor: Doctor | null;
  diagnoses: any[];
  prescriptions: any[];
  reports: any[];
  aiSummaries: any[];
}

interface HistoryData {
  institution: {
    id: string;
    name: string;
    type: string;
  };
  summary: {
    totalVisits: number;
    totalDiagnoses: number;
    totalReports: number;
    totalPrescriptions: number;
    firstVisit: string;
    lastVisit: string;
  };

  visits: Visit[];
}

export default function InstitutionHistoryPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`/api/individual/institutions/${resolvedParams.institutionId}`);
        const result = await res.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch history');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [resolvedParams.institutionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Info className="h-10 w-10 text-destructive mb-4" />
        <p className="text-destructive font-medium">{error || 'Data not found'}</p>
        <button 
          onClick={() => router.push('/individual/institutions')}
          className="mt-4 text-sm text-primary hover:underline"
        >
          Return to Institutions
        </button>
      </div>
    );
  }

  const { institution, summary, visits } = data;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'VISIT': return <ActivitySquare className="h-4 w-4" />;
      case 'DIAGNOSIS': return <FileSymlink className="h-4 w-4" />;
      case 'PRESCRIPTION': return <Pill className="h-4 w-4" />;
      case 'REPORT': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'VISIT': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DIAGNOSIS': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'PRESCRIPTION': return 'bg-green-100 text-green-700 border-green-200';
      case 'REPORT': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/individual/institutions" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{institution.name}</h1>
              <span className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-accent border border-accent/20">
                {institution.type}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Medical History & Records</p>
          </div>
        </div>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-card border rounded-xl p-4 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <ActivitySquare className="h-4 w-4" />
            <span className="text-xs font-medium">Total Visits</span>
          </div>
          <span className="text-2xl font-bold">{summary.totalVisits}</span>
        </div>
        <div className="bg-card border rounded-xl p-4 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FileSymlink className="h-4 w-4" />
            <span className="text-xs font-medium">Diagnoses</span>
          </div>
          <span className="text-2xl font-bold">{summary.totalDiagnoses}</span>
        </div>
        <div className="bg-card border rounded-xl p-4 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Pill className="h-4 w-4" />
            <span className="text-xs font-medium">Prescriptions</span>
          </div>
          <span className="text-2xl font-bold">{summary.totalPrescriptions}</span>
        </div>
        <div className="bg-card border rounded-xl p-4 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <FileText className="h-4 w-4" />
            <span className="text-xs font-medium">Reports</span>
          </div>
          <span className="text-2xl font-bold">{summary.totalReports}</span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Detailed Visits Reference */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold border-b pb-2">Visit Details</h2>
          
          <div className="space-y-4">
            {visits.map((visit) => (
              <div key={visit.visitId} className="bg-muted/30 border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-medium text-primary">
                    {format(new Date(visit.visitDate), 'dd MMM yyyy')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-border text-muted-foreground uppercase">
                    {visit.status}
                  </span>
                </div>
                
                <p className="text-sm font-medium mb-3">{visit.chiefComplaint}</p>
                
                {visit.doctor && (
                  <div className="flex items-center gap-2 mb-3 bg-card p-2 rounded-md border text-xs">
                    <UserIcon className="h-3 w-3 text-muted-foreground" />
                    <div>
                      <span className="block font-medium">{visit.doctor.name}</span>
                      <span className="block text-muted-foreground">{visit.doctor.specialization}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  {visit.diagnoses.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-orange-100 text-orange-700">
                      {visit.diagnoses.length} Diagnoses
                    </span>
                  )}
                  {visit.prescriptions.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-green-100 text-green-700">
                      {visit.prescriptions.length} Prescriptions
                    </span>
                  )}
                  {visit.reports.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                      {visit.reports.length} Reports
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

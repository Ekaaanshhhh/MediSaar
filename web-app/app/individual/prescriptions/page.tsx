'use client';

import { useState, useEffect } from 'react';
import { Pill, Building2, Calendar, Loader2, Info, Eye, Download, X } from 'lucide-react';
import { format } from 'date-fns';

interface Institution {
  id: string;
  name: string;
}

interface PrescriptionScan {
  id: string;
  title: string;
  date: string;
  thumbnailUrl: string;
  viewUrl: string;
  institution: Institution | null;
}

interface PrescriptionSummary {
  totalPrescriptions: number;
}

interface PrescriptionsResponse {
  summary: PrescriptionSummary;
  prescriptions: PrescriptionScan[];
}

export default function IndividualPrescriptionsPage() {
  const [data, setData] = useState<PrescriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScan, setSelectedScan] = useState<PrescriptionScan | null>(null);

  useEffect(() => {
    async function fetchPrescriptions() {
      setLoading(true);
      try {
        const res = await fetch('/api/individual/prescriptions');
        const result = await res.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch prescriptions');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPrescriptions();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Info className="h-10 w-10 text-destructive mb-4" />
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground mt-2">
            A complete history of your prescriptions uploaded by your healthcare providers.
          </p>
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Grid */}
          {data && data.summary.totalPrescriptions > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Prescriptions</span>
                <span className="text-2xl font-bold text-foreground">{data.summary.totalPrescriptions}</span>
              </div>
            </div>
          )}

          {/* Grid or Empty State */}
          {!data || data.summary.totalPrescriptions === 0 ? (
            <div className="bg-card border rounded-2xl p-12 text-center shadow-sm mt-8">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <Pill className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-primary mb-2">No prescriptions found.</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Any prescriptions uploaded by your healthcare providers will appear safely here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.prescriptions.map((prescription) => (
                <div 
                  key={prescription.id} 
                  className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all group cursor-pointer flex flex-col h-full relative"
                  onClick={() => setSelectedScan(prescription)}
                >
                  {/* Thumbnail */}
                  <div className="h-48 w-full bg-muted relative overflow-hidden">
                    <img 
                      src={prescription.thumbnailUrl} 
                      alt={prescription.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-background/90 text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 backdrop-blur-sm">
                        <Eye className="h-4 w-4" />
                        Preview
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2">
                      {prescription.title}
                    </h3>
                    
                    <div className="mt-auto space-y-2.5">
                      {prescription.institution && (
                        <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded border">
                          <Building2 className="h-4 w-4 mr-2 shrink-0 text-primary" />
                          <span className="truncate">
                            {prescription.institution.name}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          <span>{format(new Date(prescription.date), 'dd MMM yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div 
            className="bg-card border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b bg-muted/30">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedScan.title}</h2>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(selectedScan.date), 'dd MMM yyyy')}
                  </span>
                  {selectedScan.institution && (
                    <span className="flex items-center gap-1 truncate max-w-[200px]">
                      <Building2 className="h-3.5 w-3.5" />
                      {selectedScan.institution.name}
                    </span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedScan(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-auto bg-muted/10 p-6 flex flex-col items-center">
              <div className="w-full max-w-3xl bg-white border rounded-xl shadow-sm overflow-hidden min-h-[500px] flex items-center justify-center">
                <img 
                  src={selectedScan.viewUrl} 
                  alt={selectedScan.title}
                  className="max-w-full max-h-[800px] object-contain"
                />
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t bg-card flex justify-end gap-3">
              <button 
                onClick={() => setSelectedScan(null)}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                onClick={() => window.open(selectedScan.viewUrl, '_blank')}
              >
                <Download className="h-4 w-4" />
                Download Original
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

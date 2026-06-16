'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  FileText, Search, Loader2, Info, Building2, Calendar, 
  Eye, Download, Filter, FileSymlink, Pill, ArrowRight, X
} from 'lucide-react';
import { format } from 'date-fns';

interface Institution {
  id: string;
  name: string;
  type: string;
}

interface Report {
  reportId: string;
  title: string;
  reportType: string;
  institution: Institution | null;
  uploadedByInstitution: Institution | null;
  visitId: string | null;
  reportDate: string;
  extractedText: string | null;
  thumbnailUrl: string;
  viewUrl: string;
}

interface ReportSummary {
  totalReports: number;
  bloodReports?: number;
  xrayReports?: number;
  mriReports?: number;
  ctScanReports?: number;
  labReports?: number;
  prescriptionScans?: number;
  dischargeSummaries?: number;
  invoices?: number;
}

interface ReportsResponse {
  summary: ReportSummary;
  reports: Report[];
}

export default function IndividualReportsPage() {
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('ALL');
  
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      try {
        const url = new URL('/api/individual/reports', window.location.origin);
        if (debouncedQuery) {
          url.searchParams.set('q', debouncedQuery);
        }
        const res = await fetch(url.toString());
        const result = await res.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch reports');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [debouncedQuery]);

  const filteredReports = useMemo(() => {
    if (!data) return [];
    if (activeTypeFilter === 'ALL') return data.reports;
    return data.reports.filter(r => r.reportType === activeTypeFilter);
  }, [data, activeTypeFilter]);

  const availableFilters = useMemo(() => {
    if (!data) return [{ label: 'All Reports', value: 'ALL' }];
    const types = new Set(data.reports.map(r => r.reportType));
    const filters = [{ label: 'All Reports', value: 'ALL' }];
    types.forEach(t => {
      filters.push({
        label: t.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
        value: t
      });
    });
    return filters;
  }, [data]);

  const formatReportType = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const getReportTypeIcon = (type: string) => {
    if (type.includes('PRESCRIPTION')) return <Pill className="h-5 w-5" />;
    if (type.includes('BLOOD') || type.includes('LAB')) return <FileSymlink className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const getReportColorClass = (type: string) => {
    if (type.includes('PRESCRIPTION')) return 'bg-green-100 text-green-700 border-green-200';
    if (type.includes('BLOOD') || type.includes('LAB')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (type.includes('XRAY') || type.includes('MRI') || type.includes('CT')) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-purple-100 text-purple-700 border-purple-200';
  };

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
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Medical Reports</h1>
          <p className="text-muted-foreground mt-2">
            Your centralized repository of test results, scans, and documents across all institutions.
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reports, text, or institutions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Grid */}
          {data && data.summary.totalReports > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Reports</span>
                <span className="text-2xl font-bold text-foreground">{data.summary.totalReports}</span>
              </div>
              {data.summary.bloodReports !== undefined && (
                <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Blood Reports</span>
                  <span className="text-2xl font-bold text-foreground">{data.summary.bloodReports}</span>
                </div>
              )}
              {data.summary.xrayReports !== undefined && (
                <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">X-Rays</span>
                  <span className="text-2xl font-bold text-foreground">{data.summary.xrayReports}</span>
                </div>
              )}
              {data.summary.labReports !== undefined && (
                <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col justify-center">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Lab Reports</span>
                  <span className="text-2xl font-bold text-foreground">{data.summary.labReports}</span>
                </div>
              )}
            </div>
          )}

          {/* Filters */}
          {data && data.summary.totalReports > 0 && (
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
              <Filter className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
              {availableFilters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setActiveTypeFilter(filter.value)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTypeFilter === filter.value 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80 border'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}

          {/* Report Grid or Empty State */}
          {!data || data.summary.totalReports === 0 ? (
            <div className="bg-card border rounded-2xl p-12 text-center shadow-sm mt-8">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-primary mb-2">No reports uploaded yet.</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Any medical reports, scans, or prescriptions uploaded by your healthcare providers will appear safely in this centralized repository.
              </p>
            </div>
          ) : filteredReports.length === 0 ? (
             <div className="py-12 text-center">
               <p className="text-muted-foreground">No reports match your current filter or search.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <div 
                  key={report.reportId} 
                  className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-all group cursor-pointer flex flex-col h-full relative"
                  onClick={() => setSelectedReport(report)}
                >
                  {/* Thumbnail */}
                  <div className="h-48 w-full bg-muted relative overflow-hidden">
                    <img 
                      src={report.thumbnailUrl} 
                      alt={report.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-background/90 text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 backdrop-blur-sm">
                        <Eye className="h-4 w-4" />
                        Preview
                      </div>
                    </div>
                    {/* Badge */}
                    <div className={`absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-semibold border shadow-sm flex items-center gap-1.5 ${getReportColorClass(report.reportType)}`}>
                      {formatReportType(report.reportType)}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2">
                      {report.title}
                    </h3>
                    
                    <div className="mt-auto space-y-2.5">
                      <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded border">
                        <Building2 className="h-4 w-4 mr-2 shrink-0 text-primary" />
                        <span className="truncate">
                          {report.institution?.name || report.uploadedByInstitution?.name || 'Unknown Institution'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          <span>{format(new Date(report.reportDate), 'dd MMM yyyy')}</span>
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
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div 
            className="bg-card border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b bg-muted/30">
              <div>
                <h2 className="text-xl font-bold text-foreground">{selectedReport.title}</h2>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getReportColorClass(selectedReport.reportType)}`}>
                    {formatReportType(selectedReport.reportType)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(selectedReport.reportDate), 'dd MMM yyyy')}
                  </span>
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <Building2 className="h-3.5 w-3.5" />
                    {selectedReport.institution?.name || selectedReport.uploadedByInstitution?.name || 'Unknown'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-auto bg-muted/10 p-6 flex flex-col items-center">
              <div className="w-full max-w-3xl bg-white border rounded-xl shadow-sm overflow-hidden min-h-[500px] flex items-center justify-center">
                {/* Simulated Document View using Placeholder */}
                <img 
                  src={selectedReport.viewUrl} 
                  alt="Full Report Document" 
                  className="max-w-full max-h-[800px] object-contain"
                />
              </div>
              
              {/* Optional OCR Text Extracted */}
              {selectedReport.extractedText && (
                <div className="w-full max-w-3xl mt-6 bg-card border rounded-xl p-5">
                  <h4 className="text-sm font-semibold mb-3 flex items-center text-primary">
                    <FileText className="h-4 w-4 mr-2" />
                    Extracted Text (OCR)
                  </h4>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted/50 p-4 rounded border">
                    {selectedReport.extractedText}
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t bg-card flex justify-end gap-3">
              <button 
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                Close
              </button>
              <button 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                onClick={() => window.open(selectedReport.viewUrl, '_blank')}
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

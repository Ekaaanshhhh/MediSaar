'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Hospital, Users, ActivitySquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InstitutionStat {
  institution: {
    institutionId: string;
    institutionName: string;
    institutionType: string;
  };
  stats: {
    totalPatientsSeen: number;
    totalVisits: number;
  };
}

export default function DoctorInstitutionsPage() {
  const [institutions, setInstitutions] = useState<InstitutionStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await fetch('/api/doctor/institutions');
        const data = await res.json();
        if (data.success) {
          setInstitutions(data.data);
        } else {
          toast.error(data.message || "Failed to fetch institutions");
        }
      } catch (error) {
        toast.error("Network error while loading institutions");
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Institutions</h2>
          <p className="text-muted-foreground">Hospitals and clinics you are formally associated with.</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Institutions</h2>
        <p className="text-muted-foreground">Hospitals and clinics you are formally associated with.</p>
      </div>

      {institutions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Hospital className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mb-2">No Associations Yet</CardTitle>
          <CardDescription>
            You are not formally associated with any institutions in MediSaar.
          </CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {institutions.map((item) => (
            <Card key={item.institution.institutionId} className="flex flex-col">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Hospital className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.institution.institutionName}</CardTitle>
                    <CardDescription className="uppercase text-xs font-semibold tracking-wider">
                      {item.institution.institutionType}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> Unique Patients
                  </span>
                  <span className="text-2xl font-bold">{item.stats.totalPatientsSeen}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ActivitySquare className="h-3 w-3" /> Total Visits
                  </span>
                  <span className="text-2xl font-bold">{item.stats.totalVisits}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, AlertCircle, Droplet, Pill, CalendarHeart } from 'lucide-react';
import { IndividualProfile, Prescription, Visit } from '@/types';
import { format } from 'date-fns';

interface HealthSnapshotProps {
  profile?: IndividualProfile;
  latestVisit?: Visit;
  activePrescriptions?: Prescription[];
}

export function HealthSnapshot({ profile, latestVisit, activePrescriptions = [] }: HealthSnapshotProps) {
  if (!profile) return null;

  const currentMedications = activePrescriptions.flatMap(p => p.medications);
  
  // Mock risk calculation based on conditions
  const hasHighRisk = profile.currentConditions.some(c => 
    c.toLowerCase().includes('diabetes') || c.toLowerCase().includes('hypertension')
  );

  return (
    <Card className="shadow-soft border-border bg-surface">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-ink-900 font-sans">
            <Activity className="h-5 w-5 text-sage-600" strokeWidth={1.5} />
            Health Snapshot
          </CardTitle>
          {hasHighRisk && (
            <Badge variant="destructive" className="bg-status-alert/10 text-status-alert border border-status-alert/35 flex items-center gap-1 font-sans">
              <AlertCircle className="h-3 w-3" strokeWidth={1.5} />
              High Risk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Row: Blood Group & Last Visit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 border border-border/50 rounded-lg p-3 bg-canvas">
            <span className="text-xs text-ink-500 font-sans flex items-center gap-1">
              <Droplet className="h-3 w-3 text-status-alert" strokeWidth={1.5} />
              Blood Group
            </span>
            <span className="font-semibold text-ink-900 font-sans">{profile.bloodGroup}</span>
          </div>
          <div className="flex flex-col gap-1 border border-border/50 rounded-lg p-3 bg-canvas">
            <span className="text-xs text-ink-500 font-sans flex items-center gap-1">
              <CalendarHeart className="h-3 w-3 text-sage-600" strokeWidth={1.5} />
              Last Visit
            </span>
            <span className="font-semibold text-ink-900 font-sans">
              {latestVisit ? format(new Date(latestVisit.date), 'MMM dd, yyyy') : 'No recent visits'}
            </span>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* Conditions & Allergies */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-sm font-medium text-ink-500 font-sans">Current Conditions</span>
            <div className="flex flex-wrap gap-2">
              {profile.currentConditions.length > 0 ? (
                profile.currentConditions.map(condition => (
                  <span key={condition} className="px-2.5 py-1 text-xs font-normal rounded-xs bg-sage-50 text-sage-800 border border-sage-200">
                    {condition}
                  </span>
                ))
              ) : (
                <span className="text-sm text-ink-300 font-sans italic">None reported</span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm font-medium text-ink-500 font-sans">Allergies</span>
            <div className="flex flex-wrap gap-2">
              {profile.allergies.length > 0 ? (
                profile.allergies.map(allergy => (
                  <span key={allergy} className="px-2.5 py-1 text-xs font-normal rounded-xs bg-status-alert/10 text-status-alert border border-status-alert">
                    {allergy}
                  </span>
                ))
              ) : (
                <span className="text-sm text-ink-300 font-sans italic">None reported</span>
              )}
            </div>
          </div>
        </div>

        <Separator className="bg-border/30" />

        {/* Medications */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-ink-500 font-sans flex items-center gap-2">
            <Pill className="h-4 w-4 text-sage-600" strokeWidth={1.5} />
            Active Medications
          </span>
          {currentMedications.length > 0 ? (
            <ul className="space-y-2">
              {currentMedications.map((med, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm border-b border-border/30 pb-2 last:border-0 last:pb-0">
                  <span className="font-semibold text-ink-900 font-sans">{med.name} <span className="text-ink-500 font-normal ml-1 font-sans">({med.dosage})</span></span>
                  <span className="text-ink-500 text-xs font-sans">{med.frequency}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm text-ink-300 font-sans italic block">No active medications</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

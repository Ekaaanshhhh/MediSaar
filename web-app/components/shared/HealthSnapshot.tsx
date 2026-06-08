import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, AlertCircle, Droplet, Pill, CalendarHeart } from 'lucide-react';
import { IndividualProfile, Prescription, Visit } from '@/data/mockData';
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
    <Card className="shadow-sm border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Health Snapshot
          </CardTitle>
          {hasHighRisk && (
            <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              High Risk
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Top Row: Blood Group & Last Visit */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 border rounded-lg p-3 bg-muted/30">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Droplet className="h-3 w-3 text-red-500" />
              Blood Group
            </span>
            <span className="font-medium">{profile.bloodGroup}</span>
          </div>
          <div className="flex flex-col gap-1 border rounded-lg p-3 bg-muted/30">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarHeart className="h-3 w-3 text-primary" />
              Last Visit
            </span>
            <span className="font-medium">
              {latestVisit ? format(new Date(latestVisit.date), 'MMM dd, yyyy') : 'No recent visits'}
            </span>
          </div>
        </div>

        <Separator />

        {/* Conditions & Allergies */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Current Conditions</span>
            <div className="flex flex-wrap gap-2">
              {profile.currentConditions.length > 0 ? (
                profile.currentConditions.map(condition => (
                  <Badge key={condition} variant="secondary" className="font-normal">{condition}</Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">None reported</span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Allergies</span>
            <div className="flex flex-wrap gap-2">
              {profile.allergies.length > 0 ? (
                profile.allergies.map(allergy => (
                  <Badge key={allergy} variant="outline" className="text-destructive border-destructive/30 font-normal">{allergy}</Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">None reported</span>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Medications */}
        <div className="space-y-3">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Pill className="h-4 w-4 text-accent" />
            Active Medications
          </span>
          {currentMedications.length > 0 ? (
            <ul className="space-y-2">
              {currentMedications.map((med, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <span className="font-medium">{med.name} <span className="text-muted-foreground font-normal ml-1">({med.dosage})</span></span>
                  <span className="text-muted-foreground text-xs">{med.frequency}</span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm text-muted-foreground block">No active medications</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

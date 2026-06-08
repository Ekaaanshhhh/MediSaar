'use client'
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Stethoscope, FileText, AlertCircle } from 'lucide-react';
import { AICard } from '@/components/shared/AICard';

export default function InstitutionDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{user.name} Dashboard</h1>
        <p className="text-muted-foreground">Manage your institution's healthcare operations.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { title: 'Total Patients', value: '1,204', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { title: 'New Admissions', value: '28', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { title: 'Active Doctors', value: '45', icon: Stethoscope, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { title: 'Reports Uploaded', value: '312', icon: FileText, color: 'text-accent', bg: 'bg-accent/10' },
          { title: 'Pending Follow-Ups', value: '14', icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className={`h-8 w-8 rounded-full ${stat.bg} flex items-center justify-center shrink-0 mb-2`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <div>
                <h3 className="text-2xl font-bold leading-none">{stat.value}</h3>
                <p className="text-xs font-medium text-muted-foreground mt-1">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Card className="shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg">Recent Admissions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {['John Doe - Cardiology', 'Jane Smith - Pulmonology', 'Alice Johnson - Endocrinology'].map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0">
                    <span className="font-medium">{item.split(' - ')[0]}</span>
                    <span className="text-xs text-muted-foreground">{item.split(' - ')[1]}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <AICard 
            title="AI Operations Insight" 
            summary="Cardiology department is experiencing 20% higher patient volume this week. 14 patients require follow-up scheduling." 
          />
        </div>
      </div>
    </div>
  );
}

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
        <h1 className="font-serif text-[36px] font-semibold text-ink-900 leading-tight">{user.name} Dashboard</h1>
        <p className="text-ink-500 mt-1">Manage your institution&apos;s healthcare operations.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { title: 'Total Patients', value: '1,204', icon: Users },
          { title: 'New Admissions', value: '28', icon: UserPlus },
          { title: 'Active Doctors', value: '45', icon: Stethoscope },
          { title: 'Reports Uploaded', value: '312', icon: FileText },
          { title: 'Pending Follow-Ups', value: '14', icon: AlertCircle },
        ].map((stat, i) => (
          <Card key={i} className="shadow-sm border-border bg-surface">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-sage-50 flex items-center justify-center shrink-0">
                <stat.icon className="h-6 w-6 text-sage-400" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[13px] font-medium uppercase tracking-[0.06em] text-ink-500 font-sans">{stat.title}</p>
                <h3 className="font-serif text-[48px] font-semibold text-ink-900 leading-none mt-1">{stat.value}</h3>
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

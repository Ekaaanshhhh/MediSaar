'use client'
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Building, TrendingUp } from 'lucide-react';
import { AICard } from '@/components/shared/AICard';

export default function DoctorDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-[36px] font-semibold text-ink-900 leading-tight">Welcome, {user.name}</h1>
        <p className="text-ink-500 mt-1">Overview of your consultations and patients.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Patients Diagnosed', value: '142', icon: Users },
          { title: 'Consultations (Mo)', value: '38', icon: TrendingUp },
          { title: 'Reports Reviewed', value: '56', icon: FileText },
          { title: 'Institutions', value: '2', icon: Building },
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
              <CardTitle className="text-lg">Recently Viewed Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {['John Doe', 'Jane Smith', 'Alice Johnson'].map((name, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0">
                    <span className="font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground">Viewed 2 hrs ago</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <AICard 
            title="AI Clinical Insights" 
            summary="3 of your diabetic patients have shown elevated HbA1c levels in recent reports. Consider scheduling follow-up consultations." 
          />
        </div>
      </div>
    </div>
  );
}

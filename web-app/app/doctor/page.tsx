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

      <div className="flex flex-col items-center justify-center h-[40vh] text-center border border-dashed border-border rounded-xl bg-surface/50">
        <h3 className="text-lg font-semibold text-ink-900 font-serif">No dashboard data available yet.</h3>
        <p className="text-sm text-ink-500 mt-2 max-w-md">
          Dashboard metrics will appear once data is available and the backend integration is complete.
        </p>
      </div>
    </div>
  );
}

'use client'
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Wait until loading is false before redirecting
    if (!loading && !user && !pathname.includes('/login') && !pathname.includes('/signup') && pathname !== '/') {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);

  if (!mounted || loading) return null; // Can replace with a spinner later
  if (!user) return null; 

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col max-w-full overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

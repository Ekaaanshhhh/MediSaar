'use client';

import { Button } from '@/components/ui/button';
import { SearchX, Home, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-8 shadow-sm border border-border">
          <SearchX className="h-10 w-10 text-muted-foreground" />
        </div>
        
        <h1 className="text-6xl font-bold text-primary mb-4 font-serif">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-3">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-10">
          The page you are looking for doesn't exist or has been moved. 
          Please check the URL or navigate back to the dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 min-w-[140px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          
          <Button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 min-w-[140px]"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}

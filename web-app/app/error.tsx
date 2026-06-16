'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full bg-card border rounded-2xl shadow-lg p-8">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-3 font-serif">Something went wrong</h1>
        
        <p className="text-muted-foreground mb-8">
          We apologize for the inconvenience. An unexpected error has occurred while processing your request. Our engineering team has been notified.
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={reset}
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

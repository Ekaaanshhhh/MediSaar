import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-foreground font-serif">Loading</h3>
      <p className="text-sm text-muted-foreground mt-1 animate-pulse">
        Please wait while we retrieve your information...
      </p>
    </div>
  );
}

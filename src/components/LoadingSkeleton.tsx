'use client';

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="space-y-6 text-center">
        <div className="relative">
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-muted border-t-primary animate-spin" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 bg-muted rounded mx-auto animate-pulse" />
          <div className="h-3 w-24 bg-muted/60 rounded mx-auto animate-pulse delay-75" />
        </div>
      </div>
    </div>
  );
}

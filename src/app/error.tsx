'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string; };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);

    // This is the specific fix for the ChunkLoadError.
    // If the error is a chunk loading error, we'll force a page reload.
    if (error.name === 'ChunkLoadError') {
      window.location.reload();
    }
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen items-center justify-center bg-background p-4">
          <Card className="max-w-md text-center">
            <CardHeader>
              <div className="mx-auto bg-destructive/20 p-3 rounded-full w-fit">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="mt-4">Something Went Wrong</CardTitle>
              <CardDescription>
                An unexpected error occurred. You can try to reload the page or come back later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => reset()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}

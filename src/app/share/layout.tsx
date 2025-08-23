
import React from 'react';

// This is a minimal layout for the share page.
// It ensures that the shared content is displayed on a clean page
// without the main application's header or other navigation elements.
export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <main>{children}</main>
    </div>
  );
}

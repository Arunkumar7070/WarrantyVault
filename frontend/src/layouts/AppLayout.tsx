import { Outlet } from "react-router-dom";

import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>WarrantyVault — Own it. Transfer it. Verify it.</p>
        <p className="mt-1 font-mono text-xs">
          Built by <span className="gradient-text font-medium">arunkumar7070.base.eth</span>
        </p>
      </footer>
      <Toaster />
    </div>
  );
}

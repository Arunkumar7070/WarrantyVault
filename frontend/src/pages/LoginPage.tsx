import { ShieldCheck, Wallet } from "lucide-react";
import { Navigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export function LoginPage() {
  const { isAuthenticated } = useAuth();
  const { connectAndLogin, connecting } = useWalletAuth();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 sm:px-6">
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <ShieldCheck className="size-10 text-primary" />
          <CardTitle className="text-xl">Sign in to WarrantyVault</CardTitle>
          <CardDescription>
            Connect your wallet and sign a free message to prove ownership. No gas fees, no passwords.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" size="lg" onClick={connectAndLogin} disabled={connecting}>
            <Wallet />
            {connecting ? "Waiting for MetaMask…" : "Connect MetaMask"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

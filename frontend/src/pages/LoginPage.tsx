import { ShieldCheck } from "lucide-react";
import { Navigate } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectWalletButton } from "@/components/wallet/ConnectWalletButton";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const { isAuthenticated } = useAuth();

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
          <ConnectWalletButton className="w-full" size="lg" idleLabel="Connect Wallet" connectingLabel="Waiting for wallet…" />
        </CardContent>
      </Card>
    </div>
  );
}

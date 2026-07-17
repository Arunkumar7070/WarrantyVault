import { ChevronRight, Smartphone, Wallet } from "lucide-react";
import { useState } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { cn } from "@/utils/cn";

interface ConnectWalletButtonProps {
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  className?: string;
  idleLabel?: string;
  connectingLabel?: string;
  showIcon?: boolean;
}

export function ConnectWalletButton({
  size = "default",
  variant = "default",
  className,
  idleLabel = "Connect Wallet",
  connectingLabel = "Connecting…",
  showIcon = true,
}: ConnectWalletButtonProps) {
  const { connectAndLogin, connecting } = useWalletAuth();
  const [open, setOpen] = useState(false);

  function handleSelect(method: "injected" | "walletconnect") {
    setOpen(false);
    void connectAndLogin(method);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} className={cn(className)} disabled={connecting}>
          {showIcon && <Wallet />}
          {connecting ? connectingLabel : idleLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect your wallet</DialogTitle>
          <DialogDescription>Choose how you'd like to sign in to WarrantyVault.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleSelect("injected")}
            className="glass flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/50 hover:bg-secondary"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-1/20 to-brand-2/20">
              <Wallet className="size-5 text-primary" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">Browser Wallet</span>
              <span className="block text-xs text-muted-foreground">MetaMask or another extension in this browser</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={() => handleSelect("walletconnect")}
            className="glass flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:border-primary/50 hover:bg-secondary"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-1/20 to-brand-2/20">
              <Smartphone className="size-5 text-primary" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-medium">Mobile Wallet</span>
              <span className="block text-xs text-muted-foreground">Scan a QR code with MetaMask, Trust Wallet, Rainbow, etc.</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { motion } from "framer-motion";
import { FileCheck2, QrCode, ShieldCheck, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useWalletAuth } from "@/hooks/useWalletAuth";

const features = [
  {
    icon: ShieldCheck,
    title: "Tamper-proof warranties",
    description: "Every product gets an immutable, blockchain-backed warranty record that can't be forged or lost.",
  },
  {
    icon: Wallet,
    title: "Transfer with a wallet",
    description: "Selling a product? Transfer warranty ownership to the buyer's wallet in one signed transaction.",
  },
  {
    icon: QrCode,
    title: "Instant QR verification",
    description: "Service centers scan a QR code to confirm warranty validity in seconds — no paperwork required.",
  },
  {
    icon: FileCheck2,
    title: "Invoices on IPFS",
    description: "Invoices are pinned to IPFS; the chain stores only the CID, so proof of purchase never fades or disappears.",
  },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { connectAndLogin, connecting } = useWalletAuth();

  return (
    <div>
      <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 overflow-hidden px-4 py-24 text-center sm:px-6">
        <div className="bg-grid pointer-events-none absolute inset-0 -z-20" />
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-1 to-brand-2 opacity-25 blur-[100px]" />

        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-secondary-foreground"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-1 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-brand-1" />
          </span>
          Built on Base Sepolia
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          Own it. Transfer it. <span className="gradient-text">Verify it.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl text-lg text-muted-foreground"
        >
          WarrantyVault replaces paper warranty cards with secure, digital warranties on the blockchain —
          register products, transfer ownership, and verify authenticity in seconds.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {isAuthenticated ? (
            <Button size="lg" asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button size="lg" onClick={connectAndLogin} disabled={connecting}>
              {connecting ? "Connecting…" : "Connect Wallet to Start"}
            </Button>
          )}
          <Button size="lg" variant="outline" asChild>
            <Link to="/verify">Verify a Warranty</Link>
          </Button>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <span className="flex size-11 items-center justify-center rounded-lg bg-gradient-to-br from-brand-1/20 to-brand-2/20">
                    <feature.icon className="size-5 text-primary" />
                  </span>
                  <CardTitle className="mt-2 text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{feature.description}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

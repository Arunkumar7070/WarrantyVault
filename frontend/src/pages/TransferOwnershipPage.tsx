import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { apiErrorMessage } from "@/services/apiClient";
import { getProduct, transferProduct } from "@/services/productService";
import { sendTransferTransaction } from "@/services/walletService";
import { toast } from "@/store/toastStore";
import type { Product } from "@/types";

const schema = z.object({
  toWallet: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid wallet address (0x...)"),
});

type FormValues = z.infer<typeof schema>;

type Step = "idle" | "signing" | "confirming" | "recording";

export function TransferOwnershipPage() {
  const { productId = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [step, setStep] = useState<Step>("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    getProduct(productId)
      .then(setProduct)
      .catch((error) => toast({ title: "Couldn't load product", description: apiErrorMessage(error), variant: "destructive" }));
  }, [productId]);

  if (product && user && product.ownerWallet.toLowerCase() !== user.wallet.toLowerCase()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">Only the current owner of this warranty can transfer it.</p>
      </div>
    );
  }

  async function onSubmit(values: FormValues) {
    if (!product?.warranty) return;
    try {
      setStep("signing");
      const txHash = await sendTransferTransaction(product.warranty.warrantyId, values.toWallet);
      setStep("recording");
      await transferProduct(product.id, values.toWallet, txHash);
      toast({ title: "Ownership transferred", description: "The warranty now belongs to the new wallet.", variant: "success" });
      navigate(`/products/${product.id}`);
    } catch (error) {
      toast({ title: "Transfer failed", description: apiErrorMessage(error), variant: "destructive" });
    } finally {
      setStep("idle");
    }
  }

  const stepLabel: Record<Step, string> = {
    idle: "Transfer Ownership",
    signing: "Confirm in MetaMask…",
    confirming: "Waiting for confirmation…",
    recording: "Recording transfer…",
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Transfer Ownership</CardTitle>
          <CardDescription>
            {product ? `Transfer "${product.name}" to another wallet. This requires signing an on-chain transaction.` : "Loading…"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label htmlFor="toWallet">New owner's wallet address</Label>
              <Input id="toWallet" placeholder="0x..." {...register("toWallet")} />
              {errors.toWallet && <p className="text-xs text-destructive">{errors.toWallet.message}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={step !== "idle" || !product?.warranty}>
              {step !== "idle" && <Loader2 className="animate-spin" />}
              {step === "idle" && <ArrowLeftRight />}
              {stepLabel[step]}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, Loader2, UploadCloud } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { apiErrorMessage } from "@/services/apiClient";
import { createProduct } from "@/services/productService";
import { uploadInvoice } from "@/services/uploadService";
import { sendRegisterTransaction } from "@/services/walletService";
import { toast } from "@/store/toastStore";

const MIN_PURCHASE_DATE = "2000-01-01";
const TODAY = new Date().toISOString().slice(0, 10);

const schema = z.object({
  name: z.string().min(2, "Required"),
  brand: z.string().min(1, "Required"),
  category: z.string().min(1, "Required"),
  model: z.string().min(1, "Required"),
  serialNumber: z.string().min(1, "Required"),
  purchaseDate: z
    .string()
    .min(1, "Required")
    .refine((value) => value >= MIN_PURCHASE_DATE, "Enter a valid purchase date")
    .refine((value) => value <= TODAY, "Purchase date can't be in the future"),
  warrantyDurationMonths: z.number().int().min(1).max(600),
});

type FormValues = z.infer<typeof schema>;

function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, "0");
  const machine = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  const pid = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0");
  const increment = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  return timestamp + machine + pid + increment;
}

export function RegisterProductPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { warrantyDurationMonths: 12 },
  });

  async function onSubmit(values: FormValues) {
    if (!user) {
      toast({ title: "Registration failed", description: "You must be logged in to register a product.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let invoiceCID = "";
      if (invoiceFile) {
        const { cid } = await uploadInvoice(invoiceFile);
        invoiceCID = cid;
      }

      const productId = generateObjectId();
      const ownerWallet = user.wallet;

      toast({ title: "Confirm transaction", description: "Please confirm the warranty registration in MetaMask.", variant: "success" });
      const txHash = await sendRegisterTransaction(
        ownerWallet,
        productId,
        values.serialNumber,
        values.purchaseDate,
        values.warrantyDurationMonths,
        invoiceCID
      );

      const product = await createProduct({
        id: productId,
        ...values,
        invoiceCID: invoiceCID || null,
        ownerWallet,
        txHash,
      });

      toast({ title: "Warranty registered", description: `${product.name} is now on-chain.`, variant: "success" });
      navigate(`/products/${product.id}`);
    } catch (error) {
      toast({ title: "Registration failed", description: apiErrorMessage(error), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Register a product</CardTitle>
          <CardDescription>
            This mints a tamper-proof warranty on-chain and stores the invoice on IPFS. You will sign the transaction and pay gas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" placeholder="MacBook Pro 16&quot;" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" placeholder="Apple" {...register("brand")} />
                {errors.brand && <p className="text-xs text-destructive">{errors.brand.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="Electronics" {...register("category")} />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="model">Model Number</Label>
                <Input id="model" placeholder="A2991" {...register("model")} />
                {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input id="serialNumber" placeholder="C02XXXXXXXXX" {...register("serialNumber")} />
                {errors.serialNumber && <p className="text-xs text-destructive">{errors.serialNumber.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="purchaseDate"
                    type="date"
                    min={MIN_PURCHASE_DATE}
                    max={TODAY}
                    className="pr-10"
                    {...register("purchaseDate")}
                  />
                </div>
                {errors.purchaseDate && <p className="text-xs text-destructive">{errors.purchaseDate.message}</p>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="warrantyDurationMonths">Warranty Duration (months)</Label>
                <Input
                  id="warrantyDurationMonths"
                  type="number"
                  min={1}
                  max={600}
                  {...register("warrantyDurationMonths", { valueAsNumber: true })}
                />
                {errors.warrantyDurationMonths && (
                  <p className="text-xs text-destructive">{errors.warrantyDurationMonths.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invoice">Invoice (PDF or image, optional)</Label>
              <label
                htmlFor="invoice"
                className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-input px-4 py-3 text-sm text-muted-foreground hover:bg-secondary"
              >
                <UploadCloud className="size-5" />
                {invoiceFile ? invoiceFile.name : "Click to choose a file"}
              </label>
              <input
                id="invoice"
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => setInvoiceFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting && <Loader2 className="animate-spin" />}
              {submitting ? "Registering on-chain…" : "Register Warranty"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

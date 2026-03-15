import { CheckCircle2, HelpCircle, Loader2, Search, ShieldX, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiErrorMessage } from "@/services/apiClient";
import { verifyWarranty } from "@/services/verifyService";
import type { VerifyResult } from "@/types";
import { formatDate } from "@/utils/format";

const STATUS_META: Record<
  VerifyResult["status"],
  { icon: typeof CheckCircle2; label: string; className: string; description: string }
> = {
  active: {
    icon: CheckCircle2,
    label: "Valid & Active",
    className: "text-success",
    description: "This warranty is genuine and currently within its coverage period.",
  },
  expired: {
    icon: XCircle,
    label: "Expired",
    className: "text-warning",
    description: "This warranty is genuine but has passed its expiry date.",
  },
  revoked: {
    icon: ShieldX,
    label: "Revoked",
    className: "text-destructive",
    description: "This warranty has been revoked by the manufacturer or retailer.",
  },
  not_found: {
    icon: HelpCircle,
    label: "Not Found",
    className: "text-muted-foreground",
    description: "No warranty matches this ID or serial number.",
  },
};

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [warrantyId, setWarrantyId] = useState(searchParams.get("warrantyId") ?? "");
  const [serialNumber, setSerialNumber] = useState(searchParams.get("serialNumber") ?? "");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runVerify(input: { warrantyId?: number; serialNumber?: string }) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await verifyWarranty(input);
      setResult(data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const idParam = searchParams.get("warrantyId");
    const serialParam = searchParams.get("serialNumber");
    if (idParam) {
      runVerify({ warrantyId: Number(idParam) });
    } else if (serialParam) {
      runVerify({ serialNumber: serialParam });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, []);

  const meta = result ? STATUS_META[result.status] : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Verify a Warranty</CardTitle>
          <CardDescription>Check authenticity by warranty ID, serial number, or by scanning a QR code.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="warrantyId">
            <TabsList>
              <TabsTrigger value="warrantyId">Warranty ID</TabsTrigger>
              <TabsTrigger value="serial">Serial Number</TabsTrigger>
            </TabsList>
            <TabsContent value="warrantyId">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (warrantyId) runVerify({ warrantyId: Number(warrantyId) });
                }}
              >
                <Input
                  name="warrantyId"
                  placeholder="e.g. 42"
                  value={warrantyId}
                  onChange={(e) => setWarrantyId(e.target.value)}
                  type="number"
                />
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="serial">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (serialNumber) runVerify({ serialNumber });
                }}
              >
                <Input
                  name="serialNumber"
                  placeholder="Serial number"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                />
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          {meta && result && (
            <div className="mt-6 rounded-lg border border-border p-5">
              <div className="flex items-center gap-3">
                <meta.icon className={`size-8 ${meta.className}`} />
                <div>
                  <p className={`font-semibold ${meta.className}`}>{meta.label}</p>
                  <p className="text-sm text-muted-foreground">{meta.description}</p>
                </div>
              </div>
              {result.status !== "not_found" && (
                <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
                  {result.productName && (
                    <>
                      <dt className="text-muted-foreground">Product</dt>
                      <dd>{result.productName}</dd>
                    </>
                  )}
                  {result.warrantyId != null && (
                    <>
                      <dt className="text-muted-foreground">Warranty ID</dt>
                      <dd>#{result.warrantyId}</dd>
                    </>
                  )}
                  {result.expiryDate && (
                    <>
                      <dt className="text-muted-foreground">Expiry Date</dt>
                      <dd>{formatDate(result.expiryDate)}</dd>
                    </>
                  )}
                </dl>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

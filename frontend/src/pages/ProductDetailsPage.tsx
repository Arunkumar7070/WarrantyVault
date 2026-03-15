import { ArrowLeftRight, Download, ExternalLink, History } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { apiErrorMessage } from "@/services/apiClient";
import { getProduct, listTransfers } from "@/services/productService";
import { toast } from "@/store/toastStore";
import type { Product, TransferRecord } from "@/types";
import { formatDate, shortenAddress, statusBadgeVariant, statusLabel } from "@/utils/format";

const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY_URL ?? "https://gateway.pinata.cloud/ipfs";

export function ProductDetailsPage() {
  const { productId = "" } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProduct(productId), listTransfers(productId)])
      .then(([productData, transferData]) => {
        setProduct(productData);
        setTransfers(transferData);
      })
      .catch((error) => toast({ title: "Couldn't load product", description: apiErrorMessage(error), variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return <p className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground sm:px-6">Loading…</p>;
  }

  if (!product) {
    return <p className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground sm:px-6">Product not found.</p>;
  }

  const isOwner = user?.wallet.toLowerCase() === product.ownerWallet.toLowerCase();
  const verifyUrl = product.warranty
    ? `${window.location.origin}/verify?warrantyId=${product.warranty.warrantyId}`
    : `${window.location.origin}/verify`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-sm text-muted-foreground">
            {product.brand} · {product.category} · Model {product.model}
          </p>
        </div>
        {product.warranty && (
          <Badge variant={statusBadgeVariant[product.warranty.status]} className="text-sm">
            {statusLabel[product.warranty.status]}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Product & warranty details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Serial Number</dt>
              <dd className="font-mono">{product.serialNumber}</dd>
              <dt className="text-muted-foreground">Purchase Date</dt>
              <dd>{formatDate(product.purchaseDate)}</dd>
              <dt className="text-muted-foreground">Warranty Duration</dt>
              <dd>{product.warrantyDurationMonths} months</dd>
              {product.warranty && (
                <>
                  <dt className="text-muted-foreground">Expiry Date</dt>
                  <dd>{formatDate(product.warranty.expiryDate)}</dd>
                  <dt className="text-muted-foreground">On-chain Warranty ID</dt>
                  <dd>#{product.warranty.warrantyId}</dd>
                </>
              )}
              <dt className="text-muted-foreground">Current Owner</dt>
              <dd className="font-mono">{shortenAddress(product.ownerWallet)}</dd>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              {product.invoiceCID && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`${PINATA_GATEWAY}/${product.invoiceCID}`} target="_blank" rel="noreferrer">
                    <Download />
                    Download Invoice
                  </a>
                </Button>
              )}
              {product.warranty && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={`https://sepolia.basescan.org/tx/${product.warranty.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink />
                    View on Basescan
                  </a>
                </Button>
              )}
              {isOwner && (
                <Button size="sm" asChild>
                  <Link to={`/products/${product.id}/transfer`}>
                    <ArrowLeftRight />
                    Transfer Ownership
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verify QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <div className="rounded-lg border border-border bg-white p-3">
              <QRCodeSVG value={verifyUrl} size={160} />
            </div>
            <p className="text-center text-xs text-muted-foreground">
              Scan to verify this warranty's authenticity and status.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="size-4" />
            Ownership history
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No transfers yet — original owner still holds this warranty.</p>
          ) : (
            <ul className="space-y-3">
              {transfers.map((transfer) => (
                <li key={transfer.id} className="flex items-center justify-between text-sm">
                  <span className="font-mono">
                    {shortenAddress(transfer.fromWallet)} → {shortenAddress(transfer.toWallet)}
                  </span>
                  <span className="text-muted-foreground">{formatDate(transfer.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

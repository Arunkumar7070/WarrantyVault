import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { apiErrorMessage } from "@/services/apiClient";
import { listProducts } from "@/services/productService";
import { toast } from "@/store/toastStore";
import type { Product } from "@/types";
import { formatDate, shortenAddress, statusBadgeVariant, statusLabel } from "@/utils/format";

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .catch((error) => toast({ title: "Couldn't load products", description: apiErrorMessage(error), variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  if (user?.role !== "admin") {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">You need admin access to view this page.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Every product and warranty registered on WarrantyVault.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-2 pr-4 font-medium">Product</th>
                  <th className="py-2 pr-4 font-medium">Owner</th>
                  <th className="py-2 pr-4 font-medium">Registered</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4">
                      <Link to={`/products/${product.id}`} className="font-medium hover:underline">
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{product.serialNumber}</p>
                    </td>
                    <td className="py-3 pr-4 font-mono">{shortenAddress(product.ownerWallet)}</td>
                    <td className="py-3 pr-4">{formatDate(product.createdAt)}</td>
                    <td className="py-3 pr-4">
                      {product.warranty && (
                        <Badge variant={statusBadgeVariant[product.warranty.status]}>
                          {statusLabel[product.warranty.status]}
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

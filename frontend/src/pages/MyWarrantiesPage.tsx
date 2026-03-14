import { PackageSearch, PlusCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiErrorMessage } from "@/services/apiClient";
import { listProducts } from "@/services/productService";
import { toast } from "@/store/toastStore";
import type { Product, WarrantyStatus } from "@/types";
import { formatDate, statusBadgeVariant, statusLabel } from "@/utils/format";

export function MyWarrantiesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<WarrantyStatus | "all">("all");

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .catch((error) => toast({ title: "Couldn't load warranties", description: apiErrorMessage(error), variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.serialNumber.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || product.warranty?.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">My Warranties</h1>
          <p className="text-sm text-muted-foreground">All products registered to your wallet.</p>
        </div>
        <Button asChild>
          <Link to="/register-product">
            <PlusCircle />
            Register Product
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          placeholder="Search by name or serial number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as WarrantyStatus | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading warranties…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <PackageSearch className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">No products match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.brand}</p>
                    </div>
                    {product.warranty && (
                      <Badge variant={statusBadgeVariant[product.warranty.status]}>
                        {statusLabel[product.warranty.status]}
                      </Badge>
                    )}
                  </div>
                  <dl className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <dt>Serial</dt>
                      <dd className="font-mono">{product.serialNumber}</dd>
                    </div>
                    {product.warranty && (
                      <div className="flex justify-between">
                        <dt>Expires</dt>
                        <dd>{formatDate(product.warranty.expiryDate)}</dd>
                      </div>
                    )}
                  </dl>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

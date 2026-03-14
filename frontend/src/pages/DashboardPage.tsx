import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "react-router-dom";
import { Package, PlusCircle, ShieldAlert, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiErrorMessage } from "@/services/apiClient";
import { fetchDashboardStats } from "@/services/dashboardService";
import { toast } from "@/store/toastStore";
import type { DashboardStats } from "@/types";
import { formatDate, statusBadgeVariant, statusLabel } from "@/utils/format";

const STATUS_COLORS = {
  active: "oklch(0.6 0.15 150)",
  expired: "oklch(0.75 0.16 80)",
};

function StatCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <Icon className="size-6 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((error) => toast({ title: "Couldn't load dashboard", description: apiErrorMessage(error), variant: "destructive" }))
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats
    ? [
        { name: "Active", value: stats.activeWarranties, key: "active" as const },
        { name: "Expired", value: stats.expiredWarranties, key: "expired" as const },
      ]
    : [];
  const totalWarranties = (stats?.activeWarranties ?? 0) + (stats?.expiredWarranties ?? 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">An overview of your registered products and warranties.</p>
        </div>
        <Button asChild>
          <Link to="/register-product">
            <PlusCircle />
            Register Product
          </Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading dashboard…</p>
      ) : stats ? (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard icon={Package} label="Total Products" value={stats.totalProducts} />
            <StatCard icon={ShieldCheck} label="Active Warranties" value={stats.activeWarranties} />
            <StatCard icon={ShieldAlert} label="Expired Warranties" value={stats.expiredWarranties} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Warranty status</CardTitle>
              </CardHeader>
              <CardContent>
                {totalWarranties === 0 ? (
                  <p className="text-sm text-muted-foreground">No warranties yet.</p>
                ) : (
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={4}>
                          {chartData.map((entry) => (
                            <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} stroke="var(--color-card)" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--color-popover)",
                            border: "1px solid var(--color-border)",
                            borderRadius: 8,
                            fontSize: 13,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-semibold">{totalWarranties}</span>
                      <span className="text-xs text-muted-foreground">warranties</span>
                    </div>
                  </div>
                )}
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-success" />
                    Active: {stats.activeWarranties}
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-warning" />
                    Expired: {stats.expiredWarranties}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Recently added products</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products registered yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {stats.recentProducts.map((product) => (
                      <li key={product.id} className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <Link to={`/products/${product.id}`} className="font-medium hover:underline">
                            {product.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {product.brand} · Registered {formatDate(product.createdAt)}
                          </p>
                        </div>
                        {product.warranty && (
                          <Badge variant={statusBadgeVariant[product.warranty.status]}>
                            {statusLabel[product.warranty.status]}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Couldn't load dashboard data.</p>
      )}
    </div>
  );
}

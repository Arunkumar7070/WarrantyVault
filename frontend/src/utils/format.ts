import type { WarrantyStatus } from "@/types";

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

export function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export const statusLabel: Record<WarrantyStatus, string> = {
  active: "Active",
  expired: "Expired",
  revoked: "Revoked",
  not_found: "Not Found",
};

export const statusBadgeVariant: Record<WarrantyStatus, "success" | "warning" | "destructive" | "secondary"> = {
  active: "success",
  expired: "warning",
  revoked: "destructive",
  not_found: "secondary",
};

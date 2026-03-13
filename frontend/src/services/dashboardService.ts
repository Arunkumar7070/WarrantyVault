import { apiClient } from "@/services/apiClient";
import type { DashboardStats } from "@/types";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get("/dashboard");
  return data;
}

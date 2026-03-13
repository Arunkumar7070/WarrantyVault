import { apiClient } from "@/services/apiClient";
import type { VerifyResult } from "@/types";

export async function verifyWarranty(input: { warrantyId?: number; serialNumber?: string }): Promise<VerifyResult> {
  const { data } = await apiClient.post("/verify", input);
  return data;
}

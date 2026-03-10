import { apiClient } from "@/services/apiClient";
import type { UserProfile } from "@/types";

export async function requestNonce(wallet: string): Promise<{ wallet: string; message: string }> {
  const { data } = await apiClient.get("/auth/nonce", { params: { wallet } });
  return data;
}

export async function loginWithSignature(
  wallet: string,
  signature: string,
): Promise<{ accessToken: string; user: UserProfile }> {
  const { data } = await apiClient.post("/auth/login", { wallet, signature });
  return data;
}

export async function fetchProfile(): Promise<UserProfile> {
  const { data } = await apiClient.get("/user/profile");
  return data;
}

export async function updateProfile(input: { name?: string; email?: string }): Promise<UserProfile> {
  const { data } = await apiClient.put("/user/profile", input);
  return data;
}

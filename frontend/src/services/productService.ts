import { apiClient } from "@/services/apiClient";
import type { Product, ProductCreateInput, TransferRecord } from "@/types";

export async function createProduct(input: ProductCreateInput): Promise<Product> {
  const { data } = await apiClient.post("/products", input);
  return data;
}

export async function listProducts(): Promise<Product[]> {
  const { data } = await apiClient.get("/products");
  return data;
}

export async function getProduct(productId: string): Promise<Product> {
  const { data } = await apiClient.get(`/products/${productId}`);
  return data;
}

export async function transferProduct(productId: string, toWallet: string, txHash: string): Promise<TransferRecord> {
  const { data } = await apiClient.post(`/products/${productId}/transfer`, { toWallet, txHash });
  return data;
}

export async function listTransfers(productId: string): Promise<TransferRecord[]> {
  const { data } = await apiClient.get(`/products/${productId}/transfers`);
  return data;
}

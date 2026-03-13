import { apiClient } from "@/services/apiClient";

export async function uploadInvoice(file: File): Promise<{ cid: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

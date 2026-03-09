export type UserRole = "manufacturer" | "retailer" | "customer" | "service_center" | "admin";

export type WarrantyStatus = "active" | "expired" | "revoked" | "not_found";

export interface UserProfile {
  wallet: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: string;
}

export interface WarrantySummary {
  warrantyId: number;
  contractAddress: string;
  txHash: string;
  expiryDate: string;
  status: WarrantyStatus;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyDurationMonths: number;
  image: string | null;
  invoiceCID: string | null;
  ownerWallet: string;
  registeredByWallet: string;
  createdAt: string;
  warranty: WarrantySummary | null;
}

export interface ProductCreateInput {
  id: string;
  name: string;
  brand: string;
  category: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyDurationMonths: number;
  image?: string | null;
  invoiceCID?: string | null;
  ownerWallet?: string | null;
  txHash: string;
}

export interface TransferRecord {
  id: string;
  productId: string;
  warrantyId: number;
  fromWallet: string;
  toWallet: string;
  txHash: string;
  timestamp: string;
}

export interface DashboardStats {
  totalProducts: number;
  activeWarranties: number;
  expiredWarranties: number;
  recentProducts: Product[];
}

export interface VerifyResult {
  status: WarrantyStatus;
  warrantyId: number | null;
  productId: string | null;
  productName: string | null;
  ownerWallet: string | null;
  expiryDate: string | null;
}

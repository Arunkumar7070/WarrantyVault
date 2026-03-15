# WarrantyVault Frontend

React + TypeScript + Tailwind CSS SPA for WarrantyVault, talking to the FastAPI
backend and, for ownership transfers, directly to the `WarrantyRegistry`
contract via the user's own MetaMask wallet.

## Setup

```bash
npm install
cp .env.example .env   # then fill in real values
npm run dev
```

Required `.env` values:
- `VITE_API_BASE_URL` — the backend's URL (`http://localhost:8000` locally).
- `VITE_CONTRACT_ADDRESS` — address of the deployed `WarrantyRegistry` (see `../contracts`).
- `VITE_CHAIN_ID` / `VITE_CHAIN_RPC_URL` — Base Sepolia by default; MetaMask is
  prompted to add/switch to this network on connect.
- `VITE_PINATA_GATEWAY_URL` — gateway used to build invoice download links from IPFS CIDs.

## Stack

- **Routing:** React Router
- **State:** Zustand (`store/authStore.ts` persists the JWT + profile, `store/toastStore.ts` drives toasts)
- **Forms:** React Hook Form + Zod
- **UI:** Tailwind CSS v4 + a small set of shadcn-style primitives in `components/ui/`
- **Charts:** Recharts (dashboard warranty status donut)
- **Wallet:** `ethers` v6, wrapped in `services/walletService.ts` (connect, sign-in message, network switch, `transferWarranty` transaction)
- **QR codes:** `qrcode.react`, generated client-side from the verification URL — no backend image generation needed

## Auth flow

1. User clicks "Connect Wallet" → MetaMask connects → `GET /auth/nonce?wallet=...`
2. User signs the returned message (free, no gas) → `POST /auth/login` with the signature
3. Backend verifies the signature server-side and returns a JWT, stored in `authStore`

## Folder structure

Mirrors the PRD: `components/`, `pages/`, `hooks/`, `services/`, `store/`, `layouts/`, `utils/`, plus `types/` for shared API types and `abi/` for the contract ABI used by `walletService`.

## Build

```bash
npm run build
```

Note: the production bundle currently ships as a single ~1.2MB chunk (ethers +
recharts + framer-motion are the main contributors). Route-based code
splitting (`React.lazy`) would be the next optimization if bundle size becomes
a concern.

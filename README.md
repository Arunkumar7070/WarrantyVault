# WarrantyVault

**Secure. Digital. Tamper-Proof. Warranty Management.**

WarrantyVault is a blockchain-powered platform that replaces traditional paper warranties with secure, digital records. Every product purchase generates a tamper-proof on-chain warranty record stored on the Base Sepolia network, with invoice files securely pinned to IPFS via Pinata.

---

## 🚀 Key Features

* **Gas-Sponsored Registration**: Warranty creation is sponsored by the backend operator, so customers do not need testnet ETH.
* **On-Chain Verification**: Read-only verification check directly from the smart contract, enriched with metadata from MongoDB.
* **Secure Ownership Transfer**: Warranties are transferred securely from owner to owner using MetaMask signing.
* **IPFS Invoice Storage**: Digital invoices are stored permanently on IPFS, represented on-chain by their unique CID hashes.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), TypeScript, Tailwind CSS, Zustand, Ethers.js
* **Backend**: FastAPI, MongoDB (Motor), Web3.py
* **Smart Contracts**: Solidity, Hardhat, OpenZeppelin (Deployed on Base Sepolia)
* **Storage**: Pinata (IPFS)

---

## 💻 Quick Start (Local Development)

### 1. Smart Contracts
Compile and run a local Ethereum node:
```bash
cd contracts
npm install
npm run node                        # Starts local Hardhat node
npm run deploy:localhost            # Deploys contract to local node
```

### 2. Backend API
Configure and start the FastAPI service:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env                # Fill in MongoDB URI, Contract Address, and keys
uvicorn main:app --reload
```

### 3. Frontend App
Configure and start the React client:
```bash
cd frontend
npm install
cp .env.example .env                # Point to backend and contract address
npm run dev
```
Open `http://localhost:5173` to test the application.

---

## ☁️ Cloud Deployment

For production deployment instructions, please refer to the detailed [Deployment Guide](.gemini/antigravity/brain/01a86ce3-9c20-4ff5-bee2-71d2bb6cfb37/deployment_guide.md).

* **Database**: MongoDB Atlas
* **Backend**: Render
* **Frontend**: Vercel
* **Smart Contract**: Base Sepolia
* **File Storage**: Pinata IPFS
![alt text](<Screenshot 2026-07-17 at 12.29.42 AM.png>)

<video controls src="Screen Recording 2026-07-17 at 12.25.36 AM.mov" title="Title"></video>

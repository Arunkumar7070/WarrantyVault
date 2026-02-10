# Product Requirements Document (PRD)

## Project Name

WarrantyVault

## Tagline

Own it. Transfer it. Verify it.

## 1. Overview

WarrantyVault is a blockchain-powered platform that replaces traditional paper warranty cards with secure, digital warranties.

Every product purchased receives a tamper-proof warranty record stored on the blockchain. Owners can:

- Register products
- View warranties
- Transfer ownership
- Verify warranty status
- Upload invoices securely
- Track ownership history

The platform combines blockchain for trust with a modern web application for usability.

## 2. Problem Statement

Today's warranty system has several issues:

- Paper warranty cards are easily lost.
- Invoices fade or get misplaced.
- Warranty ownership cannot be transferred reliably.
- Service centers must manually verify documents.
- Buyers of used products have no trusted way to confirm warranty validity.

## 3. Solution

WarrantyVault digitizes warranty management by combining:

- Blockchain for immutable ownership records
- MongoDB for application data
- IPFS for invoice storage
- FastAPI backend
- React frontend

Every warranty has a unique blockchain identity that can be verified by anyone.

## 4. Target Users

**Manufacturer**
- Register products
- Define warranty period

**Retailer**
- Assign products to customers

**Customer**
- View warranties
- Upload invoices
- Transfer ownership
- Track warranty expiry

**Service Center**
- Verify warranty
- View ownership history

## 5. Core Features (MVP)

### Authentication
- Wallet Login (MetaMask)
- JWT session

### Dashboard

Displays:
- Total Products
- Active Warranties
- Expired Warranties
- Recently Added Products

### Product Registration

Fields:
- Product Name
- Brand
- Category
- Model Number
- Serial Number
- Purchase Date
- Warranty Duration
- Invoice Upload
- Product Image

### Warranty Management
- View warranty
- Download invoice
- Check expiry
- Ownership history

### Ownership Transfer

Owner enters another wallet address. Smart contract transfers ownership.

### Warranty Verification

Search by:
- Warranty ID
- Serial Number
- QR Code

Returns:
- Valid
- Expired
- Invalid

### Invoice Storage

Invoices stored in IPFS. Blockchain stores only the CID.

### QR Code

Every warranty gets a QR code linking to the verification page.

## 6. Future Features

- Email reminders before expiry
- Mobile app
- Warranty NFT
- Service history
- Insurance integration
- AI warranty assistant
- OCR invoice scanning
- Multi-language support

## 7. Technology Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Router
- Zustand
- Axios
- React Hook Form
- Zod
- Framer Motion
- Recharts

### Backend
- FastAPI
- Pydantic
- Motor (Async MongoDB)
- JWT
- Web3.py
- Uvicorn

### Database

MongoDB Atlas

Collections:
- Users
- Products
- Warranties
- OwnershipTransfers
- Notifications

### Blockchain
- Solidity
- Hardhat
- OpenZeppelin
- Base Sepolia

### Storage
- Pinata
- IPFS

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Blockchain: Base Sepolia
- Storage: Pinata

Everything can be deployed on free tiers for an MVP.

## 8. Smart Contract

`WarrantyRegistry.sol`

Functions:
- `registerWarranty()`
- `transferWarranty()`
- `verifyWarranty()`
- `getWarranty()`
- `getOwnerProducts()`

## 9. Database Collections

### Users
- id
- wallet
- name
- email
- role
- createdAt

### Products
- id
- name
- brand
- model
- serialNumber
- category
- image
- invoiceCID
- createdAt

### Warranties
- id
- productId
- ownerWallet
- purchaseDate
- expiryDate
- contractAddress
- tokenId
- status

### Transfers
- id
- productId
- fromWallet
- toWallet
- timestamp

## 10. Frontend Pages

- Landing Page
- Login
- Dashboard
- Register Product
- My Warranties
- Product Details
- Transfer Ownership
- Warranty Verification
- Profile
- Admin Dashboard
- 404 Page

## 11. API Endpoints

- `POST /auth/login`
- `GET /user/profile`
- `POST /products`
- `GET /products`
- `GET /products/{id}`
- `POST /products/{id}/transfer`
- `POST /verify`
- `POST /upload`
- `GET /dashboard`

## 12. Folder Structure

```
WarrantyVault/
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── layouts/
│   ├── assets/
│   └── utils/
│
├── backend/
│   ├── api/
│   ├── auth/
│   ├── blockchain/
│   ├── database/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── middleware/
│   └── main.py
│
├── contracts/
│
├── docs/
│
└── README.md
```

## 13. Non-Functional Requirements

- Responsive UI
- Secure authentication
- Fast API response times
- Immutable ownership records
- Scalable architecture
- RESTful APIs
- Mobile-friendly design

## 14. Success Criteria

A user should be able to:

- Connect a wallet.
- Register a product.
- Upload an invoice.
- Create a blockchain warranty.
- View warranty details.
- Transfer ownership.
- Verify the warranty using a QR code or Warranty ID.

## Development Roadmap

1. Initialize repository and project structure.
2. Build the React UI and routing.
3. Create the FastAPI backend and MongoDB connection.
4. Implement authentication.
5. Design the MongoDB models.
6. Develop the Solidity smart contract.
7. Integrate wallet connection.
8. Build product registration.
9. Add IPFS invoice upload.
10. Implement warranty dashboard.
11. Implement ownership transfer.
12. Add verification and QR code support.
13. Improve UI/UX and responsiveness.
14. Write tests and fix bugs.
15. Deploy to Vercel, Render, MongoDB Atlas, and Base Sepolia.

# WarrantyVault Backend

FastAPI service backing WarrantyVault: MongoDB for application data, Web3.py for
on-chain warranty registration/verification against the `WarrantyRegistry`
contract, and Pinata for invoice storage on IPFS.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt   # or requirements.txt for prod-only
cp .env.example .env                  # then fill in real values
```

Required `.env` values:
- `MONGODB_URI` / `MONGODB_DB_NAME` — a MongoDB Atlas (or local) connection.
- `CONTRACT_ADDRESS` — address of the deployed `WarrantyRegistry` (see `../contracts`).
- `BACKEND_OPERATOR_PRIVATE_KEY` — wallet the backend uses to sponsor gas for
  `registerWarranty`/`revokeWarranty` calls. This wallet must be added as a
  registrar on the contract (`setRegistrar`, done automatically for the
  deployer in the constructor).
- `PINATA_JWT` — from [pinata.cloud](https://app.pinata.cloud) for invoice uploads.

## Run

```bash
uvicorn main:app --reload
```

API docs at `http://localhost:8000/docs`.

## Test

```bash
pytest
```

Unit tests cover pure logic (JWT + wallet-signature verification, warranty
date math) and don't require a live MongoDB or RPC connection. Routes that
touch the database or chain are exercised manually / via the frontend.

## Architecture notes

- **Registration** (`POST /products`) is gas-sponsored: the backend signs
  `registerWarranty` with its own operator wallet on behalf of the
  authenticated manufacturer/retailer/customer, so end users never need ETH.
- **Transfer** (`POST /products/{id}/transfer`) must be signed by the
  warranty's current owner directly from their own wallet (the contract
  enforces `msg.sender == owner`). The frontend sends the transaction via
  MetaMask, then calls this endpoint with the resulting `txHash`; the backend
  verifies the transaction on-chain before updating MongoDB.
- **Verification** (`POST /verify`) is a free on-chain read (no gas, no
  signing) enriched with off-chain product metadata.

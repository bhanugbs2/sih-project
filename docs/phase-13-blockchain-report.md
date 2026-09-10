# HoneyChain Phase 13 — Complete Blockchain Traceability & Integrity Layer Report

**Project**: HoneyChain — Blockchain-based Honey Traceability & Smart Beekeeping Management System  
**Problem Statement**: SIH26021  
**Team**: Nexora  
**Phase**: 13 (Complete Blockchain Traceability & Integrity Layer)  
**Date**: September 9, 2026  

---

## 1. Executive Summary

Phase 13 completes, hardens, verifies, and documents the blockchain traceability and cryptographic integrity layer of HoneyChain. Utilizing an EVM-compatible smart contract (`HoneyTraceability.sol`) deployed on a local Hardhat EVM network, HoneyChain anchors milestone supply chain events to an immutable digital ledger.

The architecture strictly distinguishes between off-chain storage (PostgreSQL) for detailed telemetry, lab records, and user PII, and on-chain storage for deterministic SHA-256 canonical event hashes and transaction proofs. Idempotency controls prevent duplicate transaction anchoring, while public endpoints permit verification without requiring user credentials.

---

## 2. On-Chain vs. Off-Chain Data Separation Architecture

| Layer | Technology | Stored Data | Rationale |
| :--- | :--- | :--- | :--- |
| **OFF-CHAIN** | PostgreSQL Database | Raw telemetry, user credentials, lab metrics, harvest notes, packaging details | High volume, query speed, GDPR/privacy compliance, data editability before packaging |
| **ON-CHAIN** | EVM Smart Contract (`HoneyTraceability.sol`) | `batchId`, `packageId`, `eventType`, `dataHash` (SHA-256), block timestamp, tx hash | Cryptographic proof, immutability, tamper-evident anchoring |

> [!NOTE]
> **Scientific Wording**: Blockchain does not independently determine if physical honey is authentic; rather, *"Blockchain provides tamper-evident anchoring of selected traceability records."*

---

## 3. Deterministic SHA-256 Canonical Hashing

Event data is converted into a canonical string format before hashing:
```text
canonicalString = batchId | packageId | eventType | metadata | timestampIso
```
- **Algorithm**: `SHA-256` (producing a 64-character hex string / `bytes32` for Solidity).
- **Determinism**: The same canonical inputs will always produce the exact same SHA-256 hash.
- **Verification Endpoint**: `GET /api/blockchain/verify/{eventId}` reconstructs the canonical string and compares the expected hash with the stored hash, returning `MATCH` or `MISMATCH`.

---

## 4. Smart Contract Design & Deployment

- **Smart Contract**: [`HoneyTraceability.sol`](file:///d:/honey-chain/blockchain/contracts/HoneyTraceability.sol)
- **Solidity Version**: `^0.8.20`
- **Deployed Contract Address**: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`
- **Network**: Localhost EVM (Hardhat Network)
- **RPC URL**: `http://127.0.0.1:8545`
- **Chain ID**: `31337`
- **Core Function**: `recordTraceabilityEvent(string batchId, string packageId, string eventType, bytes32 dataHash)`

---

## 5. Blockchain Status Model & Transitions

```text
               ┌──> NOT_CONFIGURED (If RPC is disabled)
               │
OFF_CHAIN ─────┼──> PENDING ───> BLOCKCHAIN_ANCHORED (Mined Tx Hash)
               │       │
               │       └───> FAILED (Retry allowed: FAILED -> PENDING -> ANCHORED)
```

### Idempotency Enforcement
`BlockchainService.java` checks prior status before submitting transactions. If an event is already `BLOCKCHAIN_ANCHORED` with a valid transaction hash, the service returns the existing record without executing duplicate blockchain transactions.

---

## 6. QR & Public Verification Integration

- **Public URL**: `/verify/{packageId}`
- **QR Code**: Programmatically generated using standard canvas QR utilities (`qrcode.react`), linking directly to `/verify/{packageId}`.
- **Customer View**: Unauthenticated visitors can view full supply chain lineage, AI-assisted screening scores, lab test parameters, and EVM blockchain anchoring proofs (`0x...` transaction hash) without logging in.

---

## 7. Security & Key Management Review

- **Development Keys**: Hardhat default dev account key used exclusively for local EVM testing.
- **Secret Isolation**: Private keys are injected via environment variables (`BLOCKCHAIN_PRIVATE_KEY`) and are **never committed to git, exposed in source code, or returned in API responses**.
- **Contract Address**: Publicly configured in backend properties.

---

## 8. Testnet Readiness Architecture

HoneyChain is configured for seamless transition to public EVM testnets (such as Ethereum Sepolia or Polygon Amoy) by switching environment variables:
- `BLOCKCHAIN_RPC_URL`: `https://rpc-amoy.polygon.technology`
- `BLOCKCHAIN_CHAIN_ID`: `80002`
- `BLOCKCHAIN_CONTRACT_ADDRESS`: Deployed testnet address

---

## 9. Verification & Automated Test Results

| Test Suite | Total Tests | Passed | Failures | Errors | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Smart Contract Tests (`hardhat test`)** | 3 | 3 | 0 | 0 | **`PASSING`** |
| **Backend Test Suite (`mvnw clean test`)** | 72 | 72 | 0 | 0 | **`BUILD SUCCESS`** |
| **Frontend Production Build (`npm run build`)** | 2231 modules | 2231 | 0 | 0 | **`SUCCESS (13.39s)`** |

---

## 10. Summary of Blockchain Capabilities & Limitations

- **Completed**: Hardhat EVM contract deployment, Web3j Spring Boot transaction signing, SHA-256 canonical event hashing, idempotency guard, verification API, public QR verification.
- **Current Limitation**: Currently running on local Hardhat EVM (`31337`). Public testnet deployment requires live testnet gas tokens.

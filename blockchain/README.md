# HoneyChain Blockchain Layer & Traceability Adapter ⛓️🍯

The `/blockchain` module provides smart contracts and a clean blockchain abstraction layer to anchor honey batch lineage records on an immutable ledger.

---

## 1. Architectural Strategy

To maintain scalability and cost efficiency:
- **Detailed sensor telemetry remains off-chain in PostgreSQL**.
- **Only cryptographic batch roots, harvest milestones, quality attestation hashes, and jar serial numbers are anchored on-chain**.

---

## 2. Smart Contract Interface (`HoneyTraceability.sol`)

The smart contract maintains tamper-proof records for:
1. `recordHarvest(bytes32 batchHash, string floralSource, uint256 harvestTimestamp)`
2. `recordQualityAttestation(bytes32 batchHash, uint256 purityScore, string adulterationStatus)`
3. `anchorMerkleRoot(bytes32 batchHash, bytes32 merkleRoot)`
4. `verifyJarSerial(string qrCodeId) returns (bool verified, bytes32 batchHash)`

---

## 3. Blockchain Adapter Abstraction

The Java backend interacts with blockchain via a decoupled adapter interface:

```java
public interface BlockchainAdapter {
    BlockchainTxResult anchorBatch(String batchCode, String merkleRoot);
    VerificationProof verifyQrCode(String qrCodeId);
}
```

This clean abstraction allows swapping local development networks (Hardhat / Ganache / In-Memory Mock) with public networks (Sepolia, Polygon, Hyperledger Fabric).

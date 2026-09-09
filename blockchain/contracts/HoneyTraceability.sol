// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HoneyTraceability
 * @dev Smart contract for anchoring off-chain HoneyChain traceability proofs on an EVM-compatible blockchain.
 * SIH Problem Statement: SIH26021 | Team: Nexora
 */
contract HoneyTraceability {

    struct TraceabilityRecord {
        string batchId;
        string packageId;
        string eventType;
        bytes32 dataHash;
        uint256 timestamp;
        address sender;
        bool exists;
    }

    // Hash of record => TraceabilityRecord
    mapping(bytes32 => TraceabilityRecord) private records;

    // Batch ID => Array of event hashes
    mapping(string => bytes32[]) private batchRecordHashes;

    // Global array of all recorded event hashes
    bytes32[] private allRecordHashes;

    // Events
    event TraceabilityEventRecorded(
        bytes32 indexed eventHash,
        string batchId,
        string packageId,
        string eventType,
        bytes32 dataHash,
        uint256 timestamp,
        address indexed sender
    );

    /**
     * @notice Records an immutable traceability event on-chain.
     * @param batchId The unique batch identifier (e.g. BATCH-2026-VALLEY-09)
     * @param packageId The unique package identifier if available (or empty string "")
     * @param eventType The milestone event type (HARVESTED, QUALITY_TESTED, AI_SCREENED, PROCESSED, READY_FOR_PACKAGING, PACKAGED)
     * @param dataHash Cryptographic SHA-256 / Keccak-256 hash of the canonical off-chain event metadata
     * @return eventHash The unique on-chain reference hash generated for this anchoring record
     */
    function recordTraceabilityEvent(
        string memory batchId,
        string memory packageId,
        string memory eventType,
        bytes32 dataHash
    ) public returns (bytes32 eventHash) {
        bytes32 generatedHash = keccak256(
            abi.encodePacked(
                batchId,
                packageId,
                eventType,
                dataHash,
                block.timestamp,
                msg.sender,
                allRecordHashes.length
            )
        );

        records[generatedHash] = TraceabilityRecord({
            batchId: batchId,
            packageId: packageId,
            eventType: eventType,
            dataHash: dataHash,
            timestamp: block.timestamp,
            sender: msg.sender,
            exists: true
        });

        batchRecordHashes[batchId].push(generatedHash);
        allRecordHashes.push(generatedHash);

        emit TraceabilityEventRecorded(
            generatedHash,
            batchId,
            packageId,
            eventType,
            dataHash,
            block.timestamp,
            msg.sender
        );

        return generatedHash;
    }

    /**
     * @notice Retrieves a recorded traceability record by its on-chain event hash.
     */
    function getEventByHash(bytes32 eventHash)
        public
        view
        returns (
            string memory batchId,
            string memory packageId,
            string memory eventType,
            bytes32 dataHash,
            uint256 timestamp,
            address sender
        )
    {
        require(records[eventHash].exists, "Record does not exist");
        TraceabilityRecord memory rec = records[eventHash];
        return (rec.batchId, rec.packageId, rec.eventType, rec.dataHash, rec.timestamp, rec.sender);
    }

    /**
     * @notice Returns all on-chain event hashes associated with a batch ID.
     */
    function getEventsByBatchId(string memory batchId) public view returns (bytes32[] memory) {
        return batchRecordHashes[batchId];
    }

    /**
     * @notice Returns total number of on-chain anchored records.
     */
    function getEventsCount() public view returns (uint256) {
        return allRecordHashes.length;
    }

    /**
     * @notice Verifies if an on-chain record matches the provided expected data hash.
     */
    function verifyEventHash(bytes32 eventHash, bytes32 expectedDataHash) public view returns (bool) {
        if (!records[eventHash].exists) {
            return false;
        }
        return records[eventHash].dataHash == expectedDataHash;
    }
}

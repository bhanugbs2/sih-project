package com.nexora.honeychain.dto;

import com.nexora.honeychain.model.enums.BlockchainEnvironment;
import com.nexora.honeychain.model.enums.BlockchainStatus;
import com.nexora.honeychain.model.enums.TraceabilityEventType;
import java.time.Instant;

public class TraceabilityEventResponse {

    private String id;
    private String batchId;
    private String packageId;
    private TraceabilityEventType eventType;
    private String eventDataHash;
    private Instant timestamp;
    private String blockchainReference;
    private BlockchainEnvironment environment;
    private BlockchainStatus blockchainStatus;
    private String blockchainTransactionHash;
    private String blockchainNetwork;
    private Instant blockchainTimestamp;
    private String blockchainDataHash;
    private Instant createdAt;

    public TraceabilityEventResponse() {}

    public TraceabilityEventResponse(String id, String batchId, String packageId, TraceabilityEventType eventType, String eventDataHash, Instant timestamp, String blockchainReference, BlockchainEnvironment environment, Instant createdAt) {
        this.id = id;
        this.batchId = batchId;
        this.packageId = packageId;
        this.eventType = eventType;
        this.eventDataHash = eventDataHash;
        this.timestamp = timestamp;
        this.blockchainReference = blockchainReference;
        this.environment = environment;
        this.createdAt = createdAt;
        this.blockchainStatus = BlockchainStatus.NOT_CONFIGURED;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getPackageId() { return packageId; }
    public void setPackageId(String packageId) { this.packageId = packageId; }

    public TraceabilityEventType getEventType() { return eventType; }
    public void setEventType(TraceabilityEventType eventType) { this.eventType = eventType; }

    public String getEventDataHash() { return eventDataHash; }
    public void setEventDataHash(String eventDataHash) { this.eventDataHash = eventDataHash; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public String getBlockchainReference() { return blockchainReference; }
    public void setBlockchainReference(String blockchainReference) { this.blockchainReference = blockchainReference; }

    public BlockchainEnvironment getEnvironment() { return environment; }
    public void setEnvironment(BlockchainEnvironment environment) { this.environment = environment; }

    public BlockchainStatus getBlockchainStatus() { return blockchainStatus; }
    public void setBlockchainStatus(BlockchainStatus blockchainStatus) { this.blockchainStatus = blockchainStatus; }

    public String getBlockchainTransactionHash() { return blockchainTransactionHash; }
    public void setBlockchainTransactionHash(String blockchainTransactionHash) { this.blockchainTransactionHash = blockchainTransactionHash; }

    public String getBlockchainNetwork() { return blockchainNetwork; }
    public void setBlockchainNetwork(String blockchainNetwork) { this.blockchainNetwork = blockchainNetwork; }

    public Instant getBlockchainTimestamp() { return blockchainTimestamp; }
    public void setBlockchainTimestamp(Instant blockchainTimestamp) { this.blockchainTimestamp = blockchainTimestamp; }

    public String getBlockchainDataHash() { return blockchainDataHash; }
    public void setBlockchainDataHash(String blockchainDataHash) { this.blockchainDataHash = blockchainDataHash; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}


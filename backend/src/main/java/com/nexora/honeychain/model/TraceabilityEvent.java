package com.nexora.honeychain.model;

import com.nexora.honeychain.model.enums.BlockchainEnvironment;
import com.nexora.honeychain.model.enums.BlockchainStatus;
import com.nexora.honeychain.model.enums.TraceabilityEventType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "traceability_events")
public class TraceabilityEvent {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private HoneyBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id")
    private Package packageEntity;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private TraceabilityEventType eventType;

    @Column(name = "event_data_hash", nullable = false)
    private String eventDataHash;

    @NotNull
    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(name = "blockchain_reference")
    private String blockchainReference;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "environment", nullable = false)
    private BlockchainEnvironment environment = BlockchainEnvironment.DEVELOPMENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "blockchain_status")
    private BlockchainStatus blockchainStatus = BlockchainStatus.NOT_CONFIGURED;

    @Column(name = "blockchain_transaction_hash")
    private String blockchainTransactionHash;

    @Column(name = "blockchain_network")
    private String blockchainNetwork;

    @Column(name = "blockchain_timestamp")
    private Instant blockchainTimestamp;

    @Column(name = "blockchain_data_hash")
    private String blockchainDataHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
        }
        this.createdAt = Instant.now();
        if (this.blockchainStatus == null) {
            this.blockchainStatus = BlockchainStatus.NOT_CONFIGURED;
        }
    }

    public TraceabilityEvent() {}

    public TraceabilityEvent(HoneyBatch batch, Package packageEntity, TraceabilityEventType eventType, String eventDataHash, Instant timestamp, String blockchainReference, BlockchainEnvironment environment) {
        this.batch = batch;
        this.packageEntity = packageEntity;
        this.eventType = eventType;
        this.eventDataHash = eventDataHash;
        this.timestamp = timestamp;
        this.blockchainReference = blockchainReference;
        this.environment = environment != null ? environment : BlockchainEnvironment.DEVELOPMENT;
        this.blockchainStatus = BlockchainStatus.NOT_CONFIGURED;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public HoneyBatch getBatch() { return batch; }
    public void setBatch(HoneyBatch batch) { this.batch = batch; }

    public Package getPackageEntity() { return packageEntity; }
    public void setPackageEntity(Package packageEntity) { this.packageEntity = packageEntity; }

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


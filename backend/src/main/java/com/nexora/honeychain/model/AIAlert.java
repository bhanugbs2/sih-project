package com.nexora.honeychain.model;

import com.nexora.honeychain.model.enums.AIAlertStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ai_alerts")
public class AIAlert {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hive_id", nullable = false)
    private Hive hive;

    @NotNull
    @DecimalMin(value = "0.0")
    @DecimalMax(value = "100.0")
    @Column(name = "risk_score", nullable = false)
    private Double riskScore;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AIAlertStatus status;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "factors", length = 1000)
    private String factors;

    @NotNull
    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

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
    }

    public AIAlert() {}

    public AIAlert(Hive hive, Double riskScore, AIAlertStatus status, String message, String factors, Instant timestamp) {
        this.hive = hive;
        this.riskScore = riskScore;
        this.status = status;
        this.message = message;
        this.factors = factors;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Hive getHive() { return hive; }
    public void setHive(Hive hive) { this.hive = hive; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public AIAlertStatus getStatus() { return status; }
    public void setStatus(AIAlertStatus status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getFactors() { return factors; }
    public void setFactors(String factors) { this.factors = factors; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

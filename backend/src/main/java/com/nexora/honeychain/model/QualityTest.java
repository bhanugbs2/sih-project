package com.nexora.honeychain.model;

import com.nexora.honeychain.model.enums.QualityTestResult;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "quality_tests")
public class QualityTest {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private HoneyBatch batch;

    private Double moisture;
    private Double pH;
    private String color;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false)
    private QualityTestResult result = QualityTestResult.PENDING;

    @Column(name = "verified_by")
    private String verifiedBy;

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

    public QualityTest() {}

    public QualityTest(HoneyBatch batch, Double moisture, Double pH, String color, QualityTestResult result, String verifiedBy, Instant timestamp) {
        this.batch = batch;
        this.moisture = moisture;
        this.pH = pH;
        this.color = color;
        this.result = result != null ? result : QualityTestResult.PENDING;
        this.verifiedBy = verifiedBy;
        this.timestamp = timestamp;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public HoneyBatch getBatch() { return batch; }
    public void setBatch(HoneyBatch batch) { this.batch = batch; }

    public Double getMoisture() { return moisture; }
    public void setMoisture(Double moisture) { this.moisture = moisture; }

    public Double getPH() { return pH; }
    public void setPH(Double pH) { this.pH = pH; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public QualityTestResult getResult() { return result; }
    public void setResult(QualityTestResult result) { this.result = result; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

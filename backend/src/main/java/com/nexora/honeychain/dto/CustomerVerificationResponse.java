package com.nexora.honeychain.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class CustomerVerificationResponse {

    @JsonProperty("package")
    private PackageResponse packageInfo;

    private HoneyBatchResponse batch;
    private HiveResponse hive;
    private FarmResponse farm;
    private List<QualityTestResponse> qualityTests = new ArrayList<>();
    private List<ProcessingRecordResponse> processingRecords = new ArrayList<>();
    private List<TraceabilityEventResponse> traceabilityEvents = new ArrayList<>();
    private String blockchainVerificationStatus = "PENDING";

    public CustomerVerificationResponse() {}

    public CustomerVerificationResponse(PackageResponse packageInfo, HoneyBatchResponse batch, HiveResponse hive, FarmResponse farm, List<QualityTestResponse> qualityTests, List<ProcessingRecordResponse> processingRecords, List<TraceabilityEventResponse> traceabilityEvents, String blockchainVerificationStatus) {
        this.packageInfo = packageInfo;
        this.batch = batch;
        this.hive = hive;
        this.farm = farm;
        this.qualityTests = qualityTests != null ? qualityTests : new ArrayList<>();
        this.processingRecords = processingRecords != null ? processingRecords : new ArrayList<>();
        this.traceabilityEvents = traceabilityEvents != null ? traceabilityEvents : new ArrayList<>();
        this.blockchainVerificationStatus = blockchainVerificationStatus != null ? blockchainVerificationStatus : "PENDING";
    }

    public PackageResponse getPackageInfo() { return packageInfo; }
    public void setPackageInfo(PackageResponse packageInfo) { this.packageInfo = packageInfo; }

    public HoneyBatchResponse getBatch() { return batch; }
    public void setBatch(HoneyBatchResponse batch) { this.batch = batch; }

    public HiveResponse getHive() { return hive; }
    public void setHive(HiveResponse hive) { this.hive = hive; }

    public FarmResponse getFarm() { return farm; }
    public void setFarm(FarmResponse farm) { this.farm = farm; }

    public List<QualityTestResponse> getQualityTests() { return qualityTests; }
    public void setQualityTests(List<QualityTestResponse> qualityTests) { this.qualityTests = qualityTests; }

    public List<ProcessingRecordResponse> getProcessingRecords() { return processingRecords; }
    public void setProcessingRecords(List<ProcessingRecordResponse> processingRecords) { this.processingRecords = processingRecords; }

    public List<TraceabilityEventResponse> getTraceabilityEvents() { return traceabilityEvents; }
    public void setTraceabilityEvents(List<TraceabilityEventResponse> traceabilityEvents) { this.traceabilityEvents = traceabilityEvents; }

    public String getBlockchainVerificationStatus() { return blockchainVerificationStatus; }
    public void setBlockchainVerificationStatus(String blockchainVerificationStatus) { this.blockchainVerificationStatus = blockchainVerificationStatus; }
}

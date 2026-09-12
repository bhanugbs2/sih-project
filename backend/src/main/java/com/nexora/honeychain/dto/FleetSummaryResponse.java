package com.nexora.honeychain.dto;

public class FleetSummaryResponse {

    private long totalGateways;
    private long onlineGateways;
    private long offlineGateways;
    private long degradedGateways;
    private long maintenanceGateways;

    public FleetSummaryResponse() {}

    public FleetSummaryResponse(long totalGateways, long onlineGateways, long offlineGateways, long degradedGateways, long maintenanceGateways) {
        this.totalGateways = totalGateways;
        this.onlineGateways = onlineGateways;
        this.offlineGateways = offlineGateways;
        this.degradedGateways = degradedGateways;
        this.maintenanceGateways = maintenanceGateways;
    }

    public long getTotalGateways() { return totalGateways; }
    public void setTotalGateways(long totalGateways) { this.totalGateways = totalGateways; }

    public long getOnlineGateways() { return onlineGateways; }
    public void setOnlineGateways(long onlineGateways) { this.onlineGateways = onlineGateways; }

    public long getOfflineGateways() { return offlineGateways; }
    public void setOfflineGateways(long offlineGateways) { this.offlineGateways = offlineGateways; }

    public long getDegradedGateways() { return degradedGateways; }
    public void setDegradedGateways(long degradedGateways) { this.degradedGateways = degradedGateways; }

    public long getMaintenanceGateways() { return maintenanceGateways; }
    public void setMaintenanceGateways(long maintenanceGateways) { this.maintenanceGateways = maintenanceGateways; }
}

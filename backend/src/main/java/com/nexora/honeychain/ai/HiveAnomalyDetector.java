package com.nexora.honeychain.ai;

import com.nexora.honeychain.dto.ai.TelemetryAnalysisRequest;
import com.nexora.honeychain.dto.ai.TelemetryAnalysisResponse;
import com.nexora.honeychain.model.SensorReading;
import com.nexora.honeychain.model.enums.AIAlertStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class HiveAnomalyDetector {

    public TelemetryAnalysisResponse analyzeTelemetry(TelemetryAnalysisRequest request) {
        return evaluate(
                request.getHiveId(),
                request.getTemperature(),
                request.getHumidity(),
                request.getSoundLevel()
        );
    }

    public TelemetryAnalysisResponse analyzeSensorReading(SensorReading reading) {
        if (reading == null) return null;
        return evaluate(
                reading.getHive() != null ? reading.getHive().getHiveId() : "unknown",
                reading.getTemperature(),
                reading.getHumidity(),
                reading.getSoundLevel()
        );
    }

    private TelemetryAnalysisResponse evaluate(String hiveId, Double temp, Double hum, Double sound) {
        double riskScore = 0.0;
        List<String> anomalyFactors = new ArrayList<>();
        AIAlertStatus status = AIAlertStatus.NORMAL;
        String message;

        // 1. Thermal Variance Analysis (Baseline: 34.0°C - 36.0°C)
        if (temp != null) {
            if (temp > 38.0) {
                riskScore += 45.0;
                anomalyFactors.add(String.format("Thermal Spike: %.1f°C (overheating / disease stress)", temp));
                status = AIAlertStatus.CRITICAL;
            } else if (temp < 31.0) {
                riskScore += 40.0;
                anomalyFactors.add(String.format("Thermal Drop: %.1f°C (colony cluster weakening)", temp));
                status = AIAlertStatus.WARNING;
            } else if (temp > 36.5 || temp < 33.5) {
                riskScore += 15.0;
                anomalyFactors.add(String.format("Minor thermal drift: %.1f°C", temp));
            }
        }

        // 2. Humidity Shift Analysis (Baseline: 50% - 65%)
        if (hum != null) {
            if (hum > 70.0) {
                riskScore += 30.0;
                anomalyFactors.add(String.format("High Humidity: %.1f%% (condensation / mold risk)", hum));
                if (status == AIAlertStatus.NORMAL) status = AIAlertStatus.WARNING;
            } else if (hum < 40.0) {
                riskScore += 15.0;
                anomalyFactors.add(String.format("Low Humidity: %.1f%% (brood desiccation risk)", hum));
            }
        }

        // 3. Acoustic Frequency Analysis (Baseline: 220Hz - 250Hz)
        if (sound != null) {
            if (sound > 0 && sound <= 215.0) {
                riskScore += 25.0;
                anomalyFactors.add(String.format("Acoustic Frequency Shift: %.0fHz (pre-swarm piping / queen distress)", sound));
                if (status == AIAlertStatus.NORMAL) status = AIAlertStatus.WARNING;
            }
        }

        // Clamp risk score
        riskScore = Math.max(0.0, Math.min(100.0, Math.round(riskScore * 10.0) / 10.0));

        if (riskScore >= 40.0) {
            if (status == AIAlertStatus.NORMAL) status = AIAlertStatus.WARNING;
        }

        // Generate Scientific Decision Support Message
        if (status == AIAlertStatus.CRITICAL) {
            message = "Abnormal hive pattern detected. Immediate beekeeper inspection recommended.";
        } else if (status == AIAlertStatus.WARNING) {
            message = "Environmental parameter drift detected. Beekeeper inspection recommended.";
        } else {
            message = "Hive status optimal. Internal environmental parameters within standard screening thresholds.";
        }

        return new TelemetryAnalysisResponse(
                hiveId,
                riskScore,
                status,
                message,
                anomalyFactors
        );
    }
}

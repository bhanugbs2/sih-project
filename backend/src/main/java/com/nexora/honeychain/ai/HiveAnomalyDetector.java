package com.nexora.honeychain.ai;

import com.nexora.honeychain.ai.ml.HoneyChainMlEngine;
import com.nexora.honeychain.dto.ai.TelemetryAnalysisRequest;
import com.nexora.honeychain.dto.ai.TelemetryAnalysisResponse;
import com.nexora.honeychain.model.SensorReading;
import com.nexora.honeychain.model.enums.AIAlertStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class HiveAnomalyDetector {

    private final HoneyChainMlEngine mlEngine;

    public HiveAnomalyDetector() {
        this(null);
    }

    public HiveAnomalyDetector(HoneyChainMlEngine mlEngine) {
        this.mlEngine = mlEngine;
    }

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
        String modelVersion = "honeychain-anomaly-v1";
        String screeningMethod = "ML_RANDOM_FOREST";
        double confidenceScore = 0.95;

        // Check for invalid or missing DHT22 sensor telemetry (-999 or null for primary active sensors)
        boolean isTempInvalid = (temp != null && temp < -50.0);
        boolean isHumInvalid = (hum != null && (hum < 0.0 || hum > 100.0));
        boolean isDhtMissing = (temp == null && hum == null) || isTempInvalid || isHumInvalid;

        if (isDhtMissing) {
            status = AIAlertStatus.WARNING;
            riskScore = 25.0;
            anomalyFactors.add("SENSOR_DATA_UNAVAILABLE: DHT22 telemetry readings missing or invalid");
            message = "DHT22 reading unavailable. Sensor inspection recommended.";
            return new TelemetryAnalysisResponse(
                    hiveId,
                    riskScore,
                    status,
                    message,
                    anomalyFactors,
                    "sensor-health-v1",
                    "SENSOR_HEALTH_CHECK",
                    1.0
            );
        }

        // Try ML Engine prediction if available and valid inputs exist
        if (mlEngine != null && mlEngine.isInitialized() && (temp != null || hum != null)) {
            try {
                double tVal = temp != null ? temp : 35.0;
                double hVal = hum != null ? hum : 55.0;
                double sVal = sound != null ? sound : 230.0;
                double deltaT = tVal - 35.0;

                double[] features = new double[]{tVal, hVal, sVal, deltaT};
                double[] probs = mlEngine.getAnomalyModel().predictProbabilities(features, 3);
                int predictedLabel = mlEngine.getAnomalyModel().predict(features, 3);

                confidenceScore = Math.round(probs[predictedLabel] * 100.0) / 100.0;
                if (predictedLabel == 2) {
                    status = AIAlertStatus.CRITICAL;
                    riskScore = 85.0;
                } else if (predictedLabel == 1) {
                    status = AIAlertStatus.WARNING;
                    riskScore = 45.0;
                }
            } catch (Exception e) {
                screeningMethod = "RULE_BASED_FALLBACK";
                modelVersion = "rule-engine-fallback";
            }
        } else {
            screeningMethod = "RULE_BASED_FALLBACK";
            modelVersion = "rule-engine-fallback";
        }

        // 1. Thermal Variance Analysis (Baseline: 34.0°C - 36.0°C)
        if (temp != null) {
            if (temp > 38.0) {
                riskScore = Math.max(riskScore, 45.0);
                anomalyFactors.add(String.format("Thermal Spike: %.1f°C (overheating / environmental stress)", temp));
                status = AIAlertStatus.CRITICAL;
            } else if (temp < 31.0) {
                riskScore = Math.max(riskScore, 40.0);
                anomalyFactors.add(String.format("Thermal Drop: %.1f°C (colony cluster weakening)", temp));
                if (status != AIAlertStatus.CRITICAL) status = AIAlertStatus.WARNING;
            } else if (temp > 36.5 || temp < 33.5) {
                riskScore = Math.max(riskScore, 15.0);
                anomalyFactors.add(String.format("Minor thermal drift: %.1f°C", temp));
            }
        }

        // 2. Humidity Shift Analysis (Baseline: 50% - 65%)
        if (hum != null) {
            if (hum > 70.0) {
                riskScore = Math.max(riskScore, 30.0);
                anomalyFactors.add(String.format("High Humidity: %.1f%% (condensation / mold risk)", hum));
                if (status == AIAlertStatus.NORMAL) status = AIAlertStatus.WARNING;
            } else if (hum < 40.0) {
                riskScore = Math.max(riskScore, 15.0);
                anomalyFactors.add(String.format("Low Humidity: %.1f%% (brood desiccation risk)", hum));
            }
        }

        // 3. Acoustic Frequency Analysis (Baseline: 220Hz - 250Hz - active INMP441 optional telemetry)
        if (sound != null) {
            if (sound > 0 && sound <= 215.0) {
                riskScore = Math.max(riskScore, 25.0);
                anomalyFactors.add(String.format("Acoustic Frequency Shift: %.0fHz (pre-swarm piping / queen distress)", sound));
                if (status == AIAlertStatus.NORMAL) status = AIAlertStatus.WARNING;
            }
        }

        riskScore = Math.max(0.0, Math.min(100.0, Math.round(riskScore * 10.0) / 10.0));

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
                anomalyFactors,
                modelVersion,
                screeningMethod,
                confidenceScore
        );
    }
}

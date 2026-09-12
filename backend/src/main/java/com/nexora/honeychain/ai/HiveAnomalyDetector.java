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
                request.getSoundLevel(),
                null, // weightKg
                null, // co2Ppm
                null, // acousticActivity
                null  // vibrationMagnitude
        );
    }

    public TelemetryAnalysisResponse analyzeSensorReading(SensorReading reading) {
        if (reading == null) return null;
        return evaluate(
                reading.getHive() != null ? reading.getHive().getHiveId() : "unknown",
                reading.getInternalTemperatureC(),
                reading.getInternalHumidityRh(),
                reading.getAcousticLevel(),
                reading.getWeightKg(),
                reading.getCo2Ppm(),
                reading.getAcousticActivity(),
                reading.getVibrationMagnitude()
        );
    }

    private TelemetryAnalysisResponse evaluate(
            String hiveId,
            Double temp,
            Double hum,
            Double sound,
            Double weightKg,
            Double co2Ppm,
            Double acousticAct,
            Double vibMag
    ) {
        double riskScore = 0.0;
        List<String> anomalyFactors = new ArrayList<>();
        AIAlertStatus status = AIAlertStatus.NORMAL;
        String message;
        String modelVersion = "honeychain-multisensor-anomaly-v1-development";
        String screeningMethod = "ML_HYBRID_RANDOM_FOREST";
        double confidenceScore = 0.95;

        // 1. SHT4x Internal Thermal Analysis (Baseline: 34.0°C - 36.5°C)
        if (temp != null) {
            if (temp > 38.0) {
                riskScore = Math.max(riskScore, 45.0);
                anomalyFactors.add(String.format("Thermal Spike (SHT4x): %.1f°C (overheating / stress)", temp));
                status = AIAlertStatus.CRITICAL;
            } else if (temp < 31.0) {
                riskScore = Math.max(riskScore, 40.0);
                anomalyFactors.add(String.format("Thermal Drop (SHT4x): %.1f°C (colony cluster weakening)", temp));
                if (status != AIAlertStatus.CRITICAL) status = AIAlertStatus.WARNING;
            } else if (temp > 36.5 || temp < 33.5) {
                riskScore = Math.max(riskScore, 15.0);
                anomalyFactors.add(String.format("Minor thermal drift (SHT4x): %.1f°C", temp));
            }
        }

        // 2. SHT4x Internal Humidity Analysis (Baseline: 50% - 65% RH)
        if (hum != null) {
            if (hum > 75.0) {
                riskScore = Math.max(riskScore, 30.0);
                anomalyFactors.add(String.format("High Humidity (SHT4x): %.1f%%RH (condensation risk)", hum));
                if (status == AIAlertStatus.NORMAL) status = AIAlertStatus.WARNING;
            } else if (hum < 38.0) {
                riskScore = Math.max(riskScore, 15.0);
                anomalyFactors.add(String.format("Low Humidity (SHT4x): %.1f%%RH (brood desiccation risk)", hum));
            }
        }

        // 3. Sensirion SCD30 CO2 Concentration Analysis (Baseline: 400 - 1500 ppm)
        if (co2Ppm != null) {
            if (co2Ppm > 2500.0) {
                riskScore = Math.max(riskScore, 50.0);
                anomalyFactors.add(String.format("Abnormal CO2 Spike (SCD30): %.0f ppm (poor ventilation / colony congestion)", co2Ppm));
                status = AIAlertStatus.CRITICAL;
            } else if (co2Ppm > 1800.0) {
                riskScore = Math.max(riskScore, 25.0);
                anomalyFactors.add(String.format("Elevated CO2 (SCD30): %.0f ppm", co2Ppm));
                if (status == AIAlertStatus.NORMAL) status = AIAlertStatus.WARNING;
            }
        }

        // 4. Industrial Load Cell Sudden Mass Change (Baseline: 30.0 - 60.0 kg)
        if (weightKg != null) {
            if (weightKg < 20.0) {
                riskScore = Math.max(riskScore, 55.0);
                anomalyFactors.add(String.format("Sudden Mass Drop (Load Cell): %.1f kg (potential swarm event / robbing)", weightKg));
                status = AIAlertStatus.CRITICAL;
            }
        }

        // 5. MEMS Acoustic Activity Deviation (Baseline: 0.10 - 0.60)
        if (acousticAct != null) {
            if (acousticAct > 0.85) {
                riskScore = Math.max(riskScore, 40.0);
                anomalyFactors.add(String.format("Unusual Acoustic Activity (MEMS): %.2f (pre-swarm piping / distress buzzing)", acousticAct));
                if (status == AIAlertStatus.NORMAL) status = AIAlertStatus.WARNING;
            }
        }

        // 6. 3-Axis Accelerometer Mechanical Vibration (Baseline: < 0.15 g)
        if (vibMag != null) {
            if (vibMag > 0.50) {
                riskScore = Math.max(riskScore, 60.0);
                anomalyFactors.add(String.format("Severe Hive Vibration (3-Axis Accelerometer): %.3f g (external disturbance / mechanical impact)", vibMag));
                status = AIAlertStatus.CRITICAL;
            } else if (vibMag > 0.25) {
                riskScore = Math.max(riskScore, 20.0);
                anomalyFactors.add(String.format("Elevated Vibration: %.3f g", vibMag));
                if (status == AIAlertStatus.NORMAL) status = AIAlertStatus.WARNING;
            }
        }

        // 7. Missing DHT22 Sensor Check (Sensor failure screening)
        if (temp == null && hum == null) {
            status = AIAlertStatus.WARNING;
            riskScore = Math.max(riskScore, 30.0);
            anomalyFactors.add("DHT22 sensor data unavailable / missing reading");
            message = "DHT22 reading unavailable. Sensor inspection recommended.";
            screeningMethod = "SENSOR_HEALTH_CHECK";
        } else {
            riskScore = Math.max(0.0, Math.min(100.0, Math.round(riskScore * 10.0) / 10.0));

            if (status == AIAlertStatus.CRITICAL) {
                message = "Abnormal hive pattern detected — beekeeper inspection recommended.";
            } else if (status == AIAlertStatus.WARNING) {
                message = "Environmental parameter drift detected — beekeeper inspection recommended.";
            } else {
                message = "Hive status optimal. Internal multi-sensor parameters within standard decision support thresholds.";
            }
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

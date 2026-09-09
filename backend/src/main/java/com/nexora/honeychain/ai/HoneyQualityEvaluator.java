package com.nexora.honeychain.ai;

import com.nexora.honeychain.dto.ai.QualityEvaluationRequest;
import com.nexora.honeychain.dto.ai.QualityEvaluationResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class HoneyQualityEvaluator {

    private static final double MAX_ALLOWED_MOISTURE = 20.0;
    private static final double OPTIMAL_MOISTURE_MIN = 15.0;
    private static final double OPTIMAL_MOISTURE_MAX = 17.5;
    private static final double MIN_PH = 3.4;
    private static final double MAX_PH = 4.5;

    public QualityEvaluationResponse evaluateHoneyQuality(QualityEvaluationRequest request) {
        double purityScore = 100.0;
        List<String> riskFactors = new ArrayList<>();
        String adulterationClass = "PURE";
        String recommendation;

        Double moisture = request.getMoisture();
        Double ph = request.getPh();

        // 1. Evaluate Moisture Level (%)
        if (moisture != null) {
            if (moisture > MAX_ALLOWED_MOISTURE) {
                double excess = moisture - MAX_ALLOWED_MOISTURE;
                purityScore -= Math.min(40.0, 15.0 + (excess * 8.0));
                riskFactors.add(String.format("High Moisture: %.1f%% (exceeds IHC max 20.0%%)", moisture));
                adulterationClass = "SUSPECTED_MOISTURE_DILUTION";
            } else if (moisture > OPTIMAL_MOISTURE_MAX) {
                double excess = moisture - OPTIMAL_MOISTURE_MAX;
                purityScore -= excess * 4.0;
                riskFactors.add(String.format("Moisture slightly elevated: %.1f%%", moisture));
            } else if (moisture < OPTIMAL_MOISTURE_MIN) {
                purityScore -= 5.0;
                riskFactors.add(String.format("Low Moisture: %.1f%% (potential over-crystallization)", moisture));
            }
        }

        // 2. Evaluate pH Level
        if (ph != null) {
            if (ph < MIN_PH || ph > MAX_PH) {
                double diff = ph < MIN_PH ? MIN_PH - ph : ph - MAX_PH;
                purityScore -= Math.min(30.0, diff * 20.0);
                riskFactors.add(String.format("pH Deviation: %.2f (outside standard 3.4 - 4.5 range)", ph));
                if ("PURE".equals(adulterationClass)) {
                    adulterationClass = "QUALITY_PARAMETER_ANOMALY";
                }
            }
        }

        // Clamp purity score between 0.0 and 100.0
        purityScore = Math.max(0.0, Math.min(100.0, Math.round(purityScore * 10.0) / 10.0));

        // 3. Generate Scientific Decision Support Recommendation Wording
        if (purityScore >= 90.0) {
            recommendation = "Measured parameters are within the configured screening thresholds. Further laboratory validation is recommended for definitive authenticity assessment.";
        } else if (purityScore >= 70.0) {
            recommendation = "Elevated moisture variance detected in batch sample. Secondary lab validation advised.";
        } else {
            recommendation = "Quality parameter anomaly detected. Further laboratory authenticity testing is recommended.";
        }

        return new QualityEvaluationResponse(
                request.getBatchId(),
                purityScore,
                adulterationClass,
                recommendation,
                riskFactors
        );
    }
}

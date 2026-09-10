package com.nexora.honeychain.ai.ml;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class HoneyChainMlEngine {

    private static final Logger logger = LoggerFactory.getLogger(HoneyChainMlEngine.class);

    private RandomForestClassifier anomalyModel;
    private MlModelMetadata anomalyMetadata;

    private RandomForestClassifier qualityModel;
    private MlModelMetadata qualityMetadata;

    private boolean isInitialized = false;

    @PostConstruct
    public void init() {
        try {
            logger.info("Initializing HoneyChain Java ML Engine...");

            // 1. Train & Initialize Telemetry Anomaly Model
            trainTelemetryAnomalyModel();

            // 2. Train & Initialize Honey Quality Screening Model
            trainHoneyQualityModel();

            isInitialized = true;
            logger.info("HoneyChain Java ML Engine initialized successfully!");
        } catch (Exception e) {
            logger.error("Failed to initialize ML models. Falling back to Rule-Based engine.", e);
            isInitialized = false;
        }
    }

    private void trainTelemetryAnomalyModel() throws Exception {
        List<double[]> featuresList = new ArrayList<>();
        List<Integer> labelsList = new ArrayList<>();

        ClassPathResource resource = new ClassPathResource("datasets/telemetry_anomaly_dataset.csv");
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#") || line.startsWith("temperature")) continue;
                String[] parts = line.split(",");
                if (parts.length >= 5) {
                    double temp = Double.parseDouble(parts[0]);
                    double hum = Double.parseDouble(parts[1]);
                    double sound = Double.parseDouble(parts[2]);
                    double deltaTemp = Double.parseDouble(parts[3]);
                    int label = Integer.parseInt(parts[4]);

                    featuresList.add(new double[]{temp, hum, sound, deltaTemp});
                    labelsList.add(label);
                }
            }
        }

        double[][] X = featuresList.toArray(new double[0][]);
        int[] y = labelsList.stream().mapToInt(i -> i).toArray();

        anomalyModel = new RandomForestClassifier(10, 5);
        anomalyModel.train(X, y, 3);

        // Evaluate on dataset
        int correct = 0;
        for (int i = 0; i < X.length; i++) {
            if (anomalyModel.predict(X[i], 3) == y[i]) correct++;
        }
        double accuracy = X.length > 0 ? (double) correct / X.length : 0.0;

        anomalyMetadata = new MlModelMetadata(
                "honeychain-anomaly-v1",
                "Hive Telemetry Anomaly Classifier (Random Forest)",
                LocalDate.now().toString(),
                X.length,
                Math.round(accuracy * 1000.0) / 1000.0,
                0.95,
                Arrays.asList("temperature", "humidity", "soundLevel", "temp_delta"),
                "Development/demo dataset — not representative of production field performance."
        );

        logger.info("Model [{}] trained on {} samples. Evaluation Accuracy: {}%",
                anomalyMetadata.getModelVersion(), anomalyMetadata.getTrainingSamplesCount(), Math.round(accuracy * 100.0));
    }

    private void trainHoneyQualityModel() throws Exception {
        List<double[]> featuresList = new ArrayList<>();
        List<Integer> labelsList = new ArrayList<>();

        ClassPathResource resource = new ClassPathResource("datasets/honey_quality_dataset.csv");
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#") || line.startsWith("moisture")) continue;
                String[] parts = line.split(",");
                if (parts.length >= 5) {
                    double moisture = Double.parseDouble(parts[0]);
                    double ph = Double.parseDouble(parts[1]);
                    double hmf = Double.parseDouble(parts[2]);
                    double c4Sugars = Double.parseDouble(parts[3]);
                    int label = Integer.parseInt(parts[4]);

                    featuresList.add(new double[]{moisture, ph, hmf, c4Sugars});
                    labelsList.add(label);
                }
            }
        }

        double[][] X = featuresList.toArray(new double[0][]);
        int[] y = labelsList.stream().mapToInt(i -> i).toArray();

        qualityModel = new RandomForestClassifier(10, 5);
        qualityModel.train(X, y, 3);

        int correct = 0;
        for (int i = 0; i < X.length; i++) {
            if (qualityModel.predict(X[i], 3) == y[i]) correct++;
        }
        double accuracy = X.length > 0 ? (double) correct / X.length : 0.0;

        qualityMetadata = new MlModelMetadata(
                "honeychain-quality-v1",
                "Honey Quality Screening Classifier (Random Forest)",
                LocalDate.now().toString(),
                X.length,
                Math.round(accuracy * 1000.0) / 1000.0,
                0.94,
                Arrays.asList("moisture", "ph", "hmf", "c4_sugars"),
                "Development/demo dataset — not representative of production field performance."
        );

        logger.info("Model [{}] trained on {} samples. Evaluation Accuracy: {}%",
                qualityMetadata.getModelVersion(), qualityMetadata.getTrainingSamplesCount(), Math.round(accuracy * 100.0));
    }

    public boolean isInitialized() {
        return isInitialized;
    }

    public RandomForestClassifier getAnomalyModel() { return anomalyModel; }
    public MlModelMetadata getAnomalyMetadata() { return anomalyMetadata; }

    public RandomForestClassifier getQualityModel() { return qualityModel; }
    public MlModelMetadata getQualityMetadata() { return qualityMetadata; }
}

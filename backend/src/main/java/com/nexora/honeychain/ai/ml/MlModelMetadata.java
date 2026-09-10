package com.nexora.honeychain.ai.ml;

import java.util.List;

public class MlModelMetadata {
    private String modelVersion;
    private String modelName;
    private String trainingDate;
    private int trainingSamplesCount;
    private double accuracy;
    private double f1Score;
    private List<String> features;
    private String datasetDescription;

    public MlModelMetadata() {}

    public MlModelMetadata(String modelVersion, String modelName, String trainingDate, int trainingSamplesCount, double accuracy, double f1Score, List<String> features, String datasetDescription) {
        this.modelVersion = modelVersion;
        this.modelName = modelName;
        this.trainingDate = trainingDate;
        this.trainingSamplesCount = trainingSamplesCount;
        this.accuracy = accuracy;
        this.f1Score = f1Score;
        this.features = features;
        this.datasetDescription = datasetDescription;
    }

    public String getModelVersion() { return modelVersion; }
    public String getModelName() { return modelName; }
    public String getTrainingDate() { return trainingDate; }
    public int getTrainingSamplesCount() { return trainingSamplesCount; }
    public double getAccuracy() { return accuracy; }
    public double getF1Score() { return f1Score; }
    public List<String> getFeatures() { return features; }
    public String getDatasetDescription() { return datasetDescription; }
}

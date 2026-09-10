package com.nexora.honeychain.ai.ml;

import java.util.*;

/**
 * Pure Java Random Forest Classifier implementation for embedded Spring Boot ML inference.
 * Trains an ensemble of decision trees using bootstrap sampling and random feature selection.
 */
public class RandomForestClassifier {

    private static class TreeNode {
        int featureIndex = -1;
        double threshold = 0.0;
        int predictedClass = -1;
        double[] classProbabilities;
        TreeNode left;
        TreeNode right;

        boolean isLeaf() {
            return predictedClass != -1;
        }
    }

    private final int numTrees;
    private final int maxDepth;
    private final List<TreeNode> trees = new ArrayList<>();
    private final Random random = new Random(42); // Fixed seed for reproducible dev builds

    public RandomForestClassifier(int numTrees, int maxDepth) {
        this.numTrees = numTrees;
        this.maxDepth = maxDepth;
    }

    public void train(double[][] X, int[] y, int numClasses) {
        trees.clear();
        int nSamples = X.length;
        if (nSamples == 0) return;

        int nFeatures = X[0].length;
        int featuresPerSplit = Math.max(1, (int) Math.sqrt(nFeatures));

        for (int i = 0; i < numTrees; i++) {
            // Bootstrap sampling
            double[][] bootX = new double[nSamples][nFeatures];
            int[] bootY = new int[nSamples];
            for (int j = 0; j < nSamples; j++) {
                int idx = random.nextInt(nSamples);
                bootX[j] = X[idx];
                bootY[j] = y[idx];
            }

            TreeNode root = buildTree(bootX, bootY, 0, maxDepth, featuresPerSplit, numClasses);
            trees.add(root);
        }
    }

    private TreeNode buildTree(double[][] X, int[] y, int depth, int maxDepth, int featuresPerSplit, int numClasses) {
        TreeNode node = new TreeNode();
        int nSamples = X.length;

        // Calculate class distribution
        double[] counts = new double[numClasses];
        for (int label : y) {
            if (label >= 0 && label < numClasses) {
                counts[label]++;
            }
        }

        int maxClass = 0;
        for (int c = 1; c < numClasses; c++) {
            if (counts[c] > counts[maxClass]) {
                maxClass = c;
            }
        }

        node.classProbabilities = new double[numClasses];
        for (int c = 0; c < numClasses; c++) {
            node.classProbabilities[c] = nSamples > 0 ? counts[c] / nSamples : (c == maxClass ? 1.0 : 0.0);
        }

        // Stop criteria: max depth reached, homogeneous sample, or too small
        if (depth >= maxDepth || nSamples <= 2 || isHomogeneous(y)) {
            node.predictedClass = maxClass;
            return node;
        }

        int nFeatures = X[0].length;
        List<Integer> featureIndices = new ArrayList<>();
        for (int f = 0; f < nFeatures; f++) featureIndices.add(f);
        Collections.shuffle(featureIndices, random);

        int bestFeature = -1;
        double bestThreshold = 0.0;
        double bestGiniGain = -1.0;

        double currentGini = calculateGini(counts, nSamples);

        for (int f = 0; f < Math.min(featuresPerSplit, featureIndices.size()); f++) {
            int featIdx = featureIndices.get(f);
            for (int i = 0; i < nSamples; i++) {
                double thresh = X[i][featIdx];
                int leftCount = 0;
                int rightCount = 0;
                double[] leftCounts = new double[numClasses];
                double[] rightCounts = new double[numClasses];

                for (int j = 0; j < nSamples; j++) {
                    if (X[j][featIdx] <= thresh) {
                        leftCount++;
                        leftCounts[y[j]]++;
                    } else {
                        rightCount++;
                        rightCounts[y[j]]++;
                    }
                }

                if (leftCount == 0 || rightCount == 0) continue;

                double leftGini = calculateGini(leftCounts, leftCount);
                double rightGini = calculateGini(rightCounts, rightCount);
                double splitGini = (leftCount * leftGini + rightCount * rightGini) / nSamples;
                double giniGain = currentGini - splitGini;

                if (giniGain > bestGiniGain) {
                    bestGiniGain = giniGain;
                    bestFeature = featIdx;
                    bestThreshold = thresh;
                }
            }
        }

        if (bestFeature == -1 || bestGiniGain <= 1e-6) {
            node.predictedClass = maxClass;
            return node;
        }

        node.featureIndex = bestFeature;
        node.threshold = bestThreshold;

        // Split data
        List<double[]> leftXList = new ArrayList<>();
        List<Integer> leftYList = new ArrayList<>();
        List<double[]> rightXList = new ArrayList<>();
        List<Integer> rightYList = new ArrayList<>();

        for (int i = 0; i < nSamples; i++) {
            if (X[i][bestFeature] <= bestThreshold) {
                leftXList.add(X[i]);
                leftYList.add(y[i]);
            } else {
                rightXList.add(X[i]);
                rightYList.add(y[i]);
            }
        }

        node.left = buildTree(leftXList.toArray(new double[0][]), leftYList.stream().mapToInt(i->i).toArray(), depth + 1, maxDepth, featuresPerSplit, numClasses);
        node.right = buildTree(rightXList.toArray(new double[0][]), rightYList.stream().mapToInt(i->i).toArray(), depth + 1, maxDepth, featuresPerSplit, numClasses);

        return node;
    }

    private boolean isHomogeneous(int[] y) {
        if (y.length == 0) return true;
        int first = y[0];
        for (int val : y) {
            if (val != first) return false;
        }
        return true;
    }

    private double calculateGini(double[] counts, int total) {
        if (total == 0) return 0.0;
        double sumSq = 0.0;
        for (double count : counts) {
            double p = count / total;
            sumSq += p * p;
        }
        return 1.0 - sumSq;
    }

    public double[] predictProbabilities(double[] features, int numClasses) {
        if (trees.isEmpty()) {
            double[] probs = new double[numClasses];
            probs[0] = 1.0;
            return probs;
        }

        double[] avgProbs = new double[numClasses];
        for (TreeNode tree : trees) {
            double[] treeProbs = predictTreeProbabilities(tree, features, numClasses);
            for (int c = 0; c < numClasses; c++) {
                avgProbs[c] += treeProbs[c] / trees.size();
            }
        }
        return avgProbs;
    }

    private double[] predictTreeProbabilities(TreeNode node, double[] features, int numClasses) {
        if (node.isLeaf() || node.featureIndex == -1 || node.featureIndex >= features.length) {
            return node.classProbabilities;
        }
        if (features[node.featureIndex] <= node.threshold) {
            return predictTreeProbabilities(node.left, features, numClasses);
        } else {
            return predictTreeProbabilities(node.right, features, numClasses);
        }
    }

    public int predict(double[] features, int numClasses) {
        double[] probs = predictProbabilities(features, numClasses);
        int maxClass = 0;
        for (int c = 1; c < numClasses; c++) {
            if (probs[c] > probs[maxClass]) {
                maxClass = c;
            }
        }
        return maxClass;
    }
}

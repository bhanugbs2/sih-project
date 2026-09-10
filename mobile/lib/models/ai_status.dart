class AIStatusResponse {
  final String hiveId;
  final double latestRiskScore;
  final String status;
  final String message;
  final String lastAnalysisTimestamp;
  final String? modelVersion;
  final String? screeningMethod;
  final double? confidenceScore;

  AIStatusResponse({
    required this.hiveId,
    required this.latestRiskScore,
    required this.status,
    required this.message,
    required this.lastAnalysisTimestamp,
    this.modelVersion,
    this.screeningMethod,
    this.confidenceScore,
  });

  factory AIStatusResponse.fromJson(Map<String, dynamic> json) {
    return AIStatusResponse(
      hiveId: json['hiveId']?.toString() ?? '',
      latestRiskScore: (json['latestRiskScore'] as num?)?.toDouble() ?? 0.0,
      status: json['status']?.toString() ?? 'NORMAL',
      message: json['message']?.toString() ?? '',
      lastAnalysisTimestamp: json['lastAnalysisTimestamp']?.toString() ?? DateTime.now().toIso8601String(),
      modelVersion: json['modelVersion']?.toString() ?? 'v1.2.0-standalone',
      screeningMethod: json['screeningMethod']?.toString() ?? 'Rule-based anomaly detection',
      confidenceScore: (json['confidenceScore'] as num?)?.toDouble(),
    );
  }
}

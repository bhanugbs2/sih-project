class TelemetryAnalysisRequest {
  final String hiveId;
  final double? temperature;
  final double? humidity;
  final double? soundLevel;

  TelemetryAnalysisRequest({
    required this.hiveId,
    this.temperature,
    this.humidity,
    this.soundLevel,
  });

  Map<String, dynamic> toJson() {
    return {
      'hiveId': hiveId,
      if (temperature != null) 'temperature': temperature,
      if (humidity != null) 'humidity': humidity,
      if (soundLevel != null) 'soundLevel': soundLevel,
    };
  }
}

class TelemetryAnalysisResponse {
  final String hiveId;
  final double riskScore;
  final String alertStatus;
  final String message;
  final List<String> anomalyFactors;
  final String modelVersion;
  final String screeningMethod;
  final double? confidenceScore;

  TelemetryAnalysisResponse({
    required this.hiveId,
    required this.riskScore,
    required this.alertStatus,
    required this.message,
    required this.anomalyFactors,
    required this.modelVersion,
    required this.screeningMethod,
    this.confidenceScore,
  });

  factory TelemetryAnalysisResponse.fromJson(Map<String, dynamic> json) {
    List<String> parsedAnomalies = [];
    if (json['anomalyFactors'] != null && json['anomalyFactors'] is List) {
      parsedAnomalies = (json['anomalyFactors'] as List).map((e) => e.toString()).toList();
    }
    return TelemetryAnalysisResponse(
      hiveId: json['hiveId']?.toString() ?? '',
      riskScore: (json['riskScore'] as num?)?.toDouble() ?? 0.0,
      alertStatus: json['alertStatus']?.toString() ?? 'NORMAL',
      message: json['message']?.toString() ?? '',
      anomalyFactors: parsedAnomalies,
      modelVersion: json['modelVersion']?.toString() ?? 'v1.2.0-standalone',
      screeningMethod: json['screeningMethod']?.toString() ?? 'Telemetry screening',
      confidenceScore: (json['confidenceScore'] as num?)?.toDouble(),
    );
  }
}

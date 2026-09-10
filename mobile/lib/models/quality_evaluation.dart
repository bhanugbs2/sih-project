class QualityEvaluationRequest {
  final String? batchId;
  final double? moisture;
  final double? ph;
  final String? color;

  QualityEvaluationRequest({
    this.batchId,
    this.moisture,
    this.ph,
    this.color,
  });

  Map<String, dynamic> toJson() {
    return {
      if (batchId != null) 'batchId': batchId,
      if (moisture != null) 'moisture': moisture,
      if (ph != null) 'ph': ph,
      if (color != null) 'color': color,
    };
  }
}

class QualityEvaluationResponse {
  final String? batchId;
  final double purityScore;
  final String adulterationClass;
  final String recommendation;
  final List<String> riskFactors;
  final String modelVersion;
  final String screeningMethod;
  final double? confidenceScore;

  QualityEvaluationResponse({
    this.batchId,
    required this.purityScore,
    required this.adulterationClass,
    required this.recommendation,
    required this.riskFactors,
    required this.modelVersion,
    required this.screeningMethod,
    this.confidenceScore,
  });

  factory QualityEvaluationResponse.fromJson(Map<String, dynamic> json) {
    List<String> parsedRiskFactors = [];
    if (json['riskFactors'] != null) {
      if (json['riskFactors'] is List) {
        parsedRiskFactors = (json['riskFactors'] as List).map((e) => e.toString()).toList();
      }
    }
    return QualityEvaluationResponse(
      batchId: json['batchId']?.toString(),
      purityScore: (json['purityScore'] as num?)?.toDouble() ?? 100.0,
      adulterationClass: json['adulterationClass']?.toString() ?? 'PURE',
      recommendation: json['recommendation']?.toString() ?? 'Standard quality',
      riskFactors: parsedRiskFactors,
      modelVersion: json['modelVersion']?.toString() ?? 'v1.2.0-standalone',
      screeningMethod: json['screeningMethod']?.toString() ?? 'Physicochemical evaluation',
      confidenceScore: (json['confidenceScore'] as num?)?.toDouble(),
    );
  }
}

class QualityTest {
  final String id;
  final String batchId;
  final double? moisture;
  final double? ph;
  final String? color;
  final String? notes;
  final String result; // PASS, FAIL, REQUIRES_REVIEW, PENDING
  final String? verifiedBy;
  final String timestamp;
  final String? testedAt;
  final String? createdAt;

  // AI screening fields
  final String? aiScreeningClass;
  final double? aiPurityScore;
  final String? aiRecommendation;

  QualityTest({
    required this.id,
    required this.batchId,
    this.moisture,
    this.ph,
    this.color,
    this.notes,
    required this.result,
    this.verifiedBy,
    required this.timestamp,
    this.testedAt,
    this.createdAt,
    this.aiScreeningClass,
    this.aiPurityScore,
    this.aiRecommendation,
  });

  factory QualityTest.fromJson(Map<String, dynamic> json) {
    return QualityTest(
      id: json['id']?.toString() ?? '',
      batchId: json['batchId']?.toString() ?? '',
      moisture: (json['moisture'] as num?)?.toDouble(),
      ph: (json['ph'] as num?)?.toDouble(),
      color: json['color']?.toString(),
      notes: json['notes']?.toString(),
      result: json['result']?.toString() ?? 'PENDING',
      verifiedBy: json['verifiedBy']?.toString(),
      timestamp: json['timestamp']?.toString() ?? DateTime.now().toIso8601String(),
      testedAt: json['testedAt']?.toString(),
      createdAt: json['createdAt']?.toString(),
      aiScreeningClass: json['aiScreeningClass']?.toString(),
      aiPurityScore: (json['aiPurityScore'] as num?)?.toDouble(),
      aiRecommendation: json['aiRecommendation']?.toString(),
    );
  }
}

class AIAlert {
  final String id;
  final String hiveId;
  final double riskScore;
  final String status; // NORMAL, WARNING, CRITICAL
  final String message;
  final String? factors;
  final String timestamp;
  final String? createdAt;
  final bool isRead;
  final String? readAt;
  final bool isAcknowledged;
  final String? acknowledgedAt;
  final String? acknowledgedBy;
  final String alertType;
  final String? modelVersion;
  final String? batchId;

  AIAlert({
    required this.id,
    required this.hiveId,
    required this.riskScore,
    required this.status,
    required this.message,
    this.factors,
    required this.timestamp,
    this.createdAt,
    this.isRead = false,
    this.readAt,
    this.isAcknowledged = false,
    this.acknowledgedAt,
    this.acknowledgedBy,
    this.alertType = 'TELEMETRY_ANOMALY',
    this.modelVersion,
    this.batchId,
  });

  factory AIAlert.fromJson(Map<String, dynamic> json) {
    return AIAlert(
      id: json['id']?.toString() ?? '',
      hiveId: json['hiveId']?.toString() ?? '',
      riskScore: (json['riskScore'] as num?)?.toDouble() ?? 0.0,
      status: json['status']?.toString() ?? 'NORMAL',
      message: json['message']?.toString() ?? '',
      factors: json['factors']?.toString(),
      timestamp: json['timestamp']?.toString() ?? DateTime.now().toIso8601String(),
      createdAt: json['createdAt']?.toString(),
      isRead: json['read'] == true || json['isRead'] == true,
      readAt: json['readAt']?.toString(),
      isAcknowledged: json['acknowledged'] == true || json['isAcknowledged'] == true,
      acknowledgedAt: json['acknowledgedAt']?.toString(),
      acknowledgedBy: json['acknowledgedBy']?.toString(),
      alertType: json['alertType']?.toString() ?? 'TELEMETRY_ANOMALY',
      modelVersion: json['modelVersion']?.toString(),
      batchId: json['batchId']?.toString(),
    );
  }
}

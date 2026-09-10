class ProcessingRecord {
  final String id;
  final String batchId;
  final String processType;
  final String? operation;
  final String? operator;
  final String? startedAt;
  final String? completedAt;
  final double? processingTemperature;
  final String? tempSource;
  final String? description;
  final String timestamp;
  final String? verifiedBy;
  final String? createdAt;

  ProcessingRecord({
    required this.id,
    required this.batchId,
    required this.processType,
    this.operation,
    this.operator,
    this.startedAt,
    this.completedAt,
    this.processingTemperature,
    this.tempSource,
    this.description,
    required this.timestamp,
    this.verifiedBy,
    this.createdAt,
  });

  factory ProcessingRecord.fromJson(Map<String, dynamic> json) {
    return ProcessingRecord(
      id: json['id']?.toString() ?? '',
      batchId: json['batchId']?.toString() ?? '',
      processType: json['processType']?.toString() ?? 'PROCESSING',
      operation: json['operation']?.toString(),
      operator: json['operator']?.toString(),
      startedAt: json['startedAt']?.toString(),
      completedAt: json['completedAt']?.toString(),
      processingTemperature: (json['processingTemperature'] as num?)?.toDouble(),
      tempSource: json['tempSource']?.toString() ?? 'Processing Vessel Sensor',
      description: json['description']?.toString(),
      timestamp: json['timestamp']?.toString() ?? DateTime.now().toIso8601String(),
      verifiedBy: json['verifiedBy']?.toString(),
      createdAt: json['createdAt']?.toString(),
    );
  }
}

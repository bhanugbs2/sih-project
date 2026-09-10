class HoneyBatch {
  final String id;
  final String batchId;
  final String hiveId;
  final String? farmId;
  final String? farmName;
  final String harvestDate;
  final double quantity;
  final String unit;
  final String? harvestNotes;
  final String? quantitySource;
  final String status; // HARVESTED, QUALITY_TESTING, QUALITY_TESTED, QUALITY_VERIFIED, PROCESSING, PROCESSED, READY_FOR_PACKAGING, REQUIRES_REVIEW, PACKAGED, COMPLETED, RECALLED
  final String? createdAt;
  final String? updatedAt;

  HoneyBatch({
    required this.id,
    required this.batchId,
    required this.hiveId,
    this.farmId,
    this.farmName,
    required this.harvestDate,
    required this.quantity,
    required this.unit,
    this.harvestNotes,
    this.quantitySource,
    required this.status,
    this.createdAt,
    this.updatedAt,
  });

  factory HoneyBatch.fromJson(Map<String, dynamic> json) {
    return HoneyBatch(
      id: json['id']?.toString() ?? '',
      batchId: json['batchId']?.toString() ?? '',
      hiveId: json['hiveId']?.toString() ?? '',
      farmId: json['farmId']?.toString(),
      farmName: json['farmName']?.toString(),
      harvestDate: json['harvestDate']?.toString() ?? DateTime.now().toIso8601String(),
      quantity: (json['quantity'] as num?)?.toDouble() ?? 0.0,
      unit: json['unit']?.toString() ?? 'kg',
      harvestNotes: json['harvestNotes']?.toString(),
      quantitySource: json['quantitySource']?.toString(),
      status: json['status']?.toString() ?? 'HARVESTED',
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'batchId': batchId,
      'hiveId': hiveId,
      'farmId': farmId,
      'farmName': farmName,
      'harvestDate': harvestDate,
      'quantity': quantity,
      'unit': unit,
      'harvestNotes': harvestNotes,
      'quantitySource': quantitySource,
      'status': status,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

class PackageModel {
  final String id;
  final String packageId;
  final String batchId;
  final String? qrUrl;
  final String status; // CREATED, PACKAGED, RECALLED, VERIFIED
  final String? packagingDate;
  final String? createdAt;
  final String? updatedAt;

  PackageModel({
    required this.id,
    required this.packageId,
    required this.batchId,
    this.qrUrl,
    required this.status,
    this.packagingDate,
    this.createdAt,
    this.updatedAt,
  });

  factory PackageModel.fromJson(Map<String, dynamic> json) {
    return PackageModel(
      id: json['id']?.toString() ?? '',
      packageId: json['packageId']?.toString() ?? '',
      batchId: json['batchId']?.toString() ?? '',
      qrUrl: json['qrUrl']?.toString(),
      status: json['status']?.toString() ?? 'CREATED',
      packagingDate: json['packagingDate']?.toString(),
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
    );
  }
}

class TraceabilityEvent {
  final String id;
  final String batchId;
  final String? packageId;
  final String eventType;
  final String eventDataHash;
  final String timestamp;
  final String? blockchainReference;
  final String environment;
  final String? blockchainStatus;
  final String? blockchainTransactionHash;
  final String? blockchainNetwork;
  final String? blockchainTimestamp;
  final String? blockchainDataHash;
  final String? createdAt;

  TraceabilityEvent({
    required this.id,
    required this.batchId,
    this.packageId,
    required this.eventType,
    required this.eventDataHash,
    required this.timestamp,
    this.blockchainReference,
    required this.environment,
    this.blockchainStatus,
    this.blockchainTransactionHash,
    this.blockchainNetwork,
    this.blockchainTimestamp,
    this.blockchainDataHash,
    this.createdAt,
  });

  factory TraceabilityEvent.fromJson(Map<String, dynamic> json) {
    return TraceabilityEvent(
      id: json['id']?.toString() ?? '',
      batchId: json['batchId']?.toString() ?? '',
      packageId: json['packageId']?.toString(),
      eventType: json['eventType']?.toString() ?? 'EVENT',
      eventDataHash: json['eventDataHash']?.toString() ?? '',
      timestamp: json['timestamp']?.toString() ?? DateTime.now().toIso8601String(),
      blockchainReference: json['blockchainReference']?.toString(),
      environment: json['environment']?.toString() ?? 'DEVELOPMENT',
      blockchainStatus: json['blockchainStatus']?.toString() ?? 'OFF_CHAIN_VERIFIED',
      blockchainTransactionHash: json['blockchainTransactionHash']?.toString(),
      blockchainNetwork: json['blockchainNetwork']?.toString(),
      blockchainTimestamp: json['blockchainTimestamp']?.toString(),
      blockchainDataHash: json['blockchainDataHash']?.toString(),
      createdAt: json['createdAt']?.toString(),
    );
  }
}

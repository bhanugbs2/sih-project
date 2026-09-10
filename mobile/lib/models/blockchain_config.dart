class BlockchainConfigStatus {
  final bool enabled;
  final bool configured;
  final String networkName;
  final int chainId;
  final String contractAddress;
  final String rpcUrl;

  BlockchainConfigStatus({
    required this.enabled,
    required this.configured,
    required this.networkName,
    required this.chainId,
    required this.contractAddress,
    required this.rpcUrl,
  });

  factory BlockchainConfigStatus.fromJson(Map<String, dynamic> json) {
    return BlockchainConfigStatus(
      enabled: json['enabled'] as bool? ?? false,
      configured: json['configured'] as bool? ?? false,
      networkName: json['networkName']?.toString() ?? 'Local Hardhat EVM',
      chainId: (json['chainId'] as num?)?.toInt() ?? 31337,
      contractAddress: json['contractAddress']?.toString() ?? '',
      rpcUrl: json['rpcUrl']?.toString() ?? 'http://127.0.0.1:8545',
    );
  }
}

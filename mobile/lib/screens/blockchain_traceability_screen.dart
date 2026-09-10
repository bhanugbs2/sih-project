import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/blockchain_config.dart';
import '../models/traceability_event.dart';
import '../services/blockchain_service.dart';

class BlockchainTraceabilityScreen extends StatefulWidget {
  final String? batchId;

  const BlockchainTraceabilityScreen({super.key, this.batchId});

  @override
  State<BlockchainTraceabilityScreen> createState() => _BlockchainTraceabilityScreenState();
}

class _BlockchainTraceabilityScreenState extends State<BlockchainTraceabilityScreen> {
  bool _isLoading = true;
  String? _errorMessage;

  BlockchainConfigStatus? _config;
  List<TraceabilityEvent> _events = [];

  @override
  void initState() {
    super.initState();
    _loadBlockchainData();
  }

  Future<void> _loadBlockchainData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      BlockchainConfigStatus? cfg;
      try {
        cfg = await BlockchainService.getBlockchainStatus();
      } catch (_) {}

      List<TraceabilityEvent> evts = [];
      if (widget.batchId != null && widget.batchId!.isNotEmpty) {
        evts = await BlockchainService.getBatchBlockchainTraceability(widget.batchId!);
      }

      setState(() {
        _config = cfg;
        _events = evts;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.batchId != null ? 'Blockchain Ledger — ${widget.batchId}' : 'Blockchain EVM Ledger'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadBlockchainData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? _buildErrorWidget()
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Blockchain Network Status Card
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.hub, color: AppTheme.primaryAmber, size: 28),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          _config?.networkName ?? 'Local Hardhat EVM',
                                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                        ),
                                        Text(
                                          'Chain ID: ${_config?.chainId ?? 31337} | EVM Contract',
                                          style: const TextStyle(fontSize: 12, color: AppTheme.darkTextSecondary),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: (_config?.enabled ?? false)
                                          ? AppTheme.statusSuccess.withOpacity(0.15)
                                          : AppTheme.statusWarning.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      (_config?.enabled ?? false) ? 'ONLINE' : 'DEVELOPMENT',
                                      style: TextStyle(
                                        color: (_config?.enabled ?? false)
                                            ? AppTheme.statusSuccess
                                            : AppTheme.statusWarning,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 20),
                              if (_config?.contractAddress != null && _config!.contractAddress.isNotEmpty)
                                Text('Contract Address: ${_config?.contractAddress}', style: const TextStyle(fontSize: 11, fontFamily: 'monospace')),
                              if (_config?.rpcUrl != null)
                                Text('RPC Endpoint: ${_config?.rpcUrl}', style: const TextStyle(fontSize: 11, color: AppTheme.darkTextSecondary)),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),
                      const Text(
                        'Anchored Traceability Events',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),

                      _events.isEmpty
                          ? Card(
                              child: Padding(
                                padding: const EdgeInsets.all(18),
                                child: Column(
                                  children: [
                                    const Icon(Icons.link_off, color: AppTheme.darkTextSecondary, size: 40),
                                    const SizedBox(height: 10),
                                    Text(
                                      widget.batchId == null
                                          ? 'Select a honey batch to inspect detailed EVM event hashes.'
                                          : 'Blockchain verification currently unavailable.',
                                      textAlign: TextAlign.center,
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : Column(
                              children: _events.map((e) {
                                return Card(
                                  margin: const EdgeInsets.only(bottom: 10),
                                  child: Padding(
                                    padding: const EdgeInsets.all(14),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              e.eventType,
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppTheme.primaryAmber),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: AppTheme.statusSuccess.withOpacity(0.15),
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: Text(
                                                e.blockchainStatus ?? 'ANCHORED',
                                                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.statusSuccess),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        Text('Data Hash: ${e.eventDataHash}', style: const TextStyle(fontSize: 11, fontFamily: 'monospace')),
                                        if (e.blockchainTransactionHash != null)
                                          Text('Tx Hash: ${e.blockchainTransactionHash}', style: const TextStyle(fontSize: 11, fontFamily: 'monospace', color: AppTheme.statusInfo)),
                                        Text('Environment: Local Hardhat EVM (${e.environment})', style: const TextStyle(fontSize: 11, color: AppTheme.darkTextSecondary)),
                                        Text('Timestamp: ${e.timestamp}', style: const TextStyle(fontSize: 10, color: AppTheme.darkTextSecondary)),
                                      ],
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.cloud_off, size: 50, color: AppTheme.statusDanger),
          const SizedBox(height: 12),
          const Text('Blockchain verification currently unavailable.'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadBlockchainData,
            child: const Text('Retry Connection'),
          ),
        ],
      ),
    );
  }
}

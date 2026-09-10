import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_theme.dart';
import '../models/honey_batch.dart';
import '../models/processing_record.dart';
import '../models/quality_test.dart';
import '../models/traceability_event.dart';
import '../providers/auth_provider.dart';
import '../services/batch_service.dart';
import '../services/blockchain_service.dart';
import '../services/processing_service.dart';
import '../services/quality_service.dart';
import 'blockchain_traceability_screen.dart';
import 'package_screen.dart';
import 'processing_screen.dart';
import 'quality_test_screen.dart';

class BatchDetailScreen extends StatefulWidget {
  final String batchId;

  const BatchDetailScreen({super.key, required this.batchId});

  @override
  State<BatchDetailScreen> createState() => _BatchDetailScreenState();
}

class _BatchDetailScreenState extends State<BatchDetailScreen> {
  bool _isLoading = true;
  String? _errorMessage;

  HoneyBatch? _batch;
  List<QualityTest> _qualityTests = [];
  List<ProcessingRecord> _processingRecords = [];
  List<TraceabilityEvent> _blockchainEvents = [];

  @override
  void initState() {
    super.initState();
    _loadBatchDetails();
  }

  Future<void> _loadBatchDetails() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final batch = await BatchService.getBatchById(widget.batchId);
      List<QualityTest> tests = [];
      List<ProcessingRecord> records = [];
      List<TraceabilityEvent> events = [];

      try {
        tests = await QualityService.getQualityTestsByBatchId(widget.batchId);
      } catch (_) {}

      try {
        records = await ProcessingService.getProcessingRecordsByBatchId(widget.batchId);
      } catch (_) {}

      try {
        events = await BlockchainService.getBatchBlockchainTraceability(widget.batchId);
      } catch (_) {}

      setState(() {
        _batch = batch;
        _qualityTests = tests;
        _processingRecords = records;
        _blockchainEvents = events;
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
    final user = Provider.of<AuthProvider>(context).currentUser;
    final canQualityTest = user != null && (user.role == 'QUALITY_INSPECTOR' || user.role == 'INSPECTOR' || user.role == 'ADMIN');
    final canProcess = user != null && (user.role == 'BEEKEEPER' || user.role == 'ADMIN');

    return Scaffold(
      appBar: AppBar(
        title: Text('Batch ${_batch?.batchId ?? widget.batchId}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadBatchDetails,
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
                      // Overview Header Card
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    _batch?.batchId ?? widget.batchId,
                                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryAmber.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      _batch?.status ?? 'HARVESTED',
                                      style: const TextStyle(
                                        color: AppTheme.primaryAmber,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(height: 20),
                              Text('Source Hive: ${_batch?.hiveId}'),
                              Text('Harvest Date: ${_batch?.harvestDate}'),
                              Text('Quantity: ${_batch?.quantity} ${_batch?.unit}'),
                              if (_batch?.harvestNotes != null && _batch!.harvestNotes!.isNotEmpty)
                                Text('Harvest Notes: ${_batch?.harvestNotes}'),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),
                      // Quality Testing Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Quality Testing',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          if (canQualityTest)
                            TextButton.icon(
                              onPressed: () async {
                                final res = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => QualityTestScreen(batchId: widget.batchId),
                                  ),
                                );
                                if (res == true) _loadBatchDetails();
                              },
                              icon: const Icon(Icons.add, size: 18),
                              label: const Text('Add Test'),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      _qualityTests.isEmpty
                          ? const Card(
                              child: Padding(
                                padding: EdgeInsets.all(14),
                                child: Text('No quality tests recorded yet.'),
                              ),
                            )
                          : Column(
                              children: _qualityTests.map((t) {
                                return Card(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  child: ListTile(
                                    title: Text('Result: ${t.result}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                    subtitle: Text('Moisture: ${t.moisture ?? "N/A"}% | pH: ${t.ph ?? "N/A"} | Color: ${t.color ?? "N/A"}'),
                                    trailing: Text(t.timestamp, style: const TextStyle(fontSize: 11, color: AppTheme.darkTextSecondary)),
                                  ),
                                );
                              }).toList(),
                            ),

                      const SizedBox(height: 20),
                      // Processing Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Processing Workflow',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          if (canProcess)
                            TextButton.icon(
                              onPressed: () async {
                                final res = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ProcessingScreen(batchId: widget.batchId),
                                  ),
                                );
                                if (res == true) _loadBatchDetails();
                              },
                              icon: const Icon(Icons.add, size: 18),
                              label: const Text('Add Process'),
                            ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      _processingRecords.isEmpty
                          ? const Card(
                              child: Padding(
                                padding: EdgeInsets.all(14),
                                child: Text('No processing records logged yet.'),
                              ),
                            )
                          : Column(
                              children: _processingRecords.map((pr) {
                                return Card(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  child: ListTile(
                                    title: Text('${pr.processType} - ${pr.operation ?? "Operation"}', style: const TextStyle(fontWeight: FontWeight.bold)),
                                    subtitle: Text('Operator: ${pr.operator ?? "N/A"} | Temp: ${pr.processingTemperature != null ? "${pr.processingTemperature}°C" : "N/A"}'),
                                    trailing: Text(pr.timestamp, style: const TextStyle(fontSize: 11, color: AppTheme.darkTextSecondary)),
                                  ),
                                );
                              }).toList(),
                            ),

                      const SizedBox(height: 20),
                      // Packaging Action
                      Row(
                        children: [
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () async {
                                final res = await Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => PackageScreen(batchId: widget.batchId),
                                  ),
                                );
                                if (res == true) _loadBatchDetails();
                              },
                              icon: const Icon(Icons.qr_code, color: AppTheme.primaryAmber),
                              label: const Text('Packaging & QR Code'),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 20),
                      // Blockchain Ledger Traceability Section
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Blockchain Hardhat EVM Ledger',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => BlockchainTraceabilityScreen(batchId: widget.batchId),
                                ),
                              );
                            },
                            child: const Text('View Ledger'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      _blockchainEvents.isEmpty
                          ? Card(
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Row(
                                  children: [
                                    const Icon(Icons.link_off, color: AppTheme.darkTextSecondary),
                                    const SizedBox(width: 10),
                                    const Expanded(
                                      child: Text(
                                        'No off-chain event anchored to EVM yet or Blockchain verification currently unavailable.',
                                        style: TextStyle(fontSize: 12),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            )
                          : Column(
                              children: _blockchainEvents.map((e) {
                                return Card(
                                  margin: const EdgeInsets.only(bottom: 8),
                                  child: ListTile(
                                    leading: const Icon(Icons.link, color: AppTheme.primaryAmber),
                                    title: Text(e.eventType, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                    subtitle: Text(
                                      'Hash: ${e.blockchainTransactionHash ?? e.eventDataHash}',
                                      style: const TextStyle(fontSize: 11, fontFamily: 'monospace'),
                                    ),
                                    trailing: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: AppTheme.statusSuccess.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        e.blockchainStatus ?? 'ANCHORED',
                                        style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppTheme.statusSuccess),
                                      ),
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
          const Icon(Icons.error_outline, size: 50, color: AppTheme.statusDanger),
          const SizedBox(height: 12),
          Text(_errorMessage ?? 'Failed to load batch details'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadBatchDetails,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

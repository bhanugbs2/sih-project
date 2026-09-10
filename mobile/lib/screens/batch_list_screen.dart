import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/honey_batch.dart';
import '../services/batch_service.dart';
import 'batch_detail_screen.dart';

class BatchListScreen extends StatefulWidget {
  const BatchListScreen({super.key});

  @override
  State<BatchListScreen> createState() => _BatchListScreenState();
}

class _BatchListScreenState extends State<BatchListScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<HoneyBatch> _batches = [];

  @override
  void initState() {
    super.initState();
    _fetchBatches();
  }

  Future<void> _fetchBatches() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final batches = await BatchService.getAllBatches();
      setState(() {
        _batches = batches;
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
        title: const Text('Honey Batches'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchBatches,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? _buildErrorWidget()
              : _batches.isEmpty
                  ? const Center(child: Text('No honey batches found.'))
                  : RefreshIndicator(
                      onRefresh: _fetchBatches,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _batches.length,
                        itemBuilder: (context, index) {
                          final batch = _batches[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              leading: CircleAvatar(
                                backgroundColor: AppTheme.primaryAmber.withOpacity(0.15),
                                child: const Icon(Icons.inventory_2, color: AppTheme.primaryAmber),
                              ),
                              title: Text(
                                batch.batchId,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 4),
                                  Text('Hive: ${batch.hiveId} | Farm: ${batch.farmName ?? "Apiary"}'),
                                  Text('Quantity: ${batch.quantity} ${batch.unit} | Harvested: ${batch.harvestDate}'),
                                ],
                              ),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _getBadgeColor(batch.status).withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      batch.status,
                                      style: TextStyle(
                                        color: _getBadgeColor(batch.status),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 10,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  const Icon(Icons.chevron_right, color: AppTheme.darkTextSecondary),
                                ],
                              ),
                              onTap: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => BatchDetailScreen(batchId: batch.batchId),
                                  ),
                                );
                              },
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  Color _getBadgeColor(String status) {
    switch (status) {
      case 'HARVESTED':
        return AppTheme.primaryAmber;
      case 'QUALITY_TESTED':
      case 'QUALITY_VERIFIED':
        return AppTheme.statusInfo;
      case 'PROCESSING':
      case 'PROCESSED':
      case 'READY_FOR_PACKAGING':
        return Colors.purple;
      case 'PACKAGED':
      case 'COMPLETED':
        return AppTheme.statusSuccess;
      case 'RECALLED':
        return AppTheme.statusDanger;
      default:
        return AppTheme.primaryAmber;
    }
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 50, color: AppTheme.statusDanger),
          const SizedBox(height: 12),
          Text(_errorMessage ?? 'Failed to load batches'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _fetchBatches,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

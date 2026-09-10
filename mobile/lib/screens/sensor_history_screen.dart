import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/sensor_reading.dart';
import '../services/hive_service.dart';

class SensorHistoryScreen extends StatefulWidget {
  final String hiveId;

  const SensorHistoryScreen({super.key, required this.hiveId});

  @override
  State<SensorHistoryScreen> createState() => _SensorHistoryScreenState();
}

class _SensorHistoryScreenState extends State<SensorHistoryScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<SensorReading> _history = [];

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final history = await HiveService.getHiveSensorHistory(widget.hiveId, limit: 50);
      setState(() {
        _history = history;
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
        title: Text('Sensor History — ${widget.hiveId}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchHistory,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? _buildErrorWidget()
              : _history.isEmpty
                  ? const Center(child: Text('No historical readings found for this hive.'))
                  : RefreshIndicator(
                      onRefresh: _fetchHistory,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _history.length,
                        itemBuilder: (context, index) {
                          final reading = _history[index];
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
                                        'Timestamp: ${reading.timestamp}',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.primaryAmber,
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppTheme.statusSuccess.withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: const Text(
                                          'DHT22 Recorded',
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.statusSuccess,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Divider(height: 16),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Row(
                                          children: [
                                            const Icon(Icons.thermostat, size: 18, color: AppTheme.primaryAmber),
                                            const SizedBox(width: 6),
                                            Text(
                                              reading.temperature != null
                                                  ? '${reading.temperature!.toStringAsFixed(1)} °C'
                                                  : 'N/A',
                                              style: const TextStyle(fontWeight: FontWeight.w600),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Expanded(
                                        child: Row(
                                          children: [
                                            const Icon(Icons.water_drop, size: 18, color: AppTheme.statusInfo),
                                            const SizedBox(width: 6),
                                            Text(
                                              reading.humidity != null
                                                  ? '${reading.humidity!.toStringAsFixed(1)} %'
                                                  : 'N/A',
                                              style: const TextStyle(fontWeight: FontWeight.w600),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          'Weight: ${reading.weight != null ? "${reading.weight!.toStringAsFixed(1)} kg" : "Not Installed"}',
                                          style: const TextStyle(fontSize: 11, color: AppTheme.darkTextSecondary),
                                        ),
                                      ),
                                      Expanded(
                                        child: Text(
                                          'Sound: ${reading.soundLevel != null ? "${reading.soundLevel!.toStringAsFixed(1)} dB" : "Not Installed"}',
                                          style: const TextStyle(fontSize: 11, color: AppTheme.darkTextSecondary),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
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
          Text(_errorMessage ?? 'Failed to load telemetry history'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _fetchHistory,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

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
        title: Text('Industrial Multi-Sensor Log — ${widget.hiveId}'),
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
                            margin: const EdgeInsets.only(bottom: 12),
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
                                        child: Text(
                                          reading.qualityFlags ?? '6-SENSOR SUITE OK',
                                          style: const TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.statusSuccess,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Divider(height: 16),
                                  
                                  // Row 1: Temp & Humidity
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Row(
                                          children: [
                                            const Icon(Icons.thermostat, size: 18, color: AppTheme.primaryAmber),
                                            const SizedBox(width: 6),
                                            Text(
                                              '${reading.displayTemp.toStringAsFixed(1)} °C',
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
                                              '${reading.displayHumidity.toStringAsFixed(1)} %',
                                              style: const TextStyle(fontWeight: FontWeight.w600),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),

                                  // Row 2: Weight & CO2
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Row(
                                          children: [
                                            const Icon(Icons.scale, size: 18, color: AppTheme.statusSuccess),
                                            const SizedBox(width: 6),
                                            Text(
                                              '${reading.displayWeight.toStringAsFixed(2)} kg',
                                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Expanded(
                                        child: Row(
                                          children: [
                                            const Icon(Icons.air, size: 18, color: Colors.purpleAccent),
                                            const SizedBox(width: 6),
                                            Text(
                                              '${reading.displayCo2.toStringAsFixed(0)} ppm',
                                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),

                                  // Row 3: Acoustics & Vibration
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Row(
                                          children: [
                                            const Icon(Icons.graphic_eq, size: 18, color: Colors.pinkAccent),
                                            const SizedBox(width: 6),
                                            Text(
                                              '${reading.displayAcoustics.toStringAsFixed(1)} dB',
                                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                                            ),
                                          ],
                                        ),
                                      ),
                                      Expanded(
                                        child: Row(
                                          children: [
                                            const Icon(Icons.vibration, size: 18, color: Colors.redAccent),
                                            const SizedBox(width: 6),
                                            Text(
                                              '${reading.displayVibrationMag.toStringAsFixed(4)} g',
                                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                                            ),
                                          ],
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
          const Icon(Icons.error_outline, size: 48, color: AppTheme.statusDanger),
          const SizedBox(height: 12),
          Text(_errorMessage ?? 'An error occurred'),
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

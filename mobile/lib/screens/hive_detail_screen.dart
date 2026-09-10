import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/ai_status.dart';
import '../models/hive.dart';
import '../models/sensor_reading.dart';
import '../services/ai_service.dart';
import '../services/hive_service.dart';
import 'sensor_history_screen.dart';

class HiveDetailScreen extends StatefulWidget {
  final String hiveId;

  const HiveDetailScreen({super.key, required this.hiveId});

  @override
  State<HiveDetailScreen> createState() => _HiveDetailScreenState();
}

class _HiveDetailScreenState extends State<HiveDetailScreen> {
  bool _isLoading = true;
  String? _errorMessage;

  Hive? _hive;
  SensorReading? _latestReading;
  AIStatusResponse? _aiStatus;

  @override
  void initState() {
    super.initState();
    _loadHiveData();
  }

  Future<void> _loadHiveData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final hive = await HiveService.getHiveById(widget.hiveId);
      final reading = await HiveService.getLatestSensorReading(widget.hiveId);
      AIStatusResponse? ai;
      try {
        ai = await AIService.getAIStatus(widget.hiveId);
      } catch (_) {}

      setState(() {
        _hive = hive;
        _latestReading = reading;
        _aiStatus = ai;
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
        title: Text(_hive?.name ?? 'Hive ${widget.hiveId}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: 'Sensor History',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => SensorHistoryScreen(hiveId: widget.hiveId),
                ),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadHiveData,
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
                      // Hive General Header
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
                                    _hive?.name ?? 'Hive ${widget.hiveId}',
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _hive?.status == 'ACTIVE'
                                          ? AppTheme.statusSuccess.withOpacity(0.15)
                                          : AppTheme.statusWarning.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      _hive?.status ?? 'UNKNOWN',
                                      style: TextStyle(
                                        color: _hive?.status == 'ACTIVE'
                                            ? AppTheme.statusSuccess
                                            : AppTheme.statusWarning,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Hive ID: ${widget.hiveId}',
                                style: const TextStyle(color: AppTheme.darkTextSecondary),
                              ),
                              Text(
                                'Location: ${_hive?.location ?? _hive?.farm?.name ?? "Apiary Main"}',
                                style: const TextStyle(color: AppTheme.darkTextSecondary),
                              ),
                              if (_latestReading != null) ...[
                                const SizedBox(height: 6),
                                Text(
                                  'Last Telemetry: ${_latestReading!.timestamp}',
                                  style: const TextStyle(fontSize: 12, color: AppTheme.primaryAmber),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),
                      const Text(
                        'Live Sensor Hardware Telemetry',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Hardware Profile: ESP32 + DHT22 + SSD1306 OLED',
                        style: TextStyle(fontSize: 12, color: AppTheme.darkTextSecondary),
                      ),
                      const SizedBox(height: 12),

                      // Sensor Telemetry Cards
                      Row(
                        children: [
                          Expanded(
                            child: _buildSensorCard(
                              title: 'Temperature',
                              value: _latestReading?.temperature != null
                                  ? '${_latestReading!.temperature!.toStringAsFixed(1)} °C'
                                  : 'Data Unavailable',
                              subtitle: 'DHT22 Hardware',
                              icon: Icons.thermostat,
                              color: AppTheme.primaryAmber,
                              isInstalled: _latestReading?.temperature != null,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildSensorCard(
                              title: 'Humidity',
                              value: _latestReading?.humidity != null
                                  ? '${_latestReading!.humidity!.toStringAsFixed(1)} %'
                                  : 'Data Unavailable',
                              subtitle: 'DHT22 Hardware',
                              icon: Icons.water_drop,
                              color: AppTheme.statusInfo,
                              isInstalled: _latestReading?.humidity != null,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: _buildSensorCard(
                              title: 'Hive Weight',
                              value: _latestReading?.weight != null
                                  ? '${_latestReading!.weight!.toStringAsFixed(1)} kg'
                                  : 'Not Installed',
                              subtitle: 'HX711 Load Cell (Deferred)',
                              icon: Icons.scale,
                              color: AppTheme.darkTextSecondary,
                              isInstalled: _latestReading?.weight != null,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _buildSensorCard(
                              title: 'Acoustic Sound',
                              value: _latestReading?.soundLevel != null
                                  ? '${_latestReading!.soundLevel!.toStringAsFixed(1)} dB'
                                  : 'Not Installed',
                              subtitle: 'Microphone (Deferred)',
                              icon: Icons.graphic_eq,
                              color: AppTheme.darkTextSecondary,
                              isInstalled: _latestReading?.soundLevel != null,
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),
                      // AI Screening Card
                      const Text(
                        'AI-Assisted Screening Result',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.psychology, color: AppTheme.primaryAmber),
                                  const SizedBox(width: 8),
                                  Text(
                                    _aiStatus != null ? 'Risk Score: ${_aiStatus!.latestRiskScore.toStringAsFixed(1)}%' : 'AI Anomaly Analysis',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  const Spacer(),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: (_aiStatus?.status == 'NORMAL')
                                          ? AppTheme.statusSuccess.withOpacity(0.15)
                                          : AppTheme.statusWarning.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      _aiStatus?.status ?? 'NORMAL',
                                      style: TextStyle(
                                        color: (_aiStatus?.status == 'NORMAL')
                                            ? AppTheme.statusSuccess
                                            : AppTheme.statusWarning,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 11,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(_aiStatus?.message ?? 'Hive telemetry parameters operating within standard environmental ranges.'),
                              const SizedBox(height: 12),
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: AppTheme.darkBg,
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: AppTheme.darkCardBorder),
                                ),
                                child: const Text(
                                  'AI-assisted screening result — laboratory validation recommended.',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontStyle: FontStyle.italic,
                                    color: AppTheme.primaryAmber,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 20),
                      // View History Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => SensorHistoryScreen(hiveId: widget.hiveId),
                              ),
                            );
                          },
                          icon: const Icon(Icons.show_chart),
                          label: const Text('View Detailed Telemetry History'),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }

  Widget _buildSensorCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required Color color,
    required bool isInstalled,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: color, size: 22),
                if (!isInstalled)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: Colors.grey.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Uninstalled',
                      style: TextStyle(fontSize: 9, color: Colors.grey),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: const TextStyle(fontSize: 12, color: AppTheme.darkTextSecondary),
            ),
            const SizedBox(height: 4),
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isInstalled ? color : AppTheme.darkTextSecondary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 10, color: AppTheme.darkTextSecondary),
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
          Text(_errorMessage ?? 'Failed to load hive details'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadHiveData,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

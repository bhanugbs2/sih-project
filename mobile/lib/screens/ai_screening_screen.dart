import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/quality_evaluation.dart';
import '../models/telemetry_analysis.dart';
import '../services/ai_service.dart';

class AIScreeningScreen extends StatefulWidget {
  const AIScreeningScreen({super.key});

  @override
  State<AIScreeningScreen> createState() => _AIScreeningScreenState();
}

class _AIScreeningScreenState extends State<AIScreeningScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  // Telemetry Tab state
  final _hiveIdController = TextEditingController(text: 'HIVE-001');
  final _tempController = TextEditingController(text: '34.5');
  final _humController = TextEditingController(text: '58.0');
  bool _isAnalyzingTelemetry = false;
  TelemetryAnalysisResponse? _telemetryResult;

  // Quality Tab state
  final _batchIdController = TextEditingController(text: 'BATCH-001');
  final _moistureController = TextEditingController(text: '17.2');
  final _phController = TextEditingController(text: '3.9');
  final _colorController = TextEditingController(text: 'AMBER');
  bool _isEvaluatingQuality = false;
  QualityEvaluationResponse? _qualityResult;

  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _hiveIdController.dispose();
    _tempController.dispose();
    _humController.dispose();
    _batchIdController.dispose();
    _moistureController.dispose();
    _phController.dispose();
    _colorController.dispose();
    super.dispose();
  }

  Future<void> _runTelemetryScreening() async {
    FocusScope.of(context).unfocus();
    setState(() {
      _isAnalyzingTelemetry = true;
      _errorMessage = null;
    });

    try {
      final req = TelemetryAnalysisRequest(
        hiveId: _hiveIdController.text.trim(),
        temperature: double.tryParse(_tempController.text),
        humidity: double.tryParse(_humController.text),
      );

      final res = await AIService.analyzeTelemetry(req);
      setState(() {
        _telemetryResult = res;
        _isAnalyzingTelemetry = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isAnalyzingTelemetry = false;
      });
    }
  }

  Future<void> _runQualityScreening() async {
    FocusScope.of(context).unfocus();
    setState(() {
      _isEvaluatingQuality = true;
      _errorMessage = null;
    });

    try {
      final req = QualityEvaluationRequest(
        batchId: _batchIdController.text.trim(),
        moisture: double.tryParse(_moistureController.text),
        ph: double.tryParse(_phController.text),
        color: _colorController.text.trim(),
      );

      final res = await AIService.evaluateQuality(req);
      setState(() {
        _qualityResult = res;
        _isEvaluatingQuality = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isEvaluatingQuality = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI-Assisted Screening'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppTheme.primaryAmber,
          labelColor: AppTheme.primaryAmber,
          unselectedLabelColor: AppTheme.darkTextSecondary,
          tabs: const [
            Tab(icon: Icon(Icons.sensors), text: 'Telemetry Screening'),
            Tab(icon: Icon(Icons.science), text: 'Quality Screening'),
          ],
        ),
      ),
      body: Column(
        children: [
          // Mandatory Compliance Notice Banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: AppTheme.primaryAmber.withOpacity(0.12),
            child: const Row(
              children: [
                Icon(Icons.info_outline, color: AppTheme.primaryAmber, size: 20),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'AI-assisted screening result — laboratory validation recommended.',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primaryAmber,
                    ),
                  ),
                ),
              ],
            ),
          ),

          if (_errorMessage != null)
            Padding(
              padding: const EdgeInsets.all(12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.statusDanger.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_errorMessage!, style: const TextStyle(color: AppTheme.statusDanger)),
              ),
            ),

          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildTelemetryTab(),
                _buildQualityTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTelemetryTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Input Telemetry Parameters', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _hiveIdController,
                    decoration: const InputDecoration(labelText: 'Hive ID'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _tempController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Temperature (°C)'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _humController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Humidity (%)'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _isAnalyzingTelemetry ? null : _runTelemetryScreening,
                      icon: const Icon(Icons.psychology),
                      label: _isAnalyzingTelemetry
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Run Telemetry Screening'),
                    ),
                  ),
                ],
              ),
            ),
          ),

          if (_telemetryResult != null) ...[
            const SizedBox(height: 20),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Screening Result', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: _telemetryResult!.alertStatus == 'NORMAL'
                                ? AppTheme.statusSuccess.withOpacity(0.15)
                                : AppTheme.statusWarning.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            _telemetryResult!.alertStatus,
                            style: TextStyle(
                              color: _telemetryResult!.alertStatus == 'NORMAL'
                                  ? AppTheme.statusSuccess
                                  : AppTheme.statusWarning,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 20),
                    Text('Model Version: ${_telemetryResult!.modelVersion}'),
                    Text('Screening Method: ${_telemetryResult!.screeningMethod}'),
                    Text('Risk Level Score: ${_telemetryResult!.riskScore.toStringAsFixed(1)}%'),
                    const SizedBox(height: 10),
                    Text('Explanation: ${_telemetryResult!.message}', style: const TextStyle(fontWeight: FontWeight.w500)),
                    if (_telemetryResult!.anomalyFactors.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      const Text('Anomaly Factors:', style: TextStyle(fontWeight: FontWeight.bold)),
                      ..._telemetryResult!.anomalyFactors.map((f) => Text('• $f', style: const TextStyle(fontSize: 13))),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildQualityTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Input Honey Quality Parameters', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _batchIdController,
                    decoration: const InputDecoration(labelText: 'Batch ID'),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _moistureController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'Moisture (%)'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: TextField(
                          controller: _phController,
                          keyboardType: TextInputType.number,
                          decoration: const InputDecoration(labelText: 'pH Level'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _colorController,
                    decoration: const InputDecoration(labelText: 'Color Grade (e.g. AMBER)'),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _isEvaluatingQuality ? null : _runQualityScreening,
                      icon: const Icon(Icons.science),
                      label: _isEvaluatingQuality
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                          : const Text('Run Quality Evaluation'),
                    ),
                  ),
                ],
              ),
            ),
          ),

          if (_qualityResult != null) ...[
            const SizedBox(height: 20),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Quality Evaluation Report', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        Text(
                          'Purity: ${_qualityResult!.purityScore.toStringAsFixed(1)}%',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryAmber, fontSize: 16),
                        ),
                      ],
                    ),
                    const Divider(height: 20),
                    Text('Model Version: ${_qualityResult!.modelVersion}'),
                    Text('Screening Method: ${_qualityResult!.screeningMethod}'),
                    Text('Adulteration Class: ${_qualityResult!.adulterationClass}'),
                    const SizedBox(height: 8),
                    Text('Recommendation: ${_qualityResult!.recommendation}', style: const TextStyle(fontWeight: FontWeight.w500)),
                    if (_qualityResult!.riskFactors.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      const Text('Risk Factors:', style: TextStyle(fontWeight: FontWeight.bold)),
                      ..._qualityResult!.riskFactors.map((rf) => Text('• $rf', style: const TextStyle(fontSize: 13))),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

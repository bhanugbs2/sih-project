import 'dart:async';
import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/ai_alert.dart';
import '../services/ai_service.dart';

class AlertsScreen extends StatefulWidget {
  const AlertsScreen({super.key});

  @override
  State<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends State<AlertsScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<AIAlert> _alerts = [];
  Timer? _pollingTimer;

  @override
  void initState() {
    super.initState();
    _fetchAlerts();
    _pollingTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      _fetchAlerts(isBackground: true);
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _fetchAlerts({bool isBackground = false}) async {
    if (!isBackground) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
    }

    try {
      final alerts = await AIService.getAllAIAlerts();
      if (mounted) {
        setState(() {
          _alerts = alerts;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted && !isBackground) {
        setState(() {
          _errorMessage = 'Unable to load alerts.';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleMarkRead(String alertId) async {
    try {
      final updated = await AIService.markAlertRead(alertId);
      if (updated != null && mounted) {
        setState(() {
          _alerts = _alerts.map((a) => a.id == alertId ? updated : a).toList();
        });
      }
    } catch (_) {}
  }

  Future<void> _handleAcknowledge(String alertId) async {
    try {
      final updated = await AIService.acknowledgeAlert(alertId);
      if (updated != null && mounted) {
        setState(() {
          _alerts = _alerts.map((a) => a.id == alertId ? updated : a).toList();
        });
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Anomaly Alerts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _fetchAlerts(isBackground: false),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? _buildErrorWidget()
              : _alerts.isEmpty
                  ? const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.check_circle_outline, size: 60, color: AppTheme.statusSuccess),
                            SizedBox(height: 16),
                            Text(
                              'All Apiaries Healthy',
                              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(height: 6),
                            Text(
                              'No anomaly alerts or critical risk thresholds triggered.',
                              style: TextStyle(color: AppTheme.darkTextSecondary),
                            ),
                          ],
                        ),
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: () => _fetchAlerts(isBackground: false),
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _alerts.length,
                        itemBuilder: (context, index) {
                          final alert = _alerts[index];
                          final isCritical = alert.status == 'CRITICAL';
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
                                      Row(
                                        children: [
                                          Icon(
                                            isCritical ? Icons.warning_rounded : Icons.info_outline,
                                            color: isCritical ? AppTheme.statusDanger : AppTheme.statusWarning,
                                          ),
                                          const SizedBox(width: 8),
                                          Text(
                                            'Hive ${alert.hiveId}',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                          ),
                                          if (!alert.isRead) ...[
                                            const SizedBox(width: 6),
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                              decoration: BoxDecoration(
                                                color: AppTheme.statusDanger,
                                                borderRadius: BorderRadius.circular(4),
                                              ),
                                              child: const Text(
                                                'NEW',
                                                style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                              ),
                                            ),
                                          ],
                                        ],
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: isCritical
                                              ? AppTheme.statusDanger.withOpacity(0.15)
                                              : AppTheme.statusWarning.withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          alert.status,
                                          style: TextStyle(
                                            color: isCritical ? AppTheme.statusDanger : AppTheme.statusWarning,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const Divider(height: 18),
                                  Text(
                                    alert.message,
                                    style: const TextStyle(fontWeight: FontWeight.w500),
                                  ),
                                  if (alert.factors != null && alert.factors!.isNotEmpty) ...[
                                    const SizedBox(height: 8),
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: AppTheme.darkBg.withOpacity(0.5),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: AppTheme.darkCardBorder),
                                      ),
                                      child: Text(
                                        'Factors: ${alert.factors}',
                                        style: const TextStyle(fontSize: 12, color: AppTheme.primaryAmber),
                                      ),
                                    ),
                                  ],
                                  const SizedBox(height: 8),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          'Risk Score: ${alert.riskScore.toStringAsFixed(1)}% | Recorded: ${alert.timestamp.length > 19 ? alert.timestamp.substring(0, 19).replaceAll('T', ' ') : alert.timestamp}',
                                          style: const TextStyle(fontSize: 11, color: AppTheme.darkTextSecondary),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      if (!alert.isRead) ...[
                                        TextButton.icon(
                                          onPressed: () => _handleMarkRead(alert.id),
                                          icon: const Icon(Icons.visibility_outlined, size: 16),
                                          label: const Text('Mark Read', style: TextStyle(fontSize: 12)),
                                        ),
                                        const SizedBox(width: 8),
                                      ],
                                      if (alert.isAcknowledged) ...[
                                        Chip(
                                          avatar: const Icon(Icons.check_circle, size: 14, color: AppTheme.statusSuccess),
                                          label: Text(
                                            'Acknowledged by ${alert.acknowledgedBy ?? "Beekeeper"}',
                                            style: const TextStyle(fontSize: 11, color: AppTheme.statusSuccess),
                                          ),
                                          backgroundColor: AppTheme.statusSuccess.withOpacity(0.15),
                                          padding: EdgeInsets.zero,
                                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                        ),
                                      ] else ...[
                                        ElevatedButton.icon(
                                          onPressed: () => _handleAcknowledge(alert.id),
                                          icon: const Icon(Icons.check_circle_outline, size: 16),
                                          label: const Text('Acknowledge', style: TextStyle(fontSize: 12)),
                                          style: ElevatedButton.styleFrom(
                                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                          ),
                                        ),
                                      ],
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
          Text(_errorMessage ?? 'Unable to load alerts.'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () => _fetchAlerts(isBackground: false),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

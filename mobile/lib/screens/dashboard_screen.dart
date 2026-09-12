import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_theme.dart';
import '../models/ai_alert.dart';
import '../models/hive.dart';
import '../models/honey_batch.dart';
import '../models/user.dart';
import '../providers/auth_provider.dart';
import '../services/ai_service.dart';
import '../services/batch_service.dart';
import '../services/hive_service.dart';
import '../services/user_service.dart';
import 'admin_users_screen.dart';
import 'ai_screening_screen.dart';
import 'blockchain_traceability_screen.dart';
import 'hive_detail_screen.dart';
import 'qr_scanner_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isLoading = true;
  String? _errorMessage;

  List<Hive> _hives = [];
  List<HoneyBatch> _batches = [];
  List<AIAlert> _alerts = [];
  int _unreadAlertCount = 0;
  List<User> _systemUsers = [];

  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
    // Auto-refresh polling loop every 15 seconds while dashboard is active
    _refreshTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      _loadDashboardData(isBackground: true);
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadDashboardData({bool isBackground = false}) async {
    if (_hives.isEmpty && !isBackground) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
    }

    try {
      final user = Provider.of<AuthProvider>(context, listen: false).currentUser;
      final results = await Future.wait([
        HiveService.getAllHives(),
        BatchService.getAllBatches(),
        AIService.getAllAIAlerts(),
        AIService.getUnreadAlertCount(),
        if (user != null && user.isAdmin) UserService.getAllUsers() else Future.value(<User>[]),
      ]);

      if (mounted) {
        setState(() {
          _hives = results[0] as List<Hive>;
          _batches = results[1] as List<HoneyBatch>;
          _alerts = results[2] as List<AIAlert>;
          _unreadAlertCount = results[3] as int;
          _systemUsers = results[4] as List<User>;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          if (_hives.isEmpty) {
            _errorMessage = e.toString();
          }
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.hive_rounded, color: AppTheme.primaryAmber),
            const SizedBox(width: 8),
            Text('HoneyChain Mobile'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            tooltip: 'QR Scanner',
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const QRScannerScreen()),
              );
            },
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDashboardData,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? _buildErrorWidget()
              : RefreshIndicator(
                  onRefresh: _loadDashboardData,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Welcome Banner
                        Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 26,
                                  backgroundColor: AppTheme.primaryAmber.withOpacity(0.2),
                                  child: const Icon(Icons.person, color: AppTheme.primaryAmber, size: 30),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Welcome, ${user?.username ?? "User"}',
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppTheme.primaryAmber.withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          'Role: ${user?.role ?? "BEEKEEPER"}',
                                          style: const TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w600,
                                            color: AppTheme.primaryAmber,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Metric Overview Grid
                        Row(
                          children: [
                            Expanded(
                              child: _buildMetricCard(
                                title: 'Total Hives',
                                value: _hives.length.toString(),
                                icon: Icons.grid_view_rounded,
                                color: AppTheme.primaryAmber,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildMetricCard(
                                title: 'Honey Batches',
                                value: _batches.length.toString(),
                                icon: Icons.inventory_2_rounded,
                                color: AppTheme.statusInfo,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: _buildMetricCard(
                                title: 'AI Alerts',
                                value: _unreadAlertCount > 0 ? '$_unreadAlertCount Unread' : '${_alerts.length} Total',
                                icon: Icons.warning_amber_rounded,
                                color: _unreadAlertCount > 0 ? AppTheme.statusDanger : AppTheme.statusSuccess,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: _buildMetricCard(
                                title: user?.isAdmin == true ? 'System Users' : 'Active Status',
                                value: user?.isAdmin == true ? '${_systemUsers.length} Users' : '${_hives.where((h) => h.status == "ACTIVE").length} Hives',
                                icon: user?.isAdmin == true ? Icons.people_alt : Icons.sensors_rounded,
                                color: AppTheme.statusSuccess,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 20),
                        // Quick Action Buttons
                        const Text(
                          'Quick Services',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => const AIScreeningScreen()),
                                  );
                                },
                                icon: const Icon(Icons.psychology, color: AppTheme.primaryAmber),
                                label: const Text('AI Screening', style: TextStyle(fontSize: 12)),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: OutlinedButton.icon(
                                onPressed: () {
                                  Navigator.push(
                                    context,
                                    MaterialPageRoute(builder: (_) => const BlockchainTraceabilityScreen()),
                                  );
                                },
                                icon: const Icon(Icons.link, color: AppTheme.primaryAmber),
                                label: const Text('Blockchain', style: TextStyle(fontSize: 12)),
                              ),
                            ),
                            if (user?.isAdmin == true) ...[
                              const SizedBox(width: 8),
                              Expanded(
                                child: OutlinedButton.icon(
                                  onPressed: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(builder: (_) => const AdminUsersScreen()),
                                    );
                                  },
                                  icon: const Icon(Icons.admin_panel_settings, color: AppTheme.primaryAmber),
                                  label: const Text('User Admin', style: TextStyle(fontSize: 12)),
                                ),
                              ),
                            ],
                          ],
                        ),

                        const SizedBox(height: 24),
                        // Hives Telemetry Summary List
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Apiary Hives',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              '${_hives.length} Total',
                              style: const TextStyle(color: AppTheme.darkTextSecondary, fontSize: 13),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _hives.isEmpty
                            ? const Card(
                                child: Padding(
                                  padding: EdgeInsets.all(16),
                                  child: Text('No hives registered yet.'),
                                ),
                              )
                            : Column(
                                children: _hives.take(4).map((hive) {
                                  return Card(
                                    margin: const EdgeInsets.only(bottom: 8),
                                    child: ListTile(
                                      leading: const CircleAvatar(
                                        backgroundColor: AppTheme.darkBg,
                                        child: Icon(Icons.hive, color: AppTheme.primaryAmber),
                                      ),
                                      title: Text(
                                        hive.name.isNotEmpty ? hive.name : hive.hiveId,
                                        style: const TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                      subtitle: Text(
                                        'Location: ${hive.location ?? hive.farm?.name ?? "Apiary"}',
                                        style: const TextStyle(fontSize: 12),
                                      ),
                                      trailing: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: hive.status == 'ACTIVE'
                                              ? AppTheme.statusSuccess.withOpacity(0.15)
                                              : AppTheme.statusWarning.withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: Text(
                                          hive.status,
                                          style: TextStyle(
                                            color: hive.status == 'ACTIVE'
                                                ? AppTheme.statusSuccess
                                                : AppTheme.statusWarning,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ),
                                      onTap: () {
                                        Navigator.push(
                                          context,
                                          MaterialPageRoute(
                                            builder: (_) => HiveDetailScreen(hiveId: hive.hiveId),
                                          ),
                                        );
                                      },
                                    ),
                                  );
                                }).toList(),
                              ),

                        const SizedBox(height: 20),
                        // Recent AI Alerts
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Recent AI Alerts',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            Text(
                              '${_alerts.length} Total',
                              style: const TextStyle(color: AppTheme.darkTextSecondary, fontSize: 13),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _alerts.isEmpty
                            ? const Card(
                                child: Padding(
                                  padding: EdgeInsets.all(16),
                                  child: Row(
                                    children: [
                                      Icon(Icons.check_circle, color: AppTheme.statusSuccess),
                                      SizedBox(width: 10),
                                      Text('No anomaly alerts detected.'),
                                    ],
                                  ),
                                ),
                              )
                            : Column(
                                children: _alerts.take(3).map((alert) {
                                  final isCritical = alert.status == 'CRITICAL';
                                  return Card(
                                    margin: const EdgeInsets.only(bottom: 8),
                                    child: ListTile(
                                      leading: Icon(
                                        isCritical ? Icons.warning_rounded : Icons.info_outline,
                                        color: isCritical ? AppTheme.statusDanger : AppTheme.statusWarning,
                                      ),
                                      title: Text(
                                        'Hive ${alert.hiveId} - Risk ${alert.riskScore.toStringAsFixed(1)}%',
                                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                      ),
                                      subtitle: Text(
                                        alert.message,
                                        style: const TextStyle(fontSize: 12),
                                      ),
                                    ),
                                  );
                                }).toList(),
                              ),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
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
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppTheme.darkTextSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Icon(icon, color: color, size: 20),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off, size: 60, color: AppTheme.statusDanger),
            const SizedBox(height: 16),
            const Text(
              'No connection to HoneyChain server.',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage ?? 'Unable to communicate with Spring Boot API.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.darkTextSecondary),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: _loadDashboardData,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry Connection'),
            ),
          ],
        ),
      ),
    );
  }
}

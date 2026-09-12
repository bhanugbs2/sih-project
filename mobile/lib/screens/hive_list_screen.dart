import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/hive.dart';
import '../services/hive_service.dart';
import 'hive_detail_screen.dart';

class HiveListScreen extends StatefulWidget {
  const HiveListScreen({super.key});

  @override
  State<HiveListScreen> createState() => _HiveListScreenState();
}

class _HiveListScreenState extends State<HiveListScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<Hive> _hives = [];

  @override
  void initState() {
    super.initState();
    _fetchHives();
  }

  Future<void> _fetchHives() async {
    if (_hives.isEmpty) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
    }
    try {
      final hives = await HiveService.getAllHives();
      if (mounted) {
        setState(() {
          _hives = hives;
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Apiary Hives'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchHives,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? _buildErrorWidget()
              : _hives.isEmpty
                  ? const Center(child: Text('No hives found.'))
                  : RefreshIndicator(
                      onRefresh: _fetchHives,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _hives.length,
                        itemBuilder: (context, index) {
                          final hive = _hives[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              leading: CircleAvatar(
                                backgroundColor: AppTheme.primaryAmber.withOpacity(0.15),
                                child: const Icon(Icons.hive, color: AppTheme.primaryAmber),
                              ),
                              title: Text(
                                hive.name.isNotEmpty ? hive.name : hive.hiveId,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 4),
                                  Text('ID: ${hive.hiveId}'),
                                  Text('Location: ${hive.location ?? hive.farm?.name ?? "Apiary Main"}'),
                                ],
                              ),
                              trailing: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: hive.status == 'ACTIVE'
                                          ? AppTheme.statusSuccess.withOpacity(0.15)
                                          : AppTheme.statusWarning.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(8),
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
                                  const SizedBox(height: 4),
                                  const Icon(Icons.chevron_right, color: AppTheme.darkTextSecondary),
                                ],
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
          Text(_errorMessage ?? 'Failed to load hives'),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _fetchHives,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

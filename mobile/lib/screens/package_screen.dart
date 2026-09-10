import 'package:flutter/material.dart';
import '../core/config/api_config.dart';
import '../core/theme/app_theme.dart';
import '../models/package_model.dart';
import '../services/package_service.dart';

class PackageScreen extends StatefulWidget {
  final String batchId;

  const PackageScreen({super.key, required this.batchId});

  @override
  State<PackageScreen> createState() => _PackageScreenState();
}

class _PackageScreenState extends State<PackageScreen> {
  final _packageIdController = TextEditingController();
  bool _isCreating = false;
  String? _errorMessage;
  PackageModel? _createdPackage;

  @override
  void initState() {
    super.initState();
    _packageIdController.text = 'PKG-${widget.batchId}-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
  }

  @override
  void dispose() {
    _packageIdController.dispose();
    super.dispose();
  }

  Future<void> _handleCreatePackage() async {
    final pkgId = _packageIdController.text.trim();
    if (pkgId.isEmpty) return;

    setState(() {
      _isCreating = true;
      _errorMessage = null;
    });

    try {
      final req = {
        'packageId': pkgId,
        'batchId': widget.batchId,
        'qrUrl': '${ApiConfig.baseUrl}/verify/$pkgId',
        'status': 'PACKAGED',
      };

      final package = await PackageService.createPackage(req);

      setState(() {
        _createdPackage = package;
        _isCreating = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isCreating = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Package Generation — ${widget.batchId}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (_errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: AppTheme.statusDanger.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_errorMessage!, style: const TextStyle(color: AppTheme.statusDanger)),
              ),

            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Generate Honey Package & QR Code', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 14),
                    TextField(
                      controller: _packageIdController,
                      decoration: const InputDecoration(
                        labelText: 'Package Serial / Unique ID',
                        prefixIcon: Icon(Icons.qr_code_2),
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _isCreating ? null : _handleCreatePackage,
                        icon: const Icon(Icons.inventory),
                        label: _isCreating
                            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                            : const Text('CREATE PACKAGE & STAMP QR'),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            if (_createdPackage != null) ...[
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      const Icon(Icons.check_circle_rounded, color: AppTheme.statusSuccess, size: 50),
                      const SizedBox(height: 10),
                      const Text(
                        'Package Created Successfully!',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.statusSuccess),
                      ),
                      const Divider(height: 24),
                      Text('Package Serial: ${_createdPackage!.packageId}', style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text('Batch Reference: ${_createdPackage!.batchId}'),
                      Text('Status: ${_createdPackage!.status}'),
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          children: [
                            const Icon(Icons.qr_code_2, size: 100, color: Colors.black),
                            const SizedBox(height: 6),
                            Text(
                              '/verify/${_createdPackage!.packageId}',
                              style: const TextStyle(color: Colors.black87, fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'Verification Endpoint:\n${ApiConfig.baseUrl}/verify/${_createdPackage!.packageId}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 11, color: AppTheme.primaryAmber),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

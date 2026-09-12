import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import 'public_verification_screen.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final _inputController = TextEditingController(text: 'PKG-DEMO-001');

  void _navigateToVerification(String rawPayload) {
    String packageId = rawPayload.trim();
    if (packageId.contains('/verify/')) {
      packageId = packageId.split('/verify/').last;
    }
    if (packageId.contains('?')) {
      packageId = packageId.split('?').first;
    }
    if (packageId.isEmpty) return;

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => PublicVerificationScreen(packageId: packageId),
      ),
    );
  }

  @override
  void dispose() {
    _inputController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('HoneyChain QR Verification'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              // Interactive QR Code Scanner Frame Box
              Expanded(
                child: Material(
                  color: AppTheme.darkCard,
                  borderRadius: BorderRadius.circular(16),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => _navigateToVerification(_inputController.text),
                    splashColor: AppTheme.primaryAmber.withOpacity(0.2),
                    highlightColor: AppTheme.primaryAmber.withOpacity(0.1),
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.primaryAmber, width: 2),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(22),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryAmber.withOpacity(0.15),
                              shape: BoxShape.circle,
                              border: Border.all(color: AppTheme.primaryAmber.withOpacity(0.4), width: 1.5),
                            ),
                            child: const Icon(
                              Icons.qr_code_scanner_rounded,
                              size: 90,
                              color: AppTheme.primaryAmber,
                            ),
                          ),
                          const SizedBox(height: 18),
                          const Text(
                            'Align HoneyChain Package QR Code',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 24),
                            child: Text(
                              'Public Customer Scanner — No Beekeeper Login Required',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13,
                                color: AppTheme.darkTextSecondary,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryAmber.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppTheme.primaryAmber),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.touch_app, size: 16, color: AppTheme.primaryAmber),
                                SizedBox(width: 6),
                                Text(
                                  'Tap Frame to Scan & Verify',
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryAmber,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 18),
              // Package Code Manual Input for Emulator & Physical Fallback
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Enter Package Serial Code / URL',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: _inputController,
                        decoration: const InputDecoration(
                          hintText: 'e.g. PKG-DEMO-001 or /verify/PKG-001',
                          prefixIcon: Icon(Icons.numbers),
                        ),
                      ),
                      const SizedBox(height: 10),
                      // Quick Sample Package Chips
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            const Text(
                              'Samples: ',
                              style: TextStyle(fontSize: 11, color: AppTheme.darkTextSecondary),
                            ),
                            ActionChip(
                              label: const Text('PKG-DEMO-001', style: TextStyle(fontSize: 11)),
                              onPressed: () {
                                setState(() {
                                  _inputController.text = 'PKG-DEMO-001';
                                });
                                _navigateToVerification('PKG-DEMO-001');
                              },
                            ),
                            const SizedBox(width: 6),
                            ActionChip(
                              label: const Text('PKG-HIM-2026-001', style: TextStyle(fontSize: 11)),
                              onPressed: () {
                                setState(() {
                                  _inputController.text = 'PKG-HIM-2026-001';
                                });
                                _navigateToVerification('PKG-HIM-2026-001');
                              },
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            _navigateToVerification(_inputController.text);
                          },
                          icon: const Icon(Icons.verified),
                          label: const Text('VERIFY HONEY PROVENANCE'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

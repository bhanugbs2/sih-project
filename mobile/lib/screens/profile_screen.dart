import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/config/api_config.dart';
import '../core/theme/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import 'admin_users_screen.dart';
import 'blockchain_traceability_screen.dart';
import 'qr_scanner_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _urlController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _urlController.text = ApiConfig.baseUrl;
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  void _showServerConfigDialog() {
    _urlController.text = ApiConfig.baseUrl;
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Server Network Config'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Configure Spring Boot API Base URL:\n• Android Emulator: http://10.0.2.2:8080\n• Physical Phone: http://<DEVELOPER-PC-IP>:8080',
                style: TextStyle(fontSize: 12, color: AppTheme.darkTextSecondary),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _urlController,
                decoration: const InputDecoration(
                  labelText: 'API Base URL',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final newUrl = _urlController.text.trim();
                if (newUrl.isNotEmpty) {
                  final messenger = ScaffoldMessenger.of(context);
                  final navigator = Navigator.of(context);
                  await ApiConfig.setBaseUrl(newUrl);
                  messenger.showSnackBar(
                    SnackBar(content: Text('Server URL set to: ${ApiConfig.baseUrl}')),
                  );
                  navigator.pop();
                  if (mounted) setState(() {});
                }
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final user = authProvider.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile & Settings'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // User Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 32,
                      backgroundColor: AppTheme.primaryAmber.withOpacity(0.2),
                      child: const Icon(Icons.person, color: AppTheme.primaryAmber, size: 36),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.username ?? 'HoneyChain User',
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            user?.email ?? 'user@honeychain.io',
                            style: const TextStyle(fontSize: 13, color: AppTheme.darkTextSecondary),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppTheme.primaryAmber.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Role: ${user?.role ?? "BEEKEEPER"}',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
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

            const SizedBox(height: 20),
            const Text('Application Services', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),

            Card(
              child: Column(
                children: [
                  if (user?.isAdmin == true) ...[
                    ListTile(
                      leading: const Icon(Icons.admin_panel_settings, color: AppTheme.primaryAmber),
                      title: const Text('Admin User Management'),
                      subtitle: const Text('Manage user accounts, enable/disable & role assignment'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const AdminUsersScreen()),
                        );
                      },
                    ),
                    const Divider(height: 1),
                  ],
                  ListTile(
                    leading: const Icon(Icons.qr_code_scanner, color: AppTheme.primaryAmber),
                    title: const Text('Customer Package QR Verification'),
                    subtitle: const Text('Public provenance lookup (No Auth Required)'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const QRScannerScreen()),
                      );
                    },
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.link, color: AppTheme.primaryAmber),
                    title: const Text('Blockchain Hardhat EVM Ledger'),
                    subtitle: const Text('View off-chain event hashes & EVM status'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const BlockchainTraceabilityScreen()),
                      );
                    },
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),
            const Text('System Preferences', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),

            Card(
              child: Column(
                children: [
                  SwitchListTile(
                    secondary: Icon(
                      themeProvider.isDarkMode ? Icons.dark_mode : Icons.light_mode,
                      color: AppTheme.primaryAmber,
                    ),
                    title: const Text('Dark Theme'),
                    subtitle: Text(themeProvider.isDarkMode ? 'Dark Mode Active' : 'Light Mode Active'),
                    value: themeProvider.isDarkMode,
                    onChanged: (val) {
                      themeProvider.toggleTheme();
                    },
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.wifi_tethering, color: AppTheme.primaryAmber),
                    title: const Text('Spring Boot Server URL'),
                    subtitle: Text(ApiConfig.baseUrl),
                    trailing: const Icon(Icons.edit_outlined),
                    onTap: _showServerConfigDialog,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  await authProvider.logout();
                },
                icon: const Icon(Icons.logout),
                label: const Text('SIGN OUT'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.statusDanger,
                  foregroundColor: Colors.white,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

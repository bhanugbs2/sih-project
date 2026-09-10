import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/user.dart';
import '../services/user_service.dart';

class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<User> _users = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchUsers();
  }

  Future<void> _fetchUsers() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final users = await UserService.getAllUsers();
      setState(() {
        _users = users;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _confirmToggleStatus(User user) async {
    final action = user.enabled ? 'disable' : 'enable';
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Confirm Account ${action.toUpperCase()}'),
          content: Text('Are you sure you want to $action user account "${user.username}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: user.enabled ? AppTheme.statusDanger : AppTheme.statusSuccess,
                foregroundColor: Colors.white,
              ),
              child: Text(action.toUpperCase()),
            ),
          ],
        );
      },
    );

    if (confirm == true) {
      try {
        final updated = await UserService.toggleUserEnabled(user.id, !user.enabled);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('User ${updated.username} account ${updated.enabled ? "enabled" : "disabled"}.'),
              backgroundColor: AppTheme.statusSuccess,
            ),
          );
          _fetchUsers();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(e.toString()),
              backgroundColor: AppTheme.statusDanger,
            ),
          );
        }
      }
    }
  }

  Future<void> _showChangeRoleDialog(User user) async {
    String selectedRole = user.role;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: Text('Assign Role — ${user.username}'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Select allowed platform role:', style: TextStyle(fontSize: 13, color: AppTheme.darkTextSecondary)),
                  const SizedBox(height: 12),
                  RadioListTile<String>(
                    title: const Text('Administrator (ADMIN)'),
                    value: 'ADMIN',
                    groupValue: selectedRole,
                    onChanged: (val) => setDialogState(() => selectedRole = val!),
                  ),
                  RadioListTile<String>(
                    title: const Text('Beekeeper (BEEKEEPER)'),
                    value: 'BEEKEEPER',
                    groupValue: selectedRole,
                    onChanged: (val) => setDialogState(() => selectedRole = val!),
                  ),
                  RadioListTile<String>(
                    title: const Text('Quality Inspector (QUALITY_INSPECTOR)'),
                    value: 'QUALITY_INSPECTOR',
                    groupValue: selectedRole,
                    onChanged: (val) => setDialogState(() => selectedRole = val!),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: const Text('Save Role'),
                ),
              ],
            );
          },
        );
      },
    );

    if (confirm == true && selectedRole != user.role) {
      try {
        final updated = await UserService.updateUserRole(user.id, selectedRole);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('User ${updated.username} role assigned to ${updated.roleDisplayName}.'),
              backgroundColor: AppTheme.statusSuccess,
            ),
          );
          _fetchUsers();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(e.toString()),
              backgroundColor: AppTheme.statusDanger,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final filteredUsers = _users.where((u) {
      final q = _searchQuery.toLowerCase();
      return u.username.toLowerCase().contains(q) || u.email.toLowerCase().contains(q) || u.role.toLowerCase().contains(q);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin User Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchUsers,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? _buildErrorWidget()
              : Column(
                  children: [
                    // Search Bar
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: TextField(
                        decoration: const InputDecoration(
                          hintText: 'Search user by name, email, or role...',
                          prefixIcon: Icon(Icons.search),
                        ),
                        onChanged: (val) {
                          setState(() {
                            _searchQuery = val;
                          });
                        },
                      ),
                    ),

                    Expanded(
                      child: filteredUsers.isEmpty
                          ? const Center(child: Text('No users match search query.'))
                          : RefreshIndicator(
                              onRefresh: _fetchUsers,
                              child: ListView.builder(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                itemCount: filteredUsers.length,
                                itemBuilder: (context, index) {
                                  final user = filteredUsers[index];
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
                                                  CircleAvatar(
                                                    radius: 20,
                                                    backgroundColor: AppTheme.primaryAmber.withOpacity(0.15),
                                                    child: Icon(
                                                      user.isAdmin ? Icons.admin_panel_settings : Icons.person,
                                                      color: AppTheme.primaryAmber,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 12),
                                                  Column(
                                                    crossAxisAlignment: CrossAxisAlignment.start,
                                                    children: [
                                                      Text(
                                                        user.username,
                                                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                                      ),
                                                      Text(
                                                        user.email,
                                                        style: const TextStyle(fontSize: 12, color: AppTheme.darkTextSecondary),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                decoration: BoxDecoration(
                                                  color: user.enabled
                                                      ? AppTheme.statusSuccess.withOpacity(0.15)
                                                      : AppTheme.statusDanger.withOpacity(0.15),
                                                  borderRadius: BorderRadius.circular(6),
                                                ),
                                                child: Text(
                                                  user.enabled ? 'ACTIVE' : 'DISABLED',
                                                  style: TextStyle(
                                                    color: user.enabled ? AppTheme.statusSuccess : AppTheme.statusDanger,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 10,
                                                  ),
                                                ),
                                              ),
                                            ],
                                          ),
                                          const Divider(height: 18),
                                          Row(
                                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                            children: [
                                              Container(
                                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                decoration: BoxDecoration(
                                                  color: AppTheme.primaryAmber.withOpacity(0.15),
                                                  borderRadius: BorderRadius.circular(4),
                                                ),
                                                child: Text(
                                                  'Role: ${user.roleDisplayName}',
                                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.primaryAmber),
                                                ),
                                              ),
                                              Row(
                                                children: [
                                                  OutlinedButton.icon(
                                                    onPressed: () => _showChangeRoleDialog(user),
                                                    icon: const Icon(Icons.edit, size: 14),
                                                    label: const Text('Role', style: TextStyle(fontSize: 11)),
                                                    style: OutlinedButton.styleFrom(
                                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                      minimumSize: Size.zero,
                                                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 8),
                                                  OutlinedButton.icon(
                                                    onPressed: () => _confirmToggleStatus(user),
                                                    icon: Icon(user.enabled ? Icons.block : Icons.check_circle, size: 14, color: user.enabled ? AppTheme.statusDanger : AppTheme.statusSuccess),
                                                    label: Text(user.enabled ? 'Disable' : 'Enable', style: TextStyle(fontSize: 11, color: user.enabled ? AppTheme.statusDanger : AppTheme.statusSuccess)),
                                                    style: OutlinedButton.styleFrom(
                                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                      minimumSize: Size.zero,
                                                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                                      side: BorderSide(color: user.enabled ? AppTheme.statusDanger : AppTheme.statusSuccess),
                                                    ),
                                                  ),
                                                ],
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
                    ),
                  ],
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
            const Icon(Icons.gpp_maybe, size: 60, color: AppTheme.statusDanger),
            const SizedBox(height: 16),
            const Text(
              'User Management Restricted',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage ?? 'You do not have permission to perform this action.',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.darkTextSecondary),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _fetchUsers,
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
}

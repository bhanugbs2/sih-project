import 'package:flutter/material.dart';
import '../core/storage/auth_storage.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _currentUser;
  bool _isLoading = true;
  String? _errorMessage;

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _currentUser != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  String get role => _currentUser?.role ?? 'GUEST';

  AuthProvider() {
    initAuth();
  }

  Future<void> initAuth() async {
    _isLoading = true;
    notifyListeners();

    try {
      final cachedUser = await AuthStorage.getUser();
      final token = await AuthStorage.getToken();

      if (token != null && token.isNotEmpty) {
        if (cachedUser != null) {
          _currentUser = cachedUser;
          _isLoading = false;
          notifyListeners();
        }

        try {
          final user = await AuthService.getCurrentUser();
          _currentUser = user;
        } catch (e) {
          if (cachedUser == null) {
            _currentUser = null;
            await AuthStorage.clearAuth();
          }
        }
      } else {
        _currentUser = null;
      }
    } catch (_) {
      _currentUser = null;
      await AuthStorage.clearAuth();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> login(String username, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final authResp = await AuthService.login(username, password);
      try {
        final user = await AuthService.getCurrentUser();
        _currentUser = user;
      } catch (_) {
        _currentUser = User(
          id: authResp.username,
          username: authResp.username,
          email: '${authResp.username}@honeychain.io',
          role: authResp.role,
          enabled: true,
        );
        await AuthStorage.saveUser(_currentUser!);
      }
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _currentUser = null;
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await AuthService.logout();
    _currentUser = null;
    _errorMessage = null;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}

import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../models/user.dart';

class AuthStorage {
  static const String _keyToken = 'honeychain_secure_jwt';
  static const String _keyLegacyToken = 'honeychain_token';
  static const String _keyUser = 'honeychain_user';

  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static Future<void> saveToken(String token) async {
    await _secureStorage.write(key: _keyToken, value: token);
    // Purge legacy unencrypted SharedPreferences entry if present
    final prefs = await SharedPreferences.getInstance();
    if (prefs.containsKey(_keyLegacyToken)) {
      await prefs.remove(_keyLegacyToken);
    }
  }

  static Future<String?> getToken() async {
    // Check secure storage first
    String? token = await _secureStorage.read(key: _keyToken);
    if (token != null && token.isNotEmpty) {
      return token;
    }

    // Auto-migrate from legacy SharedPreferences if present
    final prefs = await SharedPreferences.getInstance();
    final legacyToken = prefs.getString(_keyLegacyToken);
    if (legacyToken != null && legacyToken.isNotEmpty) {
      await _secureStorage.write(key: _keyToken, value: legacyToken);
      await prefs.remove(_keyLegacyToken);
      return legacyToken;
    }

    return null;
  }

  static Future<void> saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUser, jsonEncode(user.toJson()));
  }

  static Future<User?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString(_keyUser);
    if (userStr == null || userStr.isEmpty) return null;
    try {
      final jsonMap = jsonDecode(userStr) as Map<String, dynamic>;
      return User.fromJson(jsonMap);
    } catch (_) {
      return null;
    }
  }

  static Future<void> clearAuth() async {
    await _secureStorage.delete(key: _keyToken);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyLegacyToken);
    await prefs.remove(_keyUser);
  }
}

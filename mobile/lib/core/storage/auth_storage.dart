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

  static String? _cachedToken;
  static User? _cachedUser;

  static Future<void> saveToken(String token) async {
    _cachedToken = token;
    await _secureStorage.write(key: _keyToken, value: token);
    final prefs = await SharedPreferences.getInstance();
    if (prefs.containsKey(_keyLegacyToken)) {
      await prefs.remove(_keyLegacyToken);
    }
  }

  static Future<String?> getToken() async {
    if (_cachedToken != null && _cachedToken!.isNotEmpty) {
      return _cachedToken;
    }

    String? token = await _secureStorage.read(key: _keyToken);
    if (token != null && token.isNotEmpty) {
      _cachedToken = token;
      return token;
    }

    final prefs = await SharedPreferences.getInstance();
    final legacyToken = prefs.getString(_keyLegacyToken);
    if (legacyToken != null && legacyToken.isNotEmpty) {
      _cachedToken = legacyToken;
      await _secureStorage.write(key: _keyToken, value: legacyToken);
      await prefs.remove(_keyLegacyToken);
      return legacyToken;
    }

    return null;
  }

  static Future<void> saveUser(User user) async {
    _cachedUser = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_keyUser, jsonEncode(user.toJson()));
  }

  static Future<User?> getUser() async {
    if (_cachedUser != null) {
      return _cachedUser;
    }

    final prefs = await SharedPreferences.getInstance();
    final userStr = prefs.getString(_keyUser);
    if (userStr == null || userStr.isEmpty) return null;
    try {
      final jsonMap = jsonDecode(userStr) as Map<String, dynamic>;
      _cachedUser = User.fromJson(jsonMap);
      return _cachedUser;
    } catch (_) {
      return null;
    }
  }

  static Future<void> clearAuth() async {
    _cachedToken = null;
    _cachedUser = null;
    await _secureStorage.delete(key: _keyToken);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_keyLegacyToken);
    await prefs.remove(_keyUser);
  }
}

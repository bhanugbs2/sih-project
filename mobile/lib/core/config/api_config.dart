import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  static const String keyBaseUrl = 'honeychain_api_base_url';
  static const String defaultEmulatorUrl = 'http://192.168.31.246:8080';
  static const String envUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');
  
  static String _baseUrl = envUrl.isNotEmpty ? envUrl : defaultEmulatorUrl;

  static String get baseUrl => _baseUrl;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    final savedUrl = prefs.getString(keyBaseUrl);
    if (savedUrl != null && savedUrl.isNotEmpty) {
      _baseUrl = savedUrl;
    } else if (envUrl.isNotEmpty) {
      _baseUrl = envUrl;
    } else {
      _baseUrl = defaultEmulatorUrl;
    }
  }

  static Future<void> setBaseUrl(String url) async {
    String formattedUrl = url.trim();
    if (formattedUrl.endsWith('/')) {
      formattedUrl = formattedUrl.substring(0, formattedUrl.length - 1);
    }
    _baseUrl = formattedUrl;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyBaseUrl, _baseUrl);
  }
}


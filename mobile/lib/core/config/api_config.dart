import 'package:shared_preferences/shared_preferences.dart';

class ApiConfig {
  static const String keyBaseUrl = 'honeychain_api_base_url';
  static const String defaultEmulatorUrl = 'http://10.0.2.2:8080';
  
  static String _baseUrl = defaultEmulatorUrl;

  static String get baseUrl => _baseUrl;

  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _baseUrl = prefs.getString(keyBaseUrl) ?? defaultEmulatorUrl;
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

import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../storage/auth_storage.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class NetworkException implements Exception {
  final String message;
  NetworkException([this.message = 'No connection to HoneyChain server.']);

  @override
  String toString() => message;
}

class ApiClient {
  static const Duration timeoutDuration = Duration(seconds: 12);
  static bool _isHandlingUnauth = false;
  static final http.Client _client = http.Client();

  static Future<Map<String, String>> _getHeaders({bool includeAuth = true}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (includeAuth) {
      final token = await AuthStorage.getToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
    return headers;
  }

  static Uri _buildUri(String path, [Map<String, String>? queryParameters]) {
    final cleanPath = path.startsWith('/') ? path : '/$path';
    final fullUrl = '${ApiConfig.baseUrl}$cleanPath';
    final uri = Uri.parse(fullUrl);
    if (queryParameters != null && queryParameters.isNotEmpty) {
      return uri.replace(queryParameters: queryParameters);
    }
    return uri;
  }

  static dynamic _processResponse(http.Response response) {
    final statusCode = response.statusCode;

    if (statusCode >= 200 && statusCode < 300) {
      if (response.body.isEmpty) return null;
      try {
        return jsonDecode(response.body);
      } catch (_) {
        return response.body;
      }
    }

    if (statusCode == 401) {
      if (!_isHandlingUnauth) {
        _isHandlingUnauth = true;
        AuthStorage.clearAuth().whenComplete(() {
          _isHandlingUnauth = false;
        });
      }
      throw ApiException('Session expired or unauthorized. Please log in again.', statusCode: 401);
    }

    if (statusCode == 403) {
      throw ApiException('You do not have permission to perform this action.', statusCode: 403);
    }

    String errorMsg = 'Server returned error status code: $statusCode';
    if (response.body.isNotEmpty) {
      try {
        final decoded = jsonDecode(response.body);
        if (decoded is Map) {
          if (decoded.containsKey('message') && decoded['message'] != null) {
            errorMsg = decoded['message'].toString();
          } else if (decoded.containsKey('error') && decoded['error'] != null) {
            errorMsg = decoded['error'].toString();
          }
        }
      } catch (_) {}
    }

    throw ApiException(errorMsg, statusCode: statusCode);
  }

  static Future<dynamic> get(String path, {Map<String, String>? queryParameters, bool includeAuth = true}) async {
    try {
      final uri = _buildUri(path, queryParameters);
      final headers = await _getHeaders(includeAuth: includeAuth);
      final response = await _client.get(uri, headers: headers).timeout(timeoutDuration);
      return _processResponse(response);
    } on TimeoutException {
      throw NetworkException('Request timed out. Please check server availability.');
    } on SocketException {
      throw NetworkException('No connection to HoneyChain server.');
    } catch (e) {
      if (e is ApiException || e is NetworkException) rethrow;
      throw NetworkException('Network error: ${e.toString()}');
    }
  }

  static Future<dynamic> post(String path, {dynamic body, bool includeAuth = true}) async {
    try {
      final uri = _buildUri(path);
      final headers = await _getHeaders(includeAuth: includeAuth);
      final jsonBody = body != null ? jsonEncode(body) : null;
      final response = await _client.post(uri, headers: headers, body: jsonBody).timeout(timeoutDuration);
      return _processResponse(response);
    } on TimeoutException {
      throw NetworkException('Request timed out. Please check server availability.');
    } on SocketException {
      throw NetworkException('No connection to HoneyChain server.');
    } catch (e) {
      if (e is ApiException || e is NetworkException) rethrow;
      throw NetworkException('Network error: ${e.toString()}');
    }
  }

  static Future<dynamic> put(String path, {dynamic body, bool includeAuth = true}) async {
    try {
      final uri = _buildUri(path);
      final headers = await _getHeaders(includeAuth: includeAuth);
      final jsonBody = body != null ? jsonEncode(body) : null;
      final response = await _client.put(uri, headers: headers, body: jsonBody).timeout(timeoutDuration);
      return _processResponse(response);
    } on TimeoutException {
      throw NetworkException('Request timed out. Please check server availability.');
    } on SocketException {
      throw NetworkException('No connection to HoneyChain server.');
    } catch (e) {
      if (e is ApiException || e is NetworkException) rethrow;
      throw NetworkException('Network error: ${e.toString()}');
    }
  }

  static Future<dynamic> patch(String path, {dynamic body, bool includeAuth = true}) async {
    try {
      final uri = _buildUri(path);
      final headers = await _getHeaders(includeAuth: includeAuth);
      final jsonBody = body != null ? jsonEncode(body) : null;
      final response = await _client.patch(uri, headers: headers, body: jsonBody).timeout(timeoutDuration);
      return _processResponse(response);
    } on TimeoutException {
      throw NetworkException('Request timed out. Please check server availability.');
    } on SocketException {
      throw NetworkException('No connection to HoneyChain server.');
    } catch (e) {
      if (e is ApiException || e is NetworkException) rethrow;
      throw NetworkException('Network error: ${e.toString()}');
    }
  }

  static Future<dynamic> delete(String path, {bool includeAuth = true}) async {
    try {
      final uri = _buildUri(path);
      final headers = await _getHeaders(includeAuth: includeAuth);
      final response = await _client.delete(uri, headers: headers).timeout(timeoutDuration);
      return _processResponse(response);
    } on TimeoutException {
      throw NetworkException('Request timed out. Please check server availability.');
    } on SocketException {
      throw NetworkException('No connection to HoneyChain server.');
    } catch (e) {
      if (e is ApiException || e is NetworkException) rethrow;
      throw NetworkException('Network error: ${e.toString()}');
    }
  }
}

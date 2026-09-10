import '../core/network/api_client.dart';
import '../core/storage/auth_storage.dart';
import '../models/user.dart';

class AuthService {
  static Future<AuthResponse> login(String username, String password) async {
    final response = await ApiClient.post(
      '/api/auth/login',
      body: {
        'username': username,
        'password': password,
      },
      includeAuth: false,
    );
    final authResp = AuthResponse.fromJson(response);
    await AuthStorage.saveToken(authResp.token);
    return authResp;
  }

  static Future<User> getCurrentUser() async {
    final response = await ApiClient.get('/api/auth/me');
    final user = User.fromJson(response);
    await AuthStorage.saveUser(user);
    return user;
  }

  static Future<void> logout() async {
    await AuthStorage.clearAuth();
  }
}

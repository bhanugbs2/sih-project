import '../core/network/api_client.dart';
import '../models/user.dart';

class UserService {
  static Future<List<User>> getAllUsers() async {
    final response = await ApiClient.get('/api/users');
    if (response is List) {
      return response.map((item) => User.fromJson(item)).toList();
    }
    return [];
  }

  static Future<User> getUserById(String id) async {
    final response = await ApiClient.get('/api/users/$id');
    return User.fromJson(response);
  }

  static Future<User> toggleUserEnabled(String id, bool enabled) async {
    final response = await ApiClient.patch(
      '/api/users/$id/enabled',
      body: {'enabled': enabled},
    );
    return User.fromJson(response);
  }

  static Future<User> updateUserRole(String id, String role) async {
    final response = await ApiClient.patch(
      '/api/users/$id/role',
      body: {'role': role},
    );
    return User.fromJson(response);
  }
}

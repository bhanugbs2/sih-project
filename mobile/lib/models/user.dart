class User {
  final String id;
  final String username;
  final String email;
  final String role; // ADMIN, BEEKEEPER, QUALITY_INSPECTOR / INSPECTOR
  final bool enabled;
  final String? createdAt;
  final String? updatedAt;

  User({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    required this.enabled,
    this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'BEEKEEPER',
      enabled: json['enabled'] as bool? ?? true,
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'role': role,
      'enabled': enabled,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  bool get isAdmin => role == 'ADMIN';
  bool get isBeekeeper => role == 'BEEKEEPER' || role == 'ADMIN';
  bool get isInspector => role == 'QUALITY_INSPECTOR' || role == 'INSPECTOR' || role == 'ADMIN';

  String get roleDisplayName {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'QUALITY_INSPECTOR':
      case 'INSPECTOR':
        return 'Quality Inspector';
      case 'BEEKEEPER':
        return 'Beekeeper';
      default:
        return role;
    }
  }
}

class AuthResponse {
  final String token;
  final String tokenType;
  final int expiresIn;
  final String username;
  final String role;

  AuthResponse({
    required this.token,
    required this.tokenType,
    required this.expiresIn,
    required this.username,
    required this.role,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      token: json['token']?.toString() ?? '',
      tokenType: json['tokenType']?.toString() ?? 'Bearer',
      expiresIn: (json['expiresIn'] as num?)?.toInt() ?? 86400,
      username: json['username']?.toString() ?? '',
      role: json['role']?.toString() ?? 'BEEKEEPER',
    );
  }
}

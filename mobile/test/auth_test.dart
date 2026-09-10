import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/user.dart';

void main() {
  group('User & AuthResponse Parsing Tests', () {
    test('User.fromJson should parse ADMIN user correctly', () {
      final json = {
        'id': 'u-1',
        'username': 'admin_user',
        'email': 'admin@honeychain.io',
        'role': 'ADMIN',
        'enabled': true,
      };

      final user = User.fromJson(json);

      expect(user.id, equals('u-1'));
      expect(user.username, equals('admin_user'));
      expect(user.role, equals('ADMIN'));
      expect(user.isAdmin, isTrue);
      expect(user.isBeekeeper, isTrue);
      expect(user.isInspector, isTrue);
    });

    test('User.fromJson should parse BEEKEEPER user correctly', () {
      final json = {
        'id': 'u-2',
        'username': 'beekeeper1',
        'email': 'beekeeper@honeychain.io',
        'role': 'BEEKEEPER',
        'enabled': true,
      };

      final user = User.fromJson(json);

      expect(user.role, equals('BEEKEEPER'));
      expect(user.isAdmin, isFalse);
      expect(user.isBeekeeper, isTrue);
    });

    test('AuthResponse.fromJson should parse token payload', () {
      final json = {
        'token': 'jwt.mock.token',
        'tokenType': 'Bearer',
        'expiresIn': 86400,
        'username': 'beekeeper1',
        'role': 'BEEKEEPER',
      };

      final auth = AuthResponse.fromJson(json);

      expect(auth.token, equals('jwt.mock.token'));
      expect(auth.tokenType, equals('Bearer'));
      expect(auth.expiresIn, equals(86400));
      expect(auth.username, equals('beekeeper1'));
      expect(auth.role, equals('BEEKEEPER'));
    });
  });
}

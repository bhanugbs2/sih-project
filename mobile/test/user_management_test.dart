import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/user.dart';

void main() {
  group('User Management DTO & State Tests', () {
    test('User list JSON deserialization handles status and timestamps', () {
      final jsonList = [
        {
          'id': '1',
          'username': 'admin',
          'email': 'admin@honeychain.io',
          'role': 'ADMIN',
          'enabled': true,
          'createdAt': '2026-09-01T10:00:00Z',
        },
        {
          'id': '2',
          'username': 'inspector1',
          'email': 'inspector@honeychain.io',
          'role': 'QUALITY_INSPECTOR',
          'enabled': false,
          'createdAt': '2026-09-02T10:00:00Z',
        },
      ];

      final users = jsonList.map((j) => User.fromJson(j)).toList();

      expect(users.length, equals(2));
      expect(users[0].enabled, isTrue);
      expect(users[1].enabled, isFalse);
      expect(users[1].roleDisplayName, equals('Quality Inspector'));
    });
  });
}

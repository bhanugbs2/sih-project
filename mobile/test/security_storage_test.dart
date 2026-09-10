import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/user.dart';

void main() {
  group('Security & Role Authorization Tests', () {
    test('ADMIN role has complete access permissions', () {
      final user = User(
        id: 'u-admin',
        username: 'admin',
        email: 'admin@honeychain.io',
        role: 'ADMIN',
        enabled: true,
      );

      expect(user.isAdmin, isTrue);
      expect(user.isBeekeeper, isTrue);
      expect(user.isInspector, isTrue);
      expect(user.roleDisplayName, equals('Administrator'));
    });

    test('BEEKEEPER role cannot perform admin tasks', () {
      final user = User(
        id: 'u-beekeeper',
        username: 'beekeeper',
        email: 'beekeeper@honeychain.io',
        role: 'BEEKEEPER',
        enabled: true,
      );

      expect(user.isAdmin, isFalse);
      expect(user.isBeekeeper, isTrue);
      expect(user.isInspector, isFalse);
      expect(user.roleDisplayName, equals('Beekeeper'));
    });

    test('QUALITY_INSPECTOR role permission mapping', () {
      final user = User(
        id: 'u-inspector',
        username: 'inspector',
        email: 'inspector@honeychain.io',
        role: 'QUALITY_INSPECTOR',
        enabled: true,
      );

      expect(user.isAdmin, isFalse);
      expect(user.isBeekeeper, isFalse);
      expect(user.isInspector, isTrue);
      expect(user.roleDisplayName, equals('Quality Inspector'));
    });
  });
}

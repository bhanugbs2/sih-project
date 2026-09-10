import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/hive.dart';

void main() {
  group('Hive Model Tests', () {
    test('Hive.fromJson should parse valid active hive', () {
      final json = {
        'id': 'h-1',
        'hiveId': 'HIVE-001',
        'name': 'Alpha Hive',
        'location': 'North Apiary',
        'status': 'ACTIVE',
      };

      final hive = Hive.fromJson(json);

      expect(hive.id, equals('h-1'));
      expect(hive.hiveId, equals('HIVE-001'));
      expect(hive.name, equals('Alpha Hive'));
      expect(hive.location, equals('North Apiary'));
      expect(hive.status, equals('ACTIVE'));
    });
  });
}

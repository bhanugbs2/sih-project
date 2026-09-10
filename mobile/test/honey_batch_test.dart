import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/honey_batch.dart';

void main() {
  group('HoneyBatch Model Tests', () {
    test('HoneyBatch.fromJson should parse harvest batch correctly', () {
      final json = {
        'id': 'b-1',
        'batchId': 'BATCH-001',
        'hiveId': 'HIVE-001',
        'harvestDate': '2026-09-01',
        'quantity': 25.5,
        'unit': 'kg',
        'status': 'HARVESTED',
      };

      final batch = HoneyBatch.fromJson(json);

      expect(batch.batchId, equals('BATCH-001'));
      expect(batch.hiveId, equals('HIVE-001'));
      expect(batch.quantity, equals(25.5));
      expect(batch.unit, equals('kg'));
      expect(batch.status, equals('HARVESTED'));
    });
  });
}

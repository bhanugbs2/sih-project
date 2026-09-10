import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/sensor_reading.dart';

void main() {
  group('SensorReading Model Tests', () {
    test('SensorReading.fromJson should handle null optional physical sensors correctly', () {
      final json = {
        'id': 'sr-100',
        'hiveId': 'HIVE-001',
        'temperature': 34.2,
        'humidity': 56.5,
        'weight': null,
        'soundLevel': null,
        'latitude': null,
        'longitude': null,
        'timestamp': '2026-09-09T21:00:00Z',
      };

      final reading = SensorReading.fromJson(json);

      expect(reading.hiveId, equals('HIVE-001'));
      expect(reading.temperature, equals(34.2));
      expect(reading.humidity, equals(56.5));
      expect(reading.weight, isNull);
      expect(reading.soundLevel, isNull);
      expect(reading.latitude, isNull);

      expect(reading.hasTemperature, isTrue);
      expect(reading.hasHumidity, isTrue);
      expect(reading.hasWeight, isFalse);
      expect(reading.hasSound, isFalse);
      expect(reading.hasGPS, isFalse);
    });
  });
}

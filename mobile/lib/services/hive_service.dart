import '../core/network/api_client.dart';
import '../models/hive.dart';
import '../models/sensor_reading.dart';

class HiveService {
  static Future<List<Hive>> getAllHives({String? farmId}) async {
    final path = farmId != null && farmId.isNotEmpty ? '/api/hives?farmId=$farmId' : '/api/hives';
    final response = await ApiClient.get(path);
    if (response is List) {
      return response.map((item) => Hive.fromJson(item)).toList();
    }
    return [];
  }

  static Future<Hive> getHiveById(String hiveId) async {
    final response = await ApiClient.get('/api/hives/$hiveId');
    return Hive.fromJson(response);
  }

  static Future<SensorReading?> getLatestSensorReading(String hiveId) async {
    try {
      final response = await ApiClient.get('/api/hives/$hiveId/latest');
      if (response != null) {
        return SensorReading.fromJson(response);
      }
    } catch (_) {}
    return null;
  }

  static Future<List<SensorReading>> getHiveSensorHistory(String hiveId, {int? limit}) async {
    final path = limit != null ? '/api/hives/$hiveId/history?limit=$limit' : '/api/hives/$hiveId/history';
    final response = await ApiClient.get(path);
    if (response is List) {
      return response.map((item) => SensorReading.fromJson(item)).toList();
    }
    return [];
  }
}

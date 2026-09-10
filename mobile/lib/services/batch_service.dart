import '../core/network/api_client.dart';
import '../models/honey_batch.dart';

class BatchService {
  static Future<List<HoneyBatch>> getAllBatches() async {
    final response = await ApiClient.get('/api/batches');
    if (response is List) {
      return response.map((item) => HoneyBatch.fromJson(item)).toList();
    }
    return [];
  }

  static Future<HoneyBatch> getBatchById(String batchId) async {
    final response = await ApiClient.get('/api/batches/$batchId');
    return HoneyBatch.fromJson(response);
  }

  static Future<HoneyBatch> createBatch(Map<String, dynamic> reqData) async {
    final response = await ApiClient.post('/api/batches', body: reqData);
    return HoneyBatch.fromJson(response);
  }

  static Future<HoneyBatch> recallBatch(String batchId) async {
    final response = await ApiClient.post('/api/batches/$batchId/recall');
    return HoneyBatch.fromJson(response);
  }
}

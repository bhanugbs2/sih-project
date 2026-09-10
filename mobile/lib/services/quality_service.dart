import '../core/network/api_client.dart';
import '../models/quality_test.dart';

class QualityService {
  static Future<QualityTest> addQualityTest(String batchId, Map<String, dynamic> reqData) async {
    final response = await ApiClient.post('/api/batches/$batchId/quality-test', body: reqData);
    return QualityTest.fromJson(response);
  }

  static Future<List<QualityTest>> getQualityTestsByBatchId(String batchId) async {
    final response = await ApiClient.get('/api/batches/$batchId/quality-test');
    if (response is List) {
      return response.map((item) => QualityTest.fromJson(item)).toList();
    }
    return [];
  }
}

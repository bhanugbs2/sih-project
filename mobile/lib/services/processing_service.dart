import '../core/network/api_client.dart';
import '../models/honey_batch.dart';
import '../models/processing_record.dart';

class ProcessingService {
  static Future<ProcessingRecord> addProcessingRecord(String batchId, Map<String, dynamic> reqData) async {
    final response = await ApiClient.post('/api/batches/$batchId/processing', body: reqData);
    return ProcessingRecord.fromJson(response);
  }

  static Future<List<ProcessingRecord>> getProcessingRecordsByBatchId(String batchId) async {
    final response = await ApiClient.get('/api/batches/$batchId/processing');
    if (response is List) {
      return response.map((item) => ProcessingRecord.fromJson(item)).toList();
    }
    return [];
  }

  static Future<HoneyBatch> markBatchReadyForPackaging(String batchId) async {
    final response = await ApiClient.post('/api/batches/$batchId/processing/ready-for-packaging');
    return HoneyBatch.fromJson(response);
  }
}

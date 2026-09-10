import '../core/network/api_client.dart';
import '../models/blockchain_config.dart';
import '../models/traceability_event.dart';

class BlockchainService {
  static Future<BlockchainConfigStatus> getBlockchainStatus() async {
    final response = await ApiClient.get('/api/blockchain/status');
    return BlockchainConfigStatus.fromJson(response);
  }

  static Future<List<TraceabilityEvent>> getBatchBlockchainTraceability(String batchId) async {
    final response = await ApiClient.get('/api/blockchain/batch/$batchId');
    if (response is List) {
      return response.map((item) => TraceabilityEvent.fromJson(item)).toList();
    }
    return [];
  }

  static Future<TraceabilityEvent> anchorEvent(String eventId) async {
    final response = await ApiClient.post('/api/blockchain/anchor/$eventId');
    return TraceabilityEvent.fromJson(response);
  }

  static Future<TraceabilityEvent> getEventStatus(String eventId) async {
    final response = await ApiClient.get('/api/blockchain/event/$eventId');
    return TraceabilityEvent.fromJson(response);
  }
}

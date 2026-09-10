import '../core/network/api_client.dart';
import '../models/ai_alert.dart';
import '../models/ai_status.dart';
import '../models/quality_evaluation.dart';
import '../models/telemetry_analysis.dart';

class AIService {
  static Future<AIStatusResponse> getAIStatus(String hiveId) async {
    final response = await ApiClient.get('/api/hives/$hiveId/ai-status');
    return AIStatusResponse.fromJson(response);
  }

  static Future<List<AIAlert>> getAllAIAlerts() async {
    final response = await ApiClient.get('/api/ai/alerts');
    if (response is List) {
      return response.map((item) => AIAlert.fromJson(item)).toList();
    }
    return [];
  }

  static Future<int> getUnreadAlertCount() async {
    final response = await ApiClient.get('/api/ai/alerts/unread/count');
    if (response is Map && response.containsKey('count')) {
      return (response['count'] as num).toInt();
    }
    return 0;
  }

  static Future<AIAlert?> markAlertRead(String alertId) async {
    final response = await ApiClient.patch('/api/ai/alerts/$alertId/read');
    if (response is Map) {
      return AIAlert.fromJson(response as Map<String, dynamic>);
    }
    return null;
  }

  static Future<AIAlert?> acknowledgeAlert(String alertId) async {
    final response = await ApiClient.patch('/api/ai/alerts/$alertId/acknowledge');
    if (response is Map) {
      return AIAlert.fromJson(response as Map<String, dynamic>);
    }
    return null;
  }

  static Future<List<AIAlert>> getHiveAlerts(String hiveId, {int? limit}) async {
    final path = limit != null ? '/api/hives/$hiveId/alerts?limit=$limit' : '/api/hives/$hiveId/alerts';
    final response = await ApiClient.get(path);
    if (response is List) {
      return response.map((item) => AIAlert.fromJson(item)).toList();
    }
    return [];
  }

  static Future<QualityEvaluationResponse> evaluateQuality(QualityEvaluationRequest req) async {
    final response = await ApiClient.post('/api/ai/evaluate-quality', body: req.toJson());
    return QualityEvaluationResponse.fromJson(response);
  }

  static Future<TelemetryAnalysisResponse> analyzeTelemetry(TelemetryAnalysisRequest req) async {
    final response = await ApiClient.post('/api/ai/analyze-telemetry', body: req.toJson());
    return TelemetryAnalysisResponse.fromJson(response);
  }
}

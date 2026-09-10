import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/models/ai_status.dart';
import 'package:mobile/models/quality_evaluation.dart';

void main() {
  group('AI Response Models Tests', () {
    test('AIStatusResponse.fromJson should parse status report', () {
      final json = {
        'hiveId': 'HIVE-001',
        'latestRiskScore': 12.5,
        'status': 'NORMAL',
        'message': 'Telemetry within normal operational bounds',
        'lastAnalysisTimestamp': '2026-09-09T20:00:00Z',
        'modelVersion': 'v1.2.0-standalone',
        'screeningMethod': 'Rule-based anomaly detection',
      };

      final aiStatus = AIStatusResponse.fromJson(json);

      expect(aiStatus.hiveId, equals('HIVE-001'));
      expect(aiStatus.latestRiskScore, equals(12.5));
      expect(aiStatus.status, equals('NORMAL'));
      expect(aiStatus.modelVersion, equals('v1.2.0-standalone'));
    });

    test('QualityEvaluationResponse.fromJson should parse quality report', () {
      final json = {
        'batchId': 'BATCH-001',
        'purityScore': 98.2,
        'adulterationClass': 'PURE',
        'recommendation': 'Standard Quality Passed',
        'riskFactors': ['Slight moisture elevation'],
        'modelVersion': 'v1.2.0-standalone',
        'screeningMethod': 'Physicochemical evaluation',
      };

      final quality = QualityEvaluationResponse.fromJson(json);

      expect(quality.purityScore, equals(98.2));
      expect(quality.adulterationClass, equals('PURE'));
      expect(quality.riskFactors, contains('Slight moisture elevation'));
    });
  });
}

import '../core/network/api_client.dart';
import '../models/verification_result.dart';

class VerificationService {
  static Future<VerificationResult> verifyPackage(String packageId) async {
    final cleanId = packageId.trim();
    final response = await ApiClient.get(
      '/api/verify/$cleanId',
      includeAuth: false,
    );
    return VerificationResult.fromJson(response);
  }
}

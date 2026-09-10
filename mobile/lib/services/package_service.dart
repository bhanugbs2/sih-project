import '../core/network/api_client.dart';
import '../models/package_model.dart';

class PackageService {
  static Future<PackageModel> createPackage(Map<String, dynamic> reqData) async {
    final response = await ApiClient.post('/api/packages', body: reqData);
    return PackageModel.fromJson(response);
  }

  static Future<PackageModel> getPackageById(String packageId) async {
    final response = await ApiClient.get('/api/packages/$packageId');
    return PackageModel.fromJson(response);
  }
}

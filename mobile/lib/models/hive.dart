import 'farm.dart';

class Hive {
  final String id;
  final String hiveId;
  final Farm? farm;
  final String name;
  final String? location;
  final double? latitude;
  final double? longitude;
  final String status; // ACTIVE, INACTIVE, MAINTENANCE
  final String? createdAt;
  final String? updatedAt;

  Hive({
    required this.id,
    required this.hiveId,
    this.farm,
    required this.name,
    this.location,
    this.latitude,
    this.longitude,
    required this.status,
    this.createdAt,
    this.updatedAt,
  });

  factory Hive.fromJson(Map<String, dynamic> json) {
    return Hive(
      id: json['id']?.toString() ?? '',
      hiveId: json['hiveId']?.toString() ?? '',
      farm: json['farm'] != null ? Farm.fromJson(json['farm']) : null,
      name: json['name']?.toString() ?? json['hiveId']?.toString() ?? 'Hive',
      location: json['location']?.toString(),
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      status: json['status']?.toString() ?? 'ACTIVE',
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'hiveId': hiveId,
      'farm': farm?.toJson(),
      'name': name,
      'location': location,
      'latitude': latitude,
      'longitude': longitude,
      'status': status,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

class Farm {
  final String id;
  final String farmId;
  final String name;
  final String ownerName;
  final String? location;
  final double? latitude;
  final double? longitude;
  final String? createdAt;
  final String? updatedAt;

  Farm({
    required this.id,
    required this.farmId,
    required this.name,
    required this.ownerName,
    this.location,
    this.latitude,
    this.longitude,
    this.createdAt,
    this.updatedAt,
  });

  factory Farm.fromJson(Map<String, dynamic> json) {
    return Farm(
      id: json['id']?.toString() ?? '',
      farmId: json['farmId']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      ownerName: json['ownerName']?.toString() ?? '',
      location: json['location']?.toString(),
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'farmId': farmId,
      'name': name,
      'ownerName': ownerName,
      'location': location,
      'latitude': latitude,
      'longitude': longitude,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

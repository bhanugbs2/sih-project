class SensorReading {
  final String id;
  final String hiveId;
  final double? temperature;
  final double? humidity;
  final double? weight;
  final double? soundLevel;
  final double? latitude;
  final double? longitude;
  final String timestamp;
  final String? createdAt;

  SensorReading({
    required this.id,
    required this.hiveId,
    this.temperature,
    this.humidity,
    this.weight,
    this.soundLevel,
    this.latitude,
    this.longitude,
    required this.timestamp,
    this.createdAt,
  });

  factory SensorReading.fromJson(Map<String, dynamic> json) {
    return SensorReading(
      id: json['id']?.toString() ?? '',
      hiveId: json['hiveId']?.toString() ?? '',
      temperature: (json['temperature'] as num?)?.toDouble(),
      humidity: (json['humidity'] as num?)?.toDouble(),
      weight: (json['weight'] as num?)?.toDouble(),
      soundLevel: (json['soundLevel'] as num?)?.toDouble(),
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      timestamp: json['timestamp']?.toString() ?? DateTime.now().toIso8601String(),
      createdAt: json['createdAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'hiveId': hiveId,
      'temperature': temperature,
      'humidity': humidity,
      'weight': weight,
      'soundLevel': soundLevel,
      'latitude': latitude,
      'longitude': longitude,
      'timestamp': timestamp,
      'createdAt': createdAt,
    };
  }

  bool get hasTemperature => temperature != null;
  bool get hasHumidity => humidity != null;
  bool get hasWeight => weight != null;
  bool get hasSound => soundLevel != null;
  bool get hasGPS => latitude != null && longitude != null;
}

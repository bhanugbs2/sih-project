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

  // Multi-sensor fields
  final double? internalTemperatureC;
  final double? internalHumidityRh;
  final double? weightKg;
  final double? co2Ppm;
  final double? acousticLevel;
  final double? acousticRms;
  final String? acousticActivity;
  final double? vibrationX;
  final double? vibrationY;
  final double? vibrationZ;
  final double? vibrationMagnitude;
  final String? sensorSuiteVersion;
  final String? qualityFlags;

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
    this.internalTemperatureC,
    this.internalHumidityRh,
    this.weightKg,
    this.co2Ppm,
    this.acousticLevel,
    this.acousticRms,
    this.acousticActivity,
    this.vibrationX,
    this.vibrationY,
    this.vibrationZ,
    this.vibrationMagnitude,
    this.sensorSuiteVersion,
    this.qualityFlags,
  });

  factory SensorReading.fromJson(Map<String, dynamic> json) {
    final rawTemp = (json['internalTemperatureC'] as num?)?.toDouble() ?? (json['temperature'] as num?)?.toDouble();
    final rawHum = (json['internalHumidityRh'] as num?)?.toDouble() ?? (json['humidity'] as num?)?.toDouble();
    final rawWeight = (json['weightKg'] as num?)?.toDouble() ?? (json['weight'] as num?)?.toDouble();
    final rawAcoustic = (json['acousticLevel'] as num?)?.toDouble() ?? (json['soundLevel'] as num?)?.toDouble();

    return SensorReading(
      id: json['id']?.toString() ?? '',
      hiveId: json['hiveId']?.toString() ?? '',
      temperature: rawTemp,
      humidity: rawHum,
      weight: rawWeight,
      soundLevel: rawAcoustic,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      timestamp: json['timestamp']?.toString() ?? DateTime.now().toIso8601String(),
      createdAt: json['createdAt']?.toString(),
      internalTemperatureC: (json['internalTemperatureC'] as num?)?.toDouble() ?? rawTemp,
      internalHumidityRh: (json['internalHumidityRh'] as num?)?.toDouble() ?? rawHum,
      weightKg: (json['weightKg'] as num?)?.toDouble() ?? rawWeight,
      co2Ppm: (json['co2Ppm'] as num?)?.toDouble(),
      acousticLevel: rawAcoustic,
      acousticRms: (json['acousticRms'] as num?)?.toDouble(),
      acousticActivity: json['acousticActivity']?.toString(),
      vibrationX: (json['vibrationX'] as num?)?.toDouble(),
      vibrationY: (json['vibrationY'] as num?)?.toDouble(),
      vibrationZ: (json['vibrationZ'] as num?)?.toDouble(),
      vibrationMagnitude: (json['vibrationMagnitude'] as num?)?.toDouble(),
      sensorSuiteVersion: json['sensorSuiteVersion']?.toString(),
      qualityFlags: json['qualityFlags']?.toString(),
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
      'internalTemperatureC': internalTemperatureC,
      'internalHumidityRh': internalHumidityRh,
      'weightKg': weightKg,
      'co2Ppm': co2Ppm,
      'acousticLevel': acousticLevel,
      'acousticRms': acousticRms,
      'acousticActivity': acousticActivity,
      'vibrationX': vibrationX,
      'vibrationY': vibrationY,
      'vibrationZ': vibrationZ,
      'vibrationMagnitude': vibrationMagnitude,
      'sensorSuiteVersion': sensorSuiteVersion,
      'qualityFlags': qualityFlags,
    };
  }

  double get displayTemp => internalTemperatureC ?? temperature ?? 0.0;
  double get displayHumidity => internalHumidityRh ?? humidity ?? 0.0;
  double get displayWeight => weightKg ?? weight ?? 0.0;
  double get displayCo2 => co2Ppm ?? 620.0;
  double get displayAcoustics => acousticLevel ?? soundLevel ?? 45.0;
  double get displayVibrationMag => vibrationMagnitude ?? 0.9805;

  bool get hasTemperature => temperature != null || internalTemperatureC != null;
  bool get hasHumidity => humidity != null || internalHumidityRh != null;
  bool get hasWeight => weight != null || weightKg != null;
  bool get hasSound => soundLevel != null || acousticLevel != null;
  bool get hasGPS => latitude != null && longitude != null;
}

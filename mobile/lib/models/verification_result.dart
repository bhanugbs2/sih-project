import 'farm.dart';
import 'hive.dart';
import 'honey_batch.dart';
import 'package_model.dart';
import 'quality_test.dart';
import 'processing_record.dart';
import 'traceability_event.dart';

class VerificationResult {
  final PackageModel? package;
  final HoneyBatch? batch;
  final Hive? hive;
  final Farm? farm;
  final List<QualityTest> qualityTests;
  final List<ProcessingRecord> processingRecords;
  final List<TraceabilityEvent> traceabilityEvents;
  final String? blockchainVerificationStatus;

  VerificationResult({
    this.package,
    this.batch,
    this.hive,
    this.farm,
    required this.qualityTests,
    required this.processingRecords,
    required this.traceabilityEvents,
    this.blockchainVerificationStatus,
  });

  factory VerificationResult.fromJson(Map<String, dynamic> json) {
    List<QualityTest> tests = [];
    if (json['qualityTests'] != null && json['qualityTests'] is List) {
      tests = (json['qualityTests'] as List).map((item) => QualityTest.fromJson(item)).toList();
    }

    List<ProcessingRecord> processes = [];
    if (json['processingRecords'] != null && json['processingRecords'] is List) {
      processes = (json['processingRecords'] as List).map((item) => ProcessingRecord.fromJson(item)).toList();
    }

    List<TraceabilityEvent> events = [];
    if (json['traceabilityEvents'] != null && json['traceabilityEvents'] is List) {
      events = (json['traceabilityEvents'] as List).map((item) => TraceabilityEvent.fromJson(item)).toList();
    }

    return VerificationResult(
      package: json['package'] != null ? PackageModel.fromJson(json['package']) : null,
      batch: json['batch'] != null ? HoneyBatch.fromJson(json['batch']) : null,
      hive: json['hive'] != null ? Hive.fromJson(json['hive']) : null,
      farm: json['farm'] != null ? Farm.fromJson(json['farm']) : null,
      qualityTests: tests,
      processingRecords: processes,
      traceabilityEvents: events,
      blockchainVerificationStatus: json['blockchainVerificationStatus']?.toString() ?? 'OFF_CHAIN_VERIFIED',
    );
  }
}

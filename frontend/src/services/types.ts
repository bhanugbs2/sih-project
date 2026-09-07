// HoneyChain Frontend TypeScript Types

export interface SystemStatus {
  project: string;
  sihProblemStatement: string;
  team: string;
  version: string;
  status: string;
  serverTime: string;
  uptimeSeconds: number;
  modules: Record<string, string>;
}

export interface HiveTelemetry {
  id: string;
  hiveCode: string;
  apiaryLocation: string;
  temperature: number;
  humidity: number;
  weightKg: number;
  acousticHz: number;
  batteryLevel: number;
  status: 'OPTIMAL' | 'WARNING' | 'ALERT' | 'OFFLINE';
  lastPing: string;
}

export interface HoneyBatch {
  id: string;
  batchCode: string;
  hiveId: string;
  floralSource: string;
  harvestDate: string;
  harvestWeightKg: number;
  status: 'HARVESTED' | 'TESTING' | 'PROCESSING' | 'PACKAGED' | 'VERIFIED';
  blockchainTxHash?: string;
}

export interface QualityReport {
  id: string;
  batchCode: string;
  moistureContent: number; // Max 18% for pure honey
  phLevel: number; // 3.4 to 6.1
  hmfValue: number; // Max 40 mg/kg
  diastaseNumber: number; // Min 8 Schade units
  purityScore: number; // 0 - 100%
  adulterationStatus: 'PURE' | 'SUSPECTED' | 'ADULTERATED';
  testedAt: string;
}

export interface PackageUnit {
  qrCodeId: string;
  batchCode: string;
  packageSizeGrams: number;
  packagingDate: string;
  distributorId: string;
  status: 'PACKAGED' | 'IN_TRANSIT' | 'RETAIL' | 'SOLD';
}

export interface BlockchainRecord {
  txHash: string;
  blockNumber: number;
  batchCode: string;
  contractAddress: string;
  merkleRoot: string;
  status: 'CONFIRMED' | 'PENDING';
  anchoredAt: string;
}

export interface VerificationResult {
  verified: boolean;
  qrCodeId: string;
  batchCode: string;
  apiaryLocation: string;
  floralSource: string;
  harvestDate: string;
  purityScore: number;
  adulterationStatus: string;
  blockchainTxHash: string;
  blockchainExplorerUrl: string;
  timestamp: string;
}

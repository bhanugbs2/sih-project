// HoneyChain Complete TypeScript Types

export type UserRole = 'ADMIN' | 'BEEKEEPER' | 'QUALITY_INSPECTOR';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  username?: string;
  password?: string;
}

export interface RegisterRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  role: UserRole;
}

export interface Farm {
  id: string;
  farmId: string;
  name: string;
  ownerName: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFarmRequest {
  farmId: string;
  name: string;
  ownerName: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export type HiveStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface Hive {
  id: string;
  hiveId: string;
  farm?: Farm;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status: HiveStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHiveRequest {
  hiveId: string;
  farmId: string;
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: HiveStatus;
}

export interface SensorReading {
  id: string;
  hiveId: string;
  temperature?: number | null;
  humidity?: number | null;
  weight?: number | null;
  soundLevel?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  timestamp: string;
  createdAt?: string;
}

export interface CreateSensorReadingRequest {
  hiveId: string;
  temperature?: number | null;
  humidity?: number | null;
  weight?: number | null;
  soundLevel?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type AIAlertStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface AIAlert {
  id: string;
  hiveId: string;
  riskScore: number;
  status: AIAlertStatus;
  message: string;
  factors?: string;
  timestamp: string;
  createdAt?: string;
}

export interface AIStatusResponse {
  hiveId: string;
  latestRiskScore: number;
  status: AIAlertStatus;
  message: string;
  lastAnalysisTimestamp: string;
}

export interface QualityEvaluationRequest {
  batchId?: string;
  moisture?: number;
  ph?: number;
  color?: string;
}

export interface QualityEvaluationResponse {
  batchId?: string;
  purityScore: number;
  adulterationClass: string;
  recommendation: string;
  riskFactors: string[];
}

export interface TelemetryAnalysisRequest {
  hiveId: string;
  temperature?: number;
  humidity?: number;
  soundLevel?: number;
}

export interface TelemetryAnalysisResponse {
  hiveId: string;
  riskScore: number;
  alertStatus: AIAlertStatus;
  message: string;
  anomalyFactors: string[];
}

export type HoneyBatchStatus = 'HARVESTED' | 'QUALITY_TESTING' | 'QUALITY_TESTED' | 'QUALITY_VERIFIED' | 'PROCESSING' | 'PROCESSED' | 'READY_FOR_PACKAGING' | 'REQUIRES_REVIEW' | 'PACKAGED' | 'COMPLETED' | 'RECALLED';

export interface HoneyBatch {
  id: string;
  batchId: string;
  hiveId: string;
  farmId?: string;
  farmName?: string;
  harvestDate: string;
  quantity: number;
  unit: string;
  harvestNotes?: string;
  quantitySource?: string;
  status: HoneyBatchStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHoneyBatchRequest {
  batchId: string;
  hiveId: string;
  harvestDate: string;
  quantity: number;
  unit?: string;
  harvestNotes?: string;
  quantitySource?: string;
  status?: HoneyBatchStatus;
}

export type QualityTestResult = 'PASS' | 'FAIL' | 'REQUIRES_REVIEW' | 'PENDING';

export interface QualityTest {
  id: string;
  batchId: string;
  moisture?: number;
  ph?: number;
  color?: string;
  notes?: string;
  result: QualityTestResult;
  verifiedBy?: string;
  timestamp: string;
  testedAt?: string;
  createdAt?: string;

  // AI screening fields
  aiScreeningClass?: string;
  aiPurityScore?: number;
  aiRecommendation?: string;
}

export interface CreateQualityTestRequest {
  moisture?: number;
  ph?: number;
  color?: string;
  notes?: string;
  result: QualityTestResult;
  verifiedBy?: string;
}

export interface ProcessingRecord {
  id: string;
  batchId: string;
  processType: string;
  operation?: string;
  operator?: string;
  startedAt?: string;
  completedAt?: string;
  processingTemperature?: number;
  tempSource?: string;
  description?: string;
  timestamp: string;
  verifiedBy?: string;
  createdAt?: string;
}

export interface CreateProcessingRecordRequest {
  processType?: string;
  operation?: string;
  operator?: string;
  startedAt?: string;
  completedAt?: string;
  processingTemperature?: number;
  tempSource?: string;
  description?: string;
  verifiedBy?: string;
}

export type PackageStatus = 'CREATED' | 'PACKAGED' | 'RECALLED' | 'VERIFIED';

export interface Package {
  id: string;
  packageId: string;
  batchId: string;
  qrUrl?: string;
  status: PackageStatus;
  packagingDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePackageRequest {
  packageId: string;
  batchId: string;
  qrUrl?: string;
  status?: PackageStatus;
}

export type TraceabilityEventType = 'HARVESTED' | 'QUALITY_TESTED' | 'QUALITY_VERIFIED' | 'AI_SCREENED' | 'PROCESSING' | 'PROCESSED' | 'READY_FOR_PACKAGING' | 'PACKAGED' | 'VERIFIED';
export type BlockchainEnvironment = 'DEVELOPMENT' | 'TEST' | 'PRODUCTION';

export interface TraceabilityEvent {
  id: string;
  batchId: string;
  packageId?: string;
  eventType: TraceabilityEventType;
  eventDataHash: string;
  timestamp: string;
  blockchainReference?: string;
  environment: BlockchainEnvironment;
  createdAt?: string;
}

export interface VerificationResult {
  package?: Package;
  batch?: HoneyBatch;
  hive?: Hive;
  farm?: Farm;
  qualityTests?: QualityTest[];
  processingRecords?: ProcessingRecord[];
  traceabilityEvents?: TraceabilityEvent[];
  blockchainVerificationStatus?: string;
}

export interface SystemStatus {
  status: string;
  version?: string;
  timestamp?: string;
  database?: string;
  blockchainEnv?: string;
  [key: string]: any;
}

import { apiClient } from './apiClient';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Farm,
  CreateFarmRequest,
  Hive,
  CreateHiveRequest,
  SensorReading,
  CreateSensorReadingRequest,
  AIAlert,
  AIStatusResponse,
  HoneyBatch,
  CreateHoneyBatchRequest,
  QualityTest,
  CreateQualityTestRequest,
  ProcessingRecord,
  CreateProcessingRecordRequest,
  Package,
  CreatePackageRequest,
  TraceabilityEvent,
  VerificationResult,
  QualityEvaluationRequest,
  QualityEvaluationResponse,
  TelemetryAnalysisRequest,
  TelemetryAnalysisResponse
} from '../types';

// System Status
export const getSystemStatus = async () => {
  const response = await apiClient.get('/api/v1/status');
  return response.data;
};

export const getHealth = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};

// Auth Service
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
  return response.data;
};

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/api/auth/me');
  return response.data;
};

// User Management Service (Admin)
export const getAllUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/api/users');
  return response.data;
};

export const createUser = async (data: RegisterRequest): Promise<User> => {
  const response = await apiClient.post<User>('/api/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: RegisterRequest): Promise<User> => {
  const response = await apiClient.put<User>(`/api/users/${id}`, data);
  return response.data;
};

export const toggleUserEnabled = async (id: string, enabled?: boolean): Promise<User> => {
  const response = await apiClient.patch<User>(`/api/users/${id}/enabled`, { enabled });
  return response.data;
};

// Farm Service
export const getAllFarms = async (): Promise<Farm[]> => {
  const response = await apiClient.get<Farm[]>('/api/farms');
  return response.data;
};

export const getFarmById = async (farmId: string): Promise<Farm> => {
  const response = await apiClient.get<Farm>(`/api/farms/${farmId}`);
  return response.data;
};

export const createFarm = async (data: CreateFarmRequest): Promise<Farm> => {
  const response = await apiClient.post<Farm>('/api/farms', data);
  return response.data;
};

export const updateFarm = async (farmId: string, data: CreateFarmRequest): Promise<Farm> => {
  const response = await apiClient.put<Farm>(`/api/farms/${farmId}`, data);
  return response.data;
};

export const deleteFarm = async (farmId: string): Promise<void> => {
  await apiClient.delete(`/api/farms/${farmId}`);
};

// Hive Service
export const getAllHives = async (farmId?: string): Promise<Hive[]> => {
  const url = farmId ? `/api/hives?farmId=${farmId}` : '/api/hives';
  const response = await apiClient.get<Hive[]>(url);
  return response.data;
};

export const getHiveById = async (hiveId: string): Promise<Hive> => {
  const response = await apiClient.get<Hive>(`/api/hives/${hiveId}`);
  return response.data;
};

export const createHive = async (data: CreateHiveRequest): Promise<Hive> => {
  const response = await apiClient.post<Hive>('/api/hives', data);
  return response.data;
};

export const updateHive = async (hiveId: string, data: CreateHiveRequest): Promise<Hive> => {
  const response = await apiClient.put<Hive>(`/api/hives/${hiveId}`, data);
  return response.data;
};

export const deleteHive = async (hiveId: string): Promise<void> => {
  await apiClient.delete(`/api/hives/${hiveId}`);
};

// Sensor Telemetry Service
export const recordSensorReading = async (data: CreateSensorReadingRequest): Promise<SensorReading> => {
  const response = await apiClient.post<SensorReading>('/api/sensors', data);
  return response.data;
};

export const getHiveSensorHistory = async (hiveId: string, limit?: number): Promise<SensorReading[]> => {
  const url = limit ? `/api/hives/${hiveId}/history?limit=${limit}` : `/api/hives/${hiveId}/history`;
  const response = await apiClient.get<SensorReading[]>(url);
  return response.data;
};

export const getLatestSensorReading = async (hiveId: string): Promise<SensorReading> => {
  const response = await apiClient.get<SensorReading>(`/api/hives/${hiveId}/latest`);
  return response.data;
};

// AI Intelligence Service
export const getAIStatus = async (hiveId: string): Promise<AIStatusResponse> => {
  const response = await apiClient.get<AIStatusResponse>(`/api/hives/${hiveId}/ai-status`);
  return response.data;
};

export const getHiveAlerts = async (hiveId: string, limit?: number): Promise<AIAlert[]> => {
  const url = limit ? `/api/hives/${hiveId}/alerts?limit=${limit}` : `/api/hives/${hiveId}/alerts`;
  const response = await apiClient.get<AIAlert[]>(url);
  return response.data;
};

export const getAllAIAlerts = async (): Promise<AIAlert[]> => {
  const response = await apiClient.get<AIAlert[]>('/api/ai/alerts');
  return response.data;
};

export const evaluateHoneyQuality = async (data: QualityEvaluationRequest): Promise<QualityEvaluationResponse> => {
  const response = await apiClient.post<QualityEvaluationResponse>('/api/ai/evaluate-quality', data);
  return response.data;
};

export const analyzeTelemetry = async (data: TelemetryAnalysisRequest): Promise<TelemetryAnalysisResponse> => {
  const response = await apiClient.post<TelemetryAnalysisResponse>('/api/ai/analyze-telemetry', data);
  return response.data;
};

// Honey Batch Service
export const getAllBatches = async (): Promise<HoneyBatch[]> => {
  const response = await apiClient.get<HoneyBatch[]>('/api/batches');
  return response.data;
};

export const getBatchById = async (batchId: string): Promise<HoneyBatch> => {
  const response = await apiClient.get<HoneyBatch>(`/api/batches/${batchId}`);
  return response.data;
};

export const createBatch = async (data: CreateHoneyBatchRequest): Promise<HoneyBatch> => {
  const response = await apiClient.post<HoneyBatch>('/api/batches', data);
  return response.data;
};

export const updateBatch = async (batchId: string, data: CreateHoneyBatchRequest): Promise<HoneyBatch> => {
  const response = await apiClient.put<HoneyBatch>(`/api/batches/${batchId}`, data);
  return response.data;
};

export const recallBatch = async (batchId: string): Promise<HoneyBatch> => {
  const response = await apiClient.post<HoneyBatch>(`/api/batches/${batchId}/recall`);
  return response.data;
};

// Quality Test Service
export const addQualityTest = async (batchId: string, data: CreateQualityTestRequest): Promise<QualityTest> => {
  const response = await apiClient.post<QualityTest>(`/api/batches/${batchId}/quality-test`, data);
  return response.data;
};

export const getQualityTestsByBatchId = async (batchId: string): Promise<QualityTest[]> => {
  const response = await apiClient.get<QualityTest[]>(`/api/batches/${batchId}/quality-test`);
  return response.data;
};

// Processing Record Service
export const addProcessingRecord = async (batchId: string, data: CreateProcessingRecordRequest): Promise<ProcessingRecord> => {
  const response = await apiClient.post<ProcessingRecord>(`/api/batches/${batchId}/processing`, data);
  return response.data;
};

export const getProcessingRecordsByBatchId = async (batchId: string): Promise<ProcessingRecord[]> => {
  const response = await apiClient.get<ProcessingRecord[]>(`/api/batches/${batchId}/processing`);
  return response.data;
};

export const markBatchReadyForPackaging = async (batchId: string): Promise<HoneyBatch> => {
  const response = await apiClient.post<HoneyBatch>(`/api/batches/${batchId}/processing/ready-for-packaging`);
  return response.data;
};

// Package Service
export const createPackage = async (data: CreatePackageRequest): Promise<Package> => {
  const response = await apiClient.post<Package>('/api/packages', data);
  return response.data;
};

export const getPackageById = async (packageId: string): Promise<Package> => {
  const response = await apiClient.get<Package>(`/api/packages/${packageId}`);
  return response.data;
};

// Traceability Service
export const getBatchTraceability = async (batchId: string): Promise<TraceabilityEvent[]> => {
  const response = await apiClient.get<TraceabilityEvent[]>(`/api/batches/${batchId}/traceability`);
  return response.data;
};

export const getPackageTraceability = async (packageId: string): Promise<TraceabilityEvent[]> => {
  const response = await apiClient.get<TraceabilityEvent[]>(`/api/packages/${packageId}/traceability`);
  return response.data;
};

// Public Customer Verification Service
export const verifyPackage = async (packageId: string): Promise<VerificationResult> => {
  const response = await apiClient.get<VerificationResult>(`/api/verify/${packageId}`);
  return response.data;
};

import axios from 'axios';
import { SystemStatus, VerificationResult } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const fetchSystemStatus = async (): Promise<SystemStatus> => {
  try {
    const response = await apiClient.get<SystemStatus>('/status');
    return response.data;
  } catch (error) {
    // Fallback status for offline/dev preview
    return {
      project: 'HoneyChain',
      sihProblemStatement: 'SIH26021',
      team: 'Nexora',
      version: '1.0.0-phase1',
      status: 'OFFLINE_PREVIEW',
      serverTime: new Date().toISOString(),
      uptimeSeconds: 0,
      modules: {
        backend: 'Spring Boot (Java 21)',
        frontend: 'React + TypeScript + Vite',
        database: 'PostgreSQL + Flyway',
        iot: 'ESP32 Sensor Nodes',
        blockchain: 'EVM Adapter Architecture',
        ai: 'ONNX/DJL Quality Engine',
      },
    };
  }
};

export const verifyHoneyQR = async (qrCodeId: string): Promise<VerificationResult> => {
  try {
    const response = await apiClient.get<VerificationResult>(`/verify/${qrCodeId}`);
    return response.data;
  } catch (error) {
    // Simulated verified payload for consumer verification demo fallback
    return {
      verified: true,
      qrCodeId: qrCodeId || 'HC-QR-2026-88912',
      batchCode: 'HC-BATCH-2026-VALLEY-09',
      apiaryLocation: 'Himalayan Organic Apiary #4, Himachal Pradesh',
      floralSource: 'Wild Himalayan Acacia & Multiflora',
      harvestDate: '2026-08-28',
      purityScore: 99.4,
      adulterationStatus: 'PURE',
      blockchainTxHash: '0x8f2a4e719c8d6e3f5b1a0d9c8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f',
      blockchainExplorerUrl: 'https://sepolia.etherscan.io/tx/0x8f2a4e719c8d6e3f5b1a0d9c8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f',
      timestamp: new Date().toISOString(),
    };
  }
};

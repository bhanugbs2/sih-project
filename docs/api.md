# HoneyChain API Documentation - Phase 2

## Overview
The HoneyChain Spring Boot REST API exposes endpoints for managing farms, hives, telemetry sensor readings, AI alert status, honey harvest batches, quality tests, processing records, retail packaging, supply chain traceability events, and consumer QR code verification.

### Base URLs & Links
- **Development Server URL**: `http://localhost:8080`
- **Swagger UI Documentation**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON Spec**: `http://localhost:8080/v3/api-docs`

---

## Standard Error Response Format
All error responses adhere to a consistent JSON structure:

```json
{
  "timestamp": "2026-09-07T21:15:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Hive not found: HIVE-001",
  "path": "/api/hives/HIVE-001"
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 CREATED`: Resource created successfully.
- `204 NO CONTENT`: Resource deleted successfully.
- `400 BAD REQUEST`: Validation error or illegal argument.
- `404 NOT FOUND`: Requested resource does not exist.
- `409 CONFLICT`: Unique constraint violation (e.g. duplicate farmId, hiveId, batchId, packageId).
- `500 INTERNAL SERVER ERROR`: Unhandled internal server error.

---

## API Endpoints Summary

| Category | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/api/health` | Returns service status and version |
| **Farms** | `POST` | `/api/farms` | Create a new farm |
| | `GET` | `/api/farms` | List all farms |
| | `GET` | `/api/farms/{farmId}` | Get farm details |
| | `PUT` | `/api/farms/{farmId}` | Update farm details |
| | `DELETE` | `/api/farms/{farmId}` | Delete farm |
| **Hives** | `POST` | `/api/hives` | Create a new hive under a farm |
| | `GET` | `/api/hives` | List all hives (optional `?farmId=...`) |
| | `GET` | `/api/hives/{hiveId}` | Get hive details |
| | `PUT` | `/api/hives/{hiveId}` | Update hive details |
| | `DELETE` | `/api/hives/{hiveId}` | Delete hive |
| | `GET` | `/api/hives/{hiveId}/history` | Get telemetry sensor history (params: `from`, `to`, `limit`) |
| | `GET` | `/api/hives/{hiveId}/latest` | Get latest telemetry reading |
| | `GET` | `/api/hives/{hiveId}/ai-status` | Get AI alert status foundation |
| | `GET` | `/api/hives/{hiveId}/alerts` | Get AI alerts history |
| **Sensors** | `POST` | `/api/sensors` | Submit IoT telemetry sensor reading (ESP32) |
| **Batches** | `POST` | `/api/batches` | Create a new honey harvest batch |
| | `GET` | `/api/batches` | List all honey batches |
| | `GET` | `/api/batches/{batchId}` | Get honey batch details |
| | `PUT` | `/api/batches/{batchId}` | Update honey batch |
| | `POST` | `/api/batches/{batchId}/recall` | Trigger batch emergency recall |
| **Quality** | `POST` | `/api/batches/{batchId}/quality-test` | Record lab quality inspection result |
| | `GET` | `/api/batches/{batchId}/quality-test` | List quality tests for a batch |
| **Processing** | `POST` | `/api/batches/{batchId}/processing` | Record processing step (filtering, etc.) |
| | `GET` | `/api/batches/{batchId}/processing` | List processing records for a batch |
| **Packages** | `POST` | `/api/packages` | Create retail consumer package |
| | `GET` | `/api/packages/{packageId}` | Get retail package details |
| **Traceability**| `GET` | `/api/batches/{batchId}/traceability` | Get supply chain timeline for a batch |
| | `GET` | `/api/packages/{packageId}/traceability` | Get supply chain timeline for a package |
| **Verify** | `GET` | `/api/verify/{packageId}` | Public consumer QR verification endpoint |

---

## Key Endpoint Examples

### 1. Health Check
`GET /api/health`
**Response (200 OK):**
```json
{
  "status": "UP",
  "service": "HoneyChain Backend",
  "version": "1.0.0"
}
```

### 2. Create Farm
`POST /api/farms`
**Request:**
```json
{
  "farmId": "farm-001",
  "name": "Green Valley Apiary",
  "ownerName": "Demo Beekeeper",
  "location": "Demo Location",
  "latitude": 20.5937,
  "longitude": 78.9629
}
```
**Response (201 Created):**
```json
{
  "id": "7f8a9b6c-...",
  "farmId": "farm-001",
  "name": "Green Valley Apiary",
  "ownerName": "Demo Beekeeper",
  "location": "Demo Location",
  "latitude": 20.5937,
  "longitude": 78.9629,
  "createdAt": "2026-09-07T21:15:00Z",
  "updatedAt": "2026-09-07T21:15:00Z"
}
```

### 3. Record Sensor Reading
`POST /api/sensors`
**Request:**
```json
{
  "hiveId": "hive-001",
  "temperature": 27.4,
  "humidity": 61.2,
  "weight": 2047.0,
  "soundLevel": 43.5,
  "latitude": 20.5937,
  "longitude": 78.9629,
  "timestamp": 1700000000
}
```
**Response (201 Created):**
```json
{
  "id": "e3b4c5d6-...",
  "hiveId": "hive-001",
  "temperature": 27.4,
  "humidity": 61.2,
  "weight": 2047.0,
  "soundLevel": 43.5,
  "latitude": 20.5937,
  "longitude": 78.9629,
  "timestamp": 1700000000
}
```

### 4. Verify Package (Customer QR Verification)
`GET /api/verify/PKG-001`
**Response (200 OK):**
```json
{
  "package": {
    "packageId": "PKG-001",
    "batchId": "BATCH-001",
    "qrUrl": "https://honeychain.io/verify/PKG-001",
    "status": "PACKAGED",
    "packagingDate": "2026-09-07T00:00:00Z"
  },
  "batch": {
    "batchId": "BATCH-001",
    "hiveId": "hive-001",
    "harvestDate": "2026-09-07",
    "quantity": 25.5,
    "unit": "KG",
    "status": "PACKAGED"
  },
  "hive": {
    "hiveId": "hive-001",
    "farmId": "farm-001",
    "name": "Hive 001",
    "location": "North Field"
  },
  "farm": {
    "farmId": "farm-001",
    "name": "Green Valley Apiary",
    "ownerName": "Demo Beekeeper"
  },
  "qualityTests": [
    {
      "moisture": 17.5,
      "pH": 4.2,
      "color": "Amber",
      "result": "PASS",
      "verifiedBy": "Quality Inspector"
    }
  ],
  "processingRecords": [
    {
      "processType": "FILTERING",
      "description": "Honey filtered before packaging",
      "verifiedBy": "Processing Operator"
    }
  ],
  "traceabilityEvents": [
    {
      "eventType": "HARVESTED",
      "timestamp": "2026-09-07T21:15:00Z"
    },
    {
      "eventType": "QUALITY_TESTED",
      "timestamp": "2026-09-07T21:16:00Z"
    },
    {
      "eventType": "PROCESSED",
      "timestamp": "2026-09-07T21:17:00Z"
    },
    {
      "eventType": "PACKAGED",
      "timestamp": "2026-09-07T21:18:00Z"
    }
  ],
  "blockchainVerificationStatus": "PENDING"
}
```

---

## Sequential Demo Workflow
To demonstrate full end-to-end functionality:
1. `POST /api/farms` (Create farm `farm-001`)
2. `POST /api/hives` (Create hive `hive-001` under `farm-001`)
3. `POST /api/sensors` (Ingest telemetry for `hive-001`)
4. `GET /api/hives/hive-001/latest` (Fetch latest telemetry)
5. `GET /api/hives/hive-001/history` (Fetch telemetry history)
6. `POST /api/batches` (Create batch `BATCH-001` from `hive-001`)
7. `POST /api/batches/BATCH-001/quality-test` (Record lab test result)
8. `POST /api/batches/BATCH-001/processing` (Record processing step)
9. `POST /api/packages` (Create retail package `PKG-001`)
10. `GET /api/verify/PKG-001` (Verify package lineage & status)

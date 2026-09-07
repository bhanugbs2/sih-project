# HoneyChain Architecture & Design Specification 🍯🔗

> **SIH Problem Statement:** SIH26021  
> **Title:** Honey Chain: A blockchain-based system for honey traceability and smart beekeeping management  
> **Team:** Nexora  

---

## 1. System Technology Pipeline Diagram

The system collects raw environmental data from IoT nodes, ingests telemetry via Spring Boot API services, stores off-chain state in PostgreSQL, executes AI decision-support algorithms, and renders real-time insights on the React Dashboard.

```mermaid
flowchart TD
    subgraph IoT_Layer["IoT Node Layer (Apiary)"]
        ESP32["ESP32 Microcontroller"]
        DHT22["DHT22 (Temp & Humidity)"]
        OLED["OLED SSD1306 Display"]
        SIM_SENSORS["Simulated Sensors\n(Load Cell / HX711, Mic, GPS)"]
        
        DHT22 --> ESP32
        OLED <-- ESP32
        SIM_SENSORS --> ESP32
    end

    subgraph Backend_Layer["Backend Services (Spring Boot / Java 21)"]
        API["Spring Boot REST API"]
        FLYWAY["Flyway Migration Engine"]
        JPA["Spring Data JPA"]

        API --> JPA
        FLYWAY --> JPA
    end

    subgraph Data_Storage["Off-Chain Storage"]
        PGDB[("PostgreSQL Database\n(Telemetry, Batches, Users)")]
        JPA <--> PGDB
    end

    subgraph AI_Engine["AI Decision Support Layer"]
        TRIBUO["Java ML Engine\n(Tribuo / Weka / Smile)"]
        TRIBUO <--> PGDB
    end

    subgraph User_Interface["Presentation Layer"]
        DASHBOARD["React + TypeScript Dashboard\n(Vite + Glassmorphism UI)"]
        API <--> DASHBOARD
    end

    ESP32 -- "HTTP / JSON Telemetry" --> API
    TRIBUO -- "Anomalies & Purity Index" --> DASHBOARD
```

---

## 2. Honey Traceability & Verification Lifecycle Flow

From apiary harvesting to consumer QR verification, every stage transitions state off-chain while anchoring critical hashes on-chain.

```mermaid
flowchart TD
    A["🐝 Bee Hive (IoT Telemetry)"] --> B["🍯 Honey Harvest"]
    B --> C["📦 Honey Batch Creation"]
    C --> D["🧪 Quality & Purity Testing (AI Scoring)"]
    D --> E["⚙️ Processing & Filtration"]
    E --> F["🏷️ Packaging & Serialization"]
    F --> G["🔗 Blockchain Anchoring (Merkle Root Hash)"]
    G --> H["📱 QR Code Serialization"]
    H --> I["🔍 Customer Public Verification Portal"]
```

---

## 3. Data Segregation: Off-Chain vs. On-Chain

To optimize storage cost and maintain transaction throughput:

```mermaid
graph LR
    subgraph OffChain["Off-Chain Data (PostgreSQL)"]
        direction TB
        OC1["High-frequency IoT Telemetry (Temp, Humidity, Weight, Acoustics)"]
        OC2["User Accounts & Roles (Beekeeper, Lab Tech, Auditor)"]
        OC3["Raw Lab Analysis Reports & Spectrogram Data"]
        OC4["Facility Processing Logs & Temperature Curves"]
    end

    subgraph OnChain["On-Chain Data (Blockchain Layer)"]
        direction TB
        ON1["Batch Merkle Root Hashes"]
        ON2["Harvest Date & Floral Source Verification"]
        ON3["Lab Purity Certificate Hash & Status"]
        ON4["Jar QR Serial Number Verification Proof"]
    end

    OffChain -- "Cryptographic Hash Commitment" --> OnChain
```

---

## 4. Architectural Principles & Scientific Decision Support

1. **Decision Support Language Policy**:
   - Sensor alerts avoid absolute diagnostic claims.
   - Example Output: `"Abnormal hive pattern detected. Beekeeper inspection recommended."`
2. **Local Blockchain Abstraction**:
   - The blockchain component provides a generic `BlockchainAdapter` interface.
   - Allows local EVM development nodes (Hardhat/Ganache) to be swapped with Ethereum Sepolia, Polygon, or Hyperledger Fabric.

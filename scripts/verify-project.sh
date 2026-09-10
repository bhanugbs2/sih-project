#!/usr/bin/env bash
# Bash script to perform a full system regression check for HoneyChain (SIH26021)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/.."

echo "=================================================="
echo " HoneyChain Local System Verification Utility     "
echo "=================================================="

# 1. Blockchain EVM Smart Contract Tests
echo -e "\n[1/4] Running Hardhat EVM Contract Tests..."
cd "${PROJECT_ROOT}/blockchain"
npx hardhat test

# 2. Backend Spring Boot Maven Tests
echo -e "\n[2/4] Running Spring Boot Backend Tests..."
cd "${PROJECT_ROOT}/backend"
./mvnw clean test

# 3. Frontend React Build
echo -e "\n[3/4] Running React Frontend Production Build..."
cd "${PROJECT_ROOT}/frontend"
npm run build

# 4. Flutter Mobile Analysis & Tests
echo -e "\n[4/4] Running Flutter Mobile Analysis & Tests..."
cd "${PROJECT_ROOT}/mobile"
flutter test

echo -e "\n=================================================="
echo " [OVERALL RESULT] ALL SYSTEM CHECKS PASSED SUCCESSFULLY!"
echo "=================================================="

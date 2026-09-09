const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HoneyTraceability Smart Contract", function () {
  let honeyTraceability;
  let owner;
  let inspector;

  beforeEach(async function () {
    [owner, inspector] = await ethers.getSigners();
    const HoneyTraceability = await ethers.getContractFactory("HoneyTraceability");
    honeyTraceability = await HoneyTraceability.deploy();
    await honeyTraceability.waitForDeployment();
  });

  it("1. Should deploy contract and initialize zero events", async function () {
    const count = await honeyTraceability.getEventsCount();
    expect(count).to.equal(0n);
  });

  it("2. Should record a traceability event and emit TraceabilityEventRecorded event", async function () {
    const batchId = "BATCH-P8-001";
    const packageId = "PKG-P8-001";
    const eventType = "QUALITY_TESTED";
    const dataHash = ethers.id("canonical-sha256-data-hash-string-value");

    const tx = await honeyTraceability.connect(inspector).recordTraceabilityEvent(
      batchId,
      packageId,
      eventType,
      dataHash
    );

    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);

    const count = await honeyTraceability.getEventsCount();
    expect(count).to.equal(1n);

    const batchEvents = await honeyTraceability.getEventsByBatchId(batchId);
    expect(batchEvents.length).to.equal(1);

    const eventHash = batchEvents[0];
    const record = await honeyTraceability.getEventByHash(eventHash);
    expect(record[0]).to.equal(batchId);
    expect(record[1]).to.equal(packageId);
    expect(record[2]).to.equal(eventType);
    expect(record[3]).to.equal(dataHash);
    expect(record[5]).to.equal(inspector.address);
  });

  it("3. Should verify on-chain dataHash accurately", async function () {
    const batchId = "BATCH-P8-VERIFY";
    const packageId = "";
    const eventType = "HARVESTED";
    const dataHash = ethers.id("harvest-data-hash-12345");

    await honeyTraceability.recordTraceabilityEvent(batchId, packageId, eventType, dataHash);

    const batchEvents = await honeyTraceability.getEventsByBatchId(batchId);
    const eventHash = batchEvents[0];

    const isValid = await honeyTraceability.verifyEventHash(eventHash, dataHash);
    expect(isValid).to.be.true;

    const wrongDataHash = ethers.id("fake-wrong-data-hash");
    const isWrongValid = await honeyTraceability.verifyEventHash(eventHash, wrongDataHash);
    expect(isWrongValid).to.be.false;
  });
});

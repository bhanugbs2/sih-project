const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying HoneyTraceability smart contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");

  const HoneyTraceability = await hre.ethers.getContractFactory("HoneyTraceability");
  const contract = await HoneyTraceability.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("HoneyTraceability contract successfully deployed to:", contractAddress);

  // Write contract details to deployment JSON for backend integration
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const deployFilePath = path.join(__dirname, "../deployment-info.json");
  fs.writeFileSync(deployFilePath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment details saved to:", deployFilePath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

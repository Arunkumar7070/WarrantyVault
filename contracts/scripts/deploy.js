const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying WarrantyRegistry with account:", deployer.address);

  const WarrantyRegistry = await hre.ethers.getContractFactory("WarrantyRegistry");
  const registry = await WarrantyRegistry.deploy(deployer.address);
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("WarrantyRegistry deployed to:", address);
  console.log("Set this as CONTRACT_ADDRESS in backend/.env");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy ICNToken
  const ICNToken = await hre.ethers.getContractFactory("ICNToken");
  const icnToken = await ICNToken.deploy(ethers.utils.parseEther("1000000")); // 1 million tokens
  await icnToken.deployed();
  console.log("ICNToken deployed to:", icnToken.address);

  // Deploy ParticipantRegistry
  const ParticipantRegistry = await hre.ethers.getContractFactory("ParticipantRegistry");
  const participantRegistry = await ParticipantRegistry.deploy();
  await participantRegistry.deployed();
  console.log("ParticipantRegistry deployed to:", participantRegistry.address);

  // Deploy ResourceMarketplace
  const ResourceMarketplace = await hre.ethers.getContractFactory("ResourceMarketplace");
  const resourceMarketplace = await ResourceMarketplace.deploy(icnToken.address, participantRegistry.address);
  await resourceMarketplace.deployed();
  console.log("ResourceMarketplace deployed to:", resourceMarketplace.address);

  // Deploy SLAOracle
  const SLAOracle = await hre.ethers.getContractFactory("SLAOracle");
  const slaOracle = await SLAOracle.deploy(participantRegistry.address);
  await slaOracle.deployed();
  console.log("SLAOracle deployed to:", slaOracle.address);

  // Additional setup
  console.log("Performing additional setup...");

  // Register ResourceMarketplace as a participant
  await participantRegistry.registerParticipant(resourceMarketplace.address, 1); // 1 for ServiceProvider
  console.log("ResourceMarketplace registered as a participant");

  console.log("Deployment and setup completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
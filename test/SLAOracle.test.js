const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SLAOracle", function () {
  let ParticipantRegistry;
  let SLAOracle;
  let participantRegistry;
  let slaOracle;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    ParticipantRegistry = await ethers.getContractFactory("ParticipantRegistry");
    participantRegistry = await ParticipantRegistry.deploy();
    await participantRegistry.waitForDeployment();

    SLAOracle = await ethers.getContractFactory("SLAOracle");
    slaOracle = await SLAOracle.deploy(await participantRegistry.getAddress());
    await slaOracle.waitForDeployment();

    // Register participants
    await participantRegistry.registerParticipant(addr1.address, 2); // SLAOracle
    await participantRegistry.registerParticipant(addr2.address, 0); // HardwareProvider
  });

  it("Should report SLA", async function () {
    await slaOracle.connect(addr1).reportSLA(addr2.address, 95);
    const [, score] = await slaOracle.getLatestSLAReport(addr2.address);
    expect(score).to.equal(95);
  });

  it("Should not allow non-SLA Oracles to report", async function () {
    await expect(slaOracle.connect(addr2).reportSLA(addr1.address, 95)).to.be.revertedWith("Not an SLA Oracle");
  });

  it("Should not allow performance scores above 100", async function () {
    await expect(slaOracle.connect(addr1).reportSLA(addr2.address, 101)).to.be.revertedWith("Performance score must be between 0 and 100");
  });

  it("Should return the latest SLA report", async function () {
    await slaOracle.connect(addr1).reportSLA(addr2.address, 95);
    await slaOracle.connect(addr1).reportSLA(addr2.address, 90);
    const [, score] = await slaOracle.getLatestSLAReport(addr2.address);
    expect(score).to.equal(90);
  });
});
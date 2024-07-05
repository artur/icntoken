const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ParticipantRegistry", function () {
  let ParticipantRegistry;
  let participantRegistry;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    ParticipantRegistry = await ethers.getContractFactory("ParticipantRegistry");
    participantRegistry = await ParticipantRegistry.deploy();
    await participantRegistry.waitForDeployment();
  });

  it("Should register a participant", async function () {
    await participantRegistry.registerParticipant(addr1.address, 0); // 0 for HardwareProvider
    expect(await participantRegistry.isActiveParticipant(addr1.address)).to.equal(true);
  });

  it("Should deactivate a participant", async function () {
    await participantRegistry.registerParticipant(addr1.address, 0);
    await participantRegistry.deactivateParticipant(addr1.address);
    expect(await participantRegistry.isActiveParticipant(addr1.address)).to.equal(false);
  });

  it("Should not allow non-owner to register participant", async function () {
    await expect(participantRegistry.connect(addr1).registerParticipant(addr2.address, 0))
      .to.be.revertedWithCustomError(participantRegistry, "OwnableUnauthorizedAccount")
      .withArgs(addr1.address);
  });

  it("Should not allow registering an already registered participant", async function () {
    await participantRegistry.registerParticipant(addr1.address, 0);
    await expect(participantRegistry.registerParticipant(addr1.address, 1)).to.be.revertedWith("Participant already registered");
  });
});
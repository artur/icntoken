const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ResourceMarketplace", function () {
  let ICNToken;
  let ParticipantRegistry;
  let ResourceMarketplace;
  let icnToken;
  let participantRegistry;
  let resourceMarketplace;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    ICNToken = await ethers.getContractFactory("ICNToken");
    icnToken = await ICNToken.deploy(ethers.parseEther("1000000"));
    await icnToken.waitForDeployment();

    ParticipantRegistry = await ethers.getContractFactory("ParticipantRegistry");
    participantRegistry = await ParticipantRegistry.deploy();
    await participantRegistry.waitForDeployment();

    ResourceMarketplace = await ethers.getContractFactory("ResourceMarketplace");
    resourceMarketplace = await ResourceMarketplace.deploy(await icnToken.getAddress(), await participantRegistry.getAddress());
    await resourceMarketplace.waitForDeployment();

    // Register participants
    await participantRegistry.registerParticipant(addr1.address, 0); // HardwareProvider
    await participantRegistry.registerParticipant(addr2.address, 1); // ServiceProvider

    // Give some tokens to addr2 (ServiceProvider)
    await icnToken.transfer(addr2.address, ethers.parseEther("1000"));
  });

  it("Should create a resource offer", async function () {
    await resourceMarketplace.connect(addr1).createResourceOffer(100, ethers.parseEther("10"));
    const offer = await resourceMarketplace.resourceOffers(0);
    expect(offer.provider).to.equal(addr1.address);
    expect(offer.computeUnits).to.equal(100);
    expect(offer.pricePerUnit).to.equal(ethers.parseEther("10"));
  });

  it("Should allow purchase of resources", async function () {
    await resourceMarketplace.connect(addr1).createResourceOffer(100, ethers.parseEther("10"));
    await icnToken.connect(addr2).approve(await resourceMarketplace.getAddress(), ethers.parseEther("1000"));
    await resourceMarketplace.connect(addr2).purchaseResource(0, 50);
    const offer = await resourceMarketplace.resourceOffers(0);
    expect(offer.computeUnits).to.equal(50);
  });

  it("Should not allow non-hardware providers to create offers", async function () {
    await expect(resourceMarketplace.connect(addr2).createResourceOffer(100, ethers.parseEther("10"))).to.be.revertedWith("Not a hardware provider");
  });

  it("Should not allow purchase with insufficient balance", async function () {
    await resourceMarketplace.connect(addr1).createResourceOffer(100, ethers.parseEther("10"));
    await icnToken.connect(addr2).approve(await resourceMarketplace.getAddress(), ethers.parseEther("1000"));
    
    // Transfer most of addr2's tokens to owner, leaving insufficient balance
    await icnToken.connect(addr2).transfer(owner.address, ethers.parseEther("999"));
    
    await expect(resourceMarketplace.connect(addr2).purchaseResource(0, 100))
      .to.be.revertedWith("Insufficient ICNT balance");
  });
});
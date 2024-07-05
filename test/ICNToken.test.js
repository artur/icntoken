const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ICNToken", function () {
  let ICNToken;
  let icnToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    ICNToken = await ethers.getContractFactory("ICNToken");
    icnToken = await ICNToken.deploy(ethers.parseEther("1000000"));
    await icnToken.waitForDeployment();
  });

  it("Should set the right owner", async function () {
    expect(await icnToken.owner()).to.equal(owner.address);
  });

  it("Should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await icnToken.balanceOf(owner.address);
    expect(await icnToken.totalSupply()).to.equal(ownerBalance);
  });

  it("Should allow owner to mint tokens", async function () {
    await icnToken.mint(addr1.address, 50);
    expect(await icnToken.balanceOf(addr1.address)).to.equal(50);
  });

  it("Should not allow non-owner to mint tokens", async function () {
    await expect(icnToken.connect(addr1).mint(addr2.address, 50))
      .to.be.revertedWithCustomError(icnToken, "OwnableUnauthorizedAccount")
      .withArgs(addr1.address);
  });
});
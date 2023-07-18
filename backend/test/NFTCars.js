import {
  time,
  loadFixture,
  dropTransaction,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { boolean } from "hardhat/internal/core/params/argumentTypes";

describe("NFTCars", function () {

  const NAME = "NFTCars";
  const SYMBOL = "CRS";

  const deployTokenFixture = async () => {

    const [deployer, buyer] = await ethers.getSigners(); // keypair (emulates users)
    const NFTCars = await ethers.deployContract(NAME, [NAME, SYMBOL]);

    await NFTCars.waitForDeployment(); // deploying & calling constructor

    return { deployer, buyer, NFTCars };
  }

  describe("Deployment", () => {
    it("Correctly constructs the smart contract", async () => {
      const { NFTCars } = await loadFixture(deployTokenFixture);

      expect(await NFTCars.name()).to.equal(NAME);
      expect(await NFTCars.symbol()).to.equal(SYMBOL);
    });

    it("Sets owner", async () => {
      const { deployer, NFTCars } = await loadFixture(deployTokenFixture);
      
      expect(await NFTCars.owner()).to.equal(deployer.address);
    });

  });

  describe("Minting", () => {
    it("Increases token supply", async () => {
      const { buyer, NFTCars } = await loadFixture(deployTokenFixture);
      await NFTCars.connect(buyer).safeMint("testURI");

      expect(await NFTCars.tokenSupply()).to.equal(1);
    });

    it("Sets token URI", async () => {
      const { buyer, NFTCars } = await loadFixture(deployTokenFixture);
      await NFTCars.connect(buyer).safeMint("testURI");

      expect(await NFTCars.tokenURI(1)).to.equal("testURI");
    });

  });

  describe("Burning", () => {
    it("Burns the token", async () => {
      const { buyer, NFTCars } = await loadFixture(deployTokenFixture);
      await NFTCars.connect(buyer).safeMint("testURI");
      await NFTCars.connect(buyer).burn(1);

      await expect(NFTCars.ownerOf(1)).to.revertedWith("ERC721: invalid token ID");
    });
  });

});
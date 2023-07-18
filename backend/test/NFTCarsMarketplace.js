import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer } from "ethers";
import { NFTCarsMarketplace } from "../typechain-types";

describe("NFTCars", () => {
  const TOKEN_ID = 1;
  const LISTING_ID = 1;
  const ONE_ETH = ethers.parseEther("1");
  const TWO_ETH = ethers.parseEther("2");

  const deployContractFixture = async () => {
    // skip first return value as getSigners() returns same signers every time
    const [, tokenHolder] = await ethers.getSigners(); // keypair (emulates users)

    // Deploying NFTCars ERC721 Token Contract
    const NFTCars = await ethers.deployContract("NFTCars", ["NFTCars", "CRS"]);
    await NFTCars.waitForDeployment();

    // skip second return value as it is the same as tokenHolder
    const [deployer, , tokenBuyer, otherUser] = await ethers.getSigners(); // keypair (emulates users)

    // Deploying NFTCarsMarketplace Contract -> Marketplace for ERC721 tokens
    const NFTCarsMarketplace = await ethers.deployContract(
      "NFTCarsMarketplace"
    );
    await NFTCarsMarketplace.waitForDeployment();

    // NFTCars contract instance will have tokenHolder owning NFTCars token #1
    await NFTCars.connect(tokenHolder).safeMint("testURI");

    // Approves marketplace contract to manage tokens
    await NFTCars.connect(tokenHolder).setApprovalForAll(NFTCarsMarketplace.getAddress(), true);

    // Listing NFTCars token #1 on NFTCarsMarketplace
    await listCar(
      NFTCarsMarketplace,
      tokenHolder,
      await NFTCars.getAddress(),
      TOKEN_ID,
      ONE_ETH
    );

    return { tokenHolder, tokenBuyer, otherUser, NFTCars, deployer, NFTCarsMarketplace };
  };

  describe("Deployment", () => {
    it("Sets owner upon constructor", async () => {
      const { deployer, NFTCarsMarketplace } = await loadFixture(
        deployContractFixture
      );

      expect(await NFTCarsMarketplace.owner()).to.equal(deployer.address);
    });
  });

  describe("Listing Car", () => {

    it("Checks to see if contract is ERC721", async () => {
      const { tokenHolder, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await expect(NFTCarsMarketplace.connect(
          tokenHolder
        ).listCar(
          NFTCarsMarketplace.getAddress(), TOKEN_ID, ONE_ETH
        )).to.revertedWithCustomError(NFTCarsMarketplace, "ContractIsNotERC721()");

    });

    it("Checks if caller is token owner or approved", async () => {
      const { tokenBuyer, NFTCars, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await expect(NFTCarsMarketplace.connect(tokenBuyer
        ).listCar(
          NFTCars.getAddress(), TOKEN_ID, ONE_ETH
        )).to.revertedWithCustomError(NFTCarsMarketplace, "NotAuthorized()");
    });

    it("Checks if contract is approved to manage tokens", async () => {
      const { tokenBuyer, NFTCars, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await NFTCars.connect(tokenBuyer).safeMint("testURI");

      await expect(NFTCarsMarketplace.connect(tokenBuyer
        ).listCar(
          NFTCars.getAddress(), 2, ONE_ETH
        )).to.revertedWithCustomError(NFTCarsMarketplace, "NotAuthorized()");
    });

    it("Increases total listing count", async () => {
      const { NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      expect(await NFTCarsMarketplace.totalSupply()).to.equal(1);
    });

    it("Correctly stores information", async () => {
      const { tokenHolder, NFTCars, NFTCarsMarketplace } = await loadFixture(deployContractFixture);
      const carListing = await NFTCarsMarketplace.getCarListing(1);

      expect(carListing.listingOwner).to.equal(tokenHolder.address);
      expect(carListing.contractAddress).to.equal(await NFTCars.getAddress());
      expect(carListing.nativeId).to.equal(TOKEN_ID);
      expect(carListing.cost).to.equal(ONE_ETH);
      expect(carListing.isListed).to.equal(true);
    });

  });

  describe("Buying Car", async () => {

    it("Checks if the car is avaliable", async () => {
      const { tokenHolder, tokenBuyer, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await NFTCarsMarketplace.connect(tokenHolder).makeUnavaliable(TOKEN_ID);

      await expect(
        NFTCarsMarketplace.connect(tokenBuyer).buyCar(LISTING_ID, { value: ONE_ETH })
      ).to.revertedWithCustomError(NFTCarsMarketplace, "NotAvaliable()");
    });

    it("Checks if ID is avaliable", async () => {
      const { tokenBuyer, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await expect(
        NFTCarsMarketplace.connect(tokenBuyer).buyCar(0)
      ).to.revertedWithCustomError(NFTCarsMarketplace, "NotAvaliable()");

      await expect(
        NFTCarsMarketplace.connect(tokenBuyer).buyCar(3)
      ).to.revertedWithCustomError(NFTCarsMarketplace, "NotAvaliable()");

    });

    it("Checks if listing owner still owns token", async () => {
      const { 
        tokenHolder, 
        tokenBuyer, 
        otherUser, 
        NFTCars, 
        NFTCarsMarketplace 
      } = await loadFixture(deployContractFixture);

      await NFTCars.connect(tokenHolder).safeTransferFrom(tokenHolder.address, tokenBuyer.address, TOKEN_ID);

      await expect(
        NFTCarsMarketplace.connect(otherUser).buyCar(1, { value: ONE_ETH })
      ).to.revertedWithCustomError(NFTCarsMarketplace, "NotAuthorized()");

    });

    it("Sets listing to unavaliable", async () => {
      const { tokenBuyer, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await NFTCarsMarketplace.connect(tokenBuyer).buyCar(TOKEN_ID, { value: ONE_ETH });
      expect((await NFTCarsMarketplace.getCarListing(TOKEN_ID)).isListed).to.equal(false);
    });

    it("Updates the user balances", async () => {
      const { tokenHolder, tokenBuyer, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await NFTCarsMarketplace.connect(tokenBuyer).buyCar(TOKEN_ID, { value: ONE_ETH });
      expect(await NFTCarsMarketplace.getBalances(tokenHolder)).to.equal(ONE_ETH);
    });

    it("Transfers the NFT to the buyer", async () => {
      const { tokenBuyer, NFTCars, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await NFTCarsMarketplace.connect(tokenBuyer).buyCar(TOKEN_ID, { value: ONE_ETH });
      expect(await NFTCars.ownerOf(TOKEN_ID)).to.equal(tokenBuyer.address);
    });

  });

  describe("Withdrawing Funds", () => {
    it("Rejects requests greater than user balances", async () => {
      const { tokenHolder, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await expect(NFTCarsMarketplace.connect(tokenHolder).withdraw(
        ONE_ETH
      )).to.revertedWithCustomError(
        NFTCarsMarketplace,
        "InsufficientFunds()"
      );
    });

    it("Updates user balances", async () => {
      const {
        tokenHolder, 
        tokenBuyer, 
        NFTCarsMarketplace 
      } = await loadFixture(deployContractFixture);


      await NFTCarsMarketplace.connect(tokenBuyer).buyCar(
        TOKEN_ID, 
        { value: ONE_ETH }
      );      
      
      await NFTCarsMarketplace.connect(tokenHolder).withdraw(
        ethers.parseEther("0.5")
      );

      expect(
        await NFTCarsMarketplace.getBalances(tokenHolder.address)
      ).to.equal(ethers.parseEther("0.5"));

    });

    it("Sends ether", async () => {
      const {
        tokenHolder, 
        tokenBuyer, 
        NFTCarsMarketplace 
      } = await loadFixture(deployContractFixture);

      await NFTCarsMarketplace.connect(tokenBuyer).buyCar(
        TOKEN_ID, 
        { value: ONE_ETH }
      );

      const balanceStart = await ethers.provider.getBalance(tokenHolder);

      await NFTCarsMarketplace.connect(tokenHolder).withdraw(
        ONE_ETH
      );

      const balanceEnd = await ethers.provider.getBalance(tokenHolder);

      // We use .least() here because transaction will cause gas
      expect(
        balanceEnd - balanceStart
      ).to.be.at.least(ethers.parseEther("0.99"));

    });

  });

  describe("Updating Avaliability", () => {

    it("Only allows token owner to update the listing", async () => {
      const { tokenBuyer, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await expect(
        NFTCarsMarketplace.connect(tokenBuyer).makeUnavaliable(TOKEN_ID)
        ).to.revertedWithCustomError(
          NFTCarsMarketplace,
          "NotAuthorized()"
      );

      await expect(
        NFTCarsMarketplace.connect(tokenBuyer).makeAvaliable(TOKEN_ID, ONE_ETH)
        ).to.revertedWithCustomError(
          NFTCarsMarketplace,
          "NotAuthorized()"
      );

      await expect(
        NFTCarsMarketplace.connect(tokenBuyer).updateCost(TOKEN_ID, TWO_ETH)
        ).to.revertedWithCustomError(
          NFTCarsMarketplace,
          "NotAuthorized()"
      );

    });

    it("Makes the car unavaliable", async () => {
      const { tokenHolder, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await NFTCarsMarketplace.connect(tokenHolder).makeUnavaliable(TOKEN_ID);
      expect(
        (await NFTCarsMarketplace.getCarListing(TOKEN_ID)).isListed
      ).to.equal(false);

    });

    it("Makes the car avaliable", async () => {
      const { tokenHolder, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await NFTCarsMarketplace.connect(tokenHolder).makeUnavaliable(TOKEN_ID);
      await NFTCarsMarketplace.connect(tokenHolder).makeAvaliable(TOKEN_ID, ONE_ETH);

      expect(
        (await NFTCarsMarketplace.getCarListing(TOKEN_ID)).isListed
      ).to.equal(true);
    });

    it("Updates listing owner if token owner has changed", async () => {
      const {
        tokenHolder, 
        tokenBuyer, 
        NFTCars, 
        NFTCarsMarketplace 
      } = await loadFixture(deployContractFixture);

      await NFTCarsMarketplace.connect(tokenHolder).makeUnavaliable(TOKEN_ID);

      // transfers NFT to tokenBuyer
      await NFTCars.connect(tokenHolder).safeTransferFrom(
        tokenHolder.address,
        tokenBuyer.address,
        TOKEN_ID
      );

      await NFTCarsMarketplace.connect(tokenBuyer).makeAvaliable(TOKEN_ID, ONE_ETH);

      expect(
        (await NFTCarsMarketplace.getCarListing(TOKEN_ID)).listingOwner
      ).to.equal(tokenBuyer.address);
    });

    it("Updates the cost upon making the listing avaliable", async () => {
      const { tokenHolder, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await NFTCarsMarketplace.connect(tokenHolder).makeUnavaliable(TOKEN_ID);
      await NFTCarsMarketplace.connect(tokenHolder).makeAvaliable(TOKEN_ID, TWO_ETH);

      expect(
        (await NFTCarsMarketplace.getCarListing(TOKEN_ID)).cost
      ).to.equal(TWO_ETH);
    });

  });

  describe("Updating Cost", () => {

    it("Only allows token owner to update the listing", async () => {
      const { tokenBuyer, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await expect(
        NFTCarsMarketplace.connect(tokenBuyer).updateCost(TOKEN_ID, TWO_ETH)
        ).to.revertedWithCustomError(
          NFTCarsMarketplace,
          "NotAuthorized()"
      );

    });

    it("Updates cost to new value", async () => {
      const { tokenHolder, NFTCarsMarketplace } = await loadFixture(deployContractFixture);

      await NFTCarsMarketplace.connect(tokenHolder).updateCost(
        TOKEN_ID,
        TWO_ETH
      );

      expect(
        (await NFTCarsMarketplace.getCarListing(TOKEN_ID)).cost
      ).to.equal(TWO_ETH);
    });

  });

  const listCar = async (
    NFTCarsMarketplace: NFTCarsMarketplace,
    lister: Signer,
    contractAddress: string,
    tokenId: number,
    cost: bigint
  ) => {
    await NFTCarsMarketplace.connect(lister).listCar(
      contractAddress,
      tokenId,
      cost
    );
  };

});
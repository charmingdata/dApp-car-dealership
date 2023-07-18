const { ethers } = require("hardhat");
// const hre = require("hardhat");

async function main() {
  const donationContract = await ethers.deployContract("NFTCarsMarketplace");

  await donationContract.waitForDeployment();

  console.log(
    `Contract deployed to https://testnet-zkevm.polygonscan.com/address/${donationContract.target}`
  );
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
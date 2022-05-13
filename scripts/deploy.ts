import { ethers } from "hardhat";

async function main(): Promise<void> {
  const factory = await ethers.getContractFactory("BadToken");

  const token = await factory.deploy();
  await token.deployed();

  console.log();

  const bFactory = await ethers.getContractFactory("Bridge");
  const bridge = await bFactory.deploy();
  await bridge.deployed();

  await token.changeOwner(bridge.address);

  console.log("Token deployed to ", token.address, ". Bridge deployed to ", bridge.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

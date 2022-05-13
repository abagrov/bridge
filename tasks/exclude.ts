import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { getWallet } from "../lib/wallet";
import { getContractAt } from "@nomiclabs/hardhat-ethers/internal/helpers";

task("exclude", "Excludes token")
    .addParam("burn", "Address of burn token to exclude")
    .setAction(async (args, hre) => {
        const staking = await getContractAt(hre, "Bridge", args.contract);

        const tx = await staking.excludeToken(args.burn, { gasLimit: 500_000, });
        await tx.wait();

        console.log(tx.hash);
    });
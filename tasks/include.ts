import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { getWallet } from "../lib/wallet";
import { getContractAt } from "@nomiclabs/hardhat-ethers/internal/helpers";

task("include", "Includes token")
    .addParam("burn", "Address of burn token")
    .addParam("mint", "Address of mint token")
    .setAction(async (args, hre) => {
        const staking = await getContractAt(hre, "Bridge", args.contract);

        const tx = await staking.includeToken(args.burn, args.mint, { gasLimit: 500_000, });
        await tx.wait();

        console.log(tx.hash);
    });
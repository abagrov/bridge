import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { getWallet } from "../lib/wallet";
import { getContractAt } from "@nomiclabs/hardhat-ethers/internal/helpers";
import { parseEther } from "ethers/lib/utils";

task("sswap", "Swap some tokens")
    .addParam("token", "Token address")
    .addParam("to", "Receptint")
    .addParam("amount", "Amount of swap")
    .addParam("chainId", "Id of chain")
    .setAction(async (args, hre) => {
        const bridge = await getContractAt(hre, "Bridge", args.contract);

        const tx = await bridge.swap(args.token, args.to, parseEther(args.amount), args.chainId, { gasLimit: 500_000, });
        await tx.wait();

        console.log(tx.hash);
    });
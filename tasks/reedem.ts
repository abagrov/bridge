import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { getWallet } from "../lib/wallet";
import { getContractAt } from "@nomiclabs/hardhat-ethers/internal/helpers";
import { parseEther } from "ethers/lib/utils";

task("swap", "Swap some tokens")
    .addParam("token", "Token address")
    .addParam("to", "Receptint")
    .addParam("amount", "Amount of swap")
    .addParam("nonce", "Number")
    .addParam("sign", "Signature")
    .setAction(async (args, hre) => {
        const bridge = await getContractAt(hre, "Bridge", args.contract);

        const sig = hre.ethers.utils.splitSignature(args.sign);

        const tx = await bridge.reedem(args.token, args.to, parseEther(args.amount), args.nonce, args.chainId, sig.v, sig.r, sig.s, { gasLimit: 500_000, });
        await tx.wait();

        console.log(tx.hash);
    });
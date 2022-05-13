import { task, types } from "hardhat/config";
import { BigNumber, Contract } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { getContract } from "../lib/contract";
import { getWallet } from "../lib/wallet";
import { parseBadToken } from "../lib/parse";
import { getProvider } from "../lib/provider";
import { getContractAt } from "@nomiclabs/hardhat-ethers/internal/helpers";
task("update-chain-id", "Enable or disable chain id.")
    .addParam("id", "Chain id")
    .addParam("enabled", "Enabled - true or false")
    .setAction(async (taskArgs, hre) => {
        return getContractAt(hre, "Bridge", taskArgs.contract)
            .then(async (contract: Contract) => {
                const tx = await contract.updateChainById(taskArgs.id, taskArgs.enabled == 'true', { gasLimit: 500_000, });
                await tx.wait();
                console.log(tx.hash);
            })
    });
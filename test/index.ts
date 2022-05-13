import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import conf from "../config";

describe("Staking", function () {
  let token1: Contract, token2: Contract;
  let bridge1: Contract, bridge2: Contract;
  const initialBalance = parseEther("10");
  const swapValue = parseEther("1");

  const nonce = 0;

  const chainId1 = 1;
  const chainId2 = 2;

  let owner: SignerWithAddress, user1: SignerWithAddress, user2: SignerWithAddress;

  this.beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();
    const tokenFactory = await ethers.getContractFactory("BadToken");
    const bridgeFactory = await ethers.getContractFactory("Bridge");

    token1 = await tokenFactory.deploy();
    await token1.deployed();

    token2 = await tokenFactory.deploy();
    await token2.deployed();

    bridge1 = await bridgeFactory.deploy();
    await bridge1.deployed();

    await token1.transfer(user1.address, initialBalance);
    await token1.changeOwner(bridge1.address);
    await token2.changeOwner(bridge1.address);

    bridge2 = await bridgeFactory.deploy();
    await bridge2.deployed();
  })

  it("Swap without include should fail", async function () {
    await expect(bridge1.swap(token1.address, user1.address, 10, chainId1)).to.be.reverted;
  });

  it("Swap with include but without chainId should fail", async function () {
    await bridge1.includeToken(token1.address, token2.address);
    await expect(bridge1.swap(token1.address, user1.address, 10, chainId1)).to.be.reverted;
  });

  it("3. Swap with include chainId should be ok", async function () {
    await bridge1.includeToken(token1.address, token2.address);
    await bridge1.updateChainById(chainId1, true);

    await bridge1.connect(user1).swap(token1.address, user2.address, swapValue, chainId1);

    expect(await token1.balanceOf(user1.address)).to.eql(initialBalance.sub(swapValue));
  });

  it("4. Reedem should be ok if called one time and fail if more than one time", async function () {
    const messageToSign = ethers.utils.arrayify(
      ethers.utils.solidityKeccak256(["address", "address", "uint", "uint", "uint"],
        [token2.address, user2.address, swapValue, nonce, chainId1])
    );
    const signature = await owner.signMessage(messageToSign);
    const sig = ethers.utils.splitSignature(signature);
    const reedem = await bridge1.redeem(token2.address, user2.address, swapValue, nonce, chainId1, sig.v, sig.r, sig.s);
    const reedemTx = await reedem.wait();

    const redeemEvent = reedemTx.events.find((e: { event: string }) => e.event == 'Redeem');
    expect(redeemEvent.args.to).to.eql(user2.address);
    expect(redeemEvent.args.amount).to.eql(swapValue);

    expect(await token2.balanceOf(user2.address)).to.eql(swapValue);

    await expect(bridge1.redeem(token2.address, user2.address, swapValue, nonce, chainId1, sig.v, sig.r, sig.s)).to.be.reverted;
    await expect(bridge1.redeem(token2.address, user2.address, swapValue, nonce + 1, chainId1, sig.v, sig.r, sig.s)).to.be.reverted;
  });

  it("5. Reedem should fail if different chain ids", async function () {
    const messageToSign = ethers.utils.arrayify(
      ethers.utils.solidityKeccak256(["address", "address", "uint", "uint", "uint"],
        [token2.address, user2.address, swapValue, nonce, chainId1])
    );
    const signature = await owner.signMessage(messageToSign);
    const sig = ethers.utils.splitSignature(signature);
    await expect(bridge1.redeem(token2.address, user2.address, swapValue, nonce, chainId2, sig.v, sig.r, sig.s)).to.be.reverted;
  });

  it("6. Reedem should fail if different tokens", async function () {
    const messageToSign = ethers.utils.arrayify(
      ethers.utils.solidityKeccak256(["address", "address", "uint", "uint", "uint"],
        [token2.address, user2.address, swapValue, nonce, chainId1])
    );
    const signature = await owner.signMessage(messageToSign);
    const sig = ethers.utils.splitSignature(signature);
    await expect(bridge1.redeem(token1.address, user2.address, swapValue, nonce, chainId2, sig.v, sig.r, sig.s)).to.be.reverted;
  });

  it("7. Reedem should fail if different amounts", async function () {
    const messageToSign = ethers.utils.arrayify(
      ethers.utils.solidityKeccak256(["address", "address", "uint", "uint", "uint"],
        [token2.address, user2.address, swapValue, nonce, chainId1])
    );
    const signature = await owner.signMessage(messageToSign);
    const sig = ethers.utils.splitSignature(signature);
    await expect(bridge1.redeem(token2.address, user2.address, swapValue.add(swapValue), nonce, chainId2, sig.v, sig.r, sig.s)).to.be.reverted;
  });

  it("8. Check swap event", async function () {
    await bridge1.includeToken(token1.address, token2.address);
    await bridge1.updateChainById(chainId1, true);

    const swap = await bridge1.connect(user1).swap(token1.address, user2.address, swapValue, chainId1);
    const tx = await swap.wait();

    const event = tx.events.find((e: { event: string }) => e.event == 'Swap');
    expect(event.args.mintTokem).to.eql(token2.address);
    expect(event.args.amount).to.eql(swapValue);
    expect(event.args.to).to.eql(user2.address);
    expect(event.args.chainId).to.eql(BigNumber.from(chainId1));
    expect(event.args.nonce).to.eql(BigNumber.from(nonce));
  });
});
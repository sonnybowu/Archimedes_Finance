const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { abiCurveFactory } = require("../ABIs");
const MainnetHelper = require("./MainnetHelper");

describe("CurveMetapool", () => {
    let adminWallet, walletA;
    let decimals;
    let metaPool;
    beforeEach("Deploy contracts", async () => {
        [adminWallet, walletA] = await ethers.getSigners();
        // Our ERC20 Token
        const factorylvUSDToken = await ethers.getContractFactory("LvUSDToken");
        const lvUSDToken = await factorylvUSDToken.deploy();
        await lvUSDToken.deployed();
        // Create Curve Metapool. Returns address
        const addressMetaPool = await MainnetHelper.createCurveMetaPool(lvUSDToken, adminWallet);
        // Get pool by address
    });

    describe("Metapool Creation", () => {
        it("has expected decimals", async () => {
            metaPool = await MainnetHelper.getMetaPool(addressMetaPool, adminWallet);
            decimals = await metaPool.decimals();
            expect(decimals).to.eq(18);
        });
        it("only owner can write to it", async () => {});
    });
});

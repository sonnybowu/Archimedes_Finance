const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { abiCurveFactory } = require("../ABIs");
const MainnetHelper = require("./MainnetHelper");
const { ContractTestContext } = require("./ContractTestContext");

describe("CurveMetapool", () => {
    let adminWallet, walletA;
    let pool;
    before(async () => {
        [adminWallet, walletA] = await ethers.getSigners();
        // Setup various contracts including lvUSD
        r = new ContractTestContext();
        await r.setup();
        // Create Curve Metapool. Returns pool object
        pool = await MainnetHelper.createCurveMetaPool(r.lvUSD, adminWallet);
    });

    describe("Creation", () => {
        it("has expected A() value", async () => {
            expect(await pool.A()).to.eq(1337);
        });
        it("only owner can write to it", async () => {});
    });
});

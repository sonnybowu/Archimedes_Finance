const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { abiCurveFactory } = require("../ABIs");
const MainnetHelper = require("./MainnetHelper");

describe("Test Pools Rewards", () => {
    let tUSD_metapool_coin;
    let metaPool;
    let stakingRewards;
    let adminWallet, walletA;
    let ERC20, METAPOOL, CRV3, StakingRewards;
    let tUSD, tGOV, crv3, weth;
    let mm10 = ethers.utils.parseUnits("10000000", 18);
    let mm3 = ethers.utils.parseUnits("3000000", 18);
    beforeEach("Deploy contracts", async () => {
        [adminWallet, walletA] = await ethers.getSigners();
        ERC20 = await ethers.getContractFactory("MintableToken");
        METAPOOL = await ethers.getContractFactory("metaPool");
        CRV3 = await ethers.getContractFactory("CRV3");
        StakingRewards = await ethers.getContractFactory("StakingRewards");
        WETH9 = await ethers.getContractFactory("WETH9");

        tUSD = await ERC20.deploy("tUSD", "tUSD");
        tGOV = await ERC20.deploy("tGOV", "tGOV");
        weth = await WETH9.deploy();

        // @param: _name: String[64], _symbol: String[32], _decimals: uint256, _supply: uint256
        tUSD_metapool_coin = await CRV3.deploy("tUSDPool", "tUSDPool", "18", 0);
        // .attach: Return an instance of a Contract attached to address.
        crv3 = await CRV3.attach(MainnetHelper.address3CRV);

        let result = await ethers.provider.send("hardhat_setBalance", [
            MainnetHelper.addressCurve3Pool,
            "0x" + Number(10 ** 48).toString(16),
        ]);

        result = await ethers.provider.send("hardhat_setBalance", [
            adminWallet.address,
            "0x" + Number(10 ** 48).toString(16),
        ]);

        // is this 10^48 minus 10^18 ?
        // send ETH and get back WETH
        await weth.deposit({ value: MainnetHelper.noExp(10 ** 30) });

        await tUSD.mint(adminWallet.address, mm10);
        await tGOV.mint(adminWallet.address, mm10);
    });

    describe("CurveFi Test", () => {
        it("CurveFi Test metaPool", async () => {
            // Our ERC20 Token
            const factorylvUSDToken = await ethers.getContractFactory("LvUSDToken");
            const lvUSDToken = await factorylvUSDToken.deploy();
            await lvUSDToken.deployed();

            addressDeployedMetaPool = await MainnetHelper.helperCreateCurveMetaPool(lvUSDToken, adminWallet);
        });
    });
});

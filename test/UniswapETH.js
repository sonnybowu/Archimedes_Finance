//const { ethers, waffle } = require('hardhat');
const { expect, assert } = require("chai");
const hre = require("hardhat");
const util = require("util");
const MainnetHelper = require("./MainnetHelper");

const CURVE_DAO_ADDRESS = "0xD533a949740bb3306d119CC777fa900bA034cd52";
const CRV3_ADDRESS = "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490";
const CRV3_POOL_ADDRESS = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
const GAUGE_CONTROLLER_ADDRESS = "0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB";
const GAUGE_MINTER = "0xd061D61a4d941c39E5453435B6345Dc261C2fcE0";
const ETH_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const CURVE_FACTORY_ADDRESS = "0xB9fC157394Af804a3578134A6585C0dc9cc990d4";

describe("Test Pools Rewards", () => {
    let ethers;
    let tUSD_metapool_coin;
    let metaPool;
    let stakingRewards;
    const mm10 = MainnetHelper.noExp(10 ** 7);
    let adminWallet, walletA;
    let ERC20, POOL3, METAPOOL, CRV3, CurveDAO, StakingRewards, TokenMinter;
    let tUSD, tGOV, crv3, weth, curveFactory;
    beforeEach("Deploy contracts", async () => {
        ethers = hre.ethers;
        [adminWallet, walletA] = await hre.ethers.getSigners();
        ERC20 = await ethers.getContractFactory("MintableToken");
        POOL3 = await ethers.getContractFactory("USDT_USDC_DAI_Pool");
        METAPOOL = await ethers.getContractFactory("metaPool");
        CRV3 = await ethers.getContractFactory("CRV3");
        CurveDAO = await ethers.getContractFactory("CurveDAO");
        StakingRewards = await ethers.getContractFactory("StakingRewards");
        TokenMinter = await ethers.getContractFactory("TokenMinter");
        WETH9 = await ethers.getContractFactory("WETH9");
        Curve2AssetPool = await ethers.getContractFactory("curve2AssetPool");
        CurveFactory = await ethers.getContractFactory("CurveFactory");
        StableSwap = await ethers.getContractFactory("PlainPool2");

        let result = await hre.ethers.provider.send("hardhat_setBalance", [
            CRV3_POOL_ADDRESS,
            "0x" + Number(10 ** 48).toString(16),
        ]);

        result = await hre.ethers.provider.send("hardhat_setBalance", [
            adminWallet.address,
            "0x" + Number(10 ** 48).toString(16),
        ]);

        tUSD = await ERC20.deploy("tUSD", "tUSD");
        tGOV = await ERC20.deploy("tGOV", "tGOV");
        weth = await WETH9.deploy();
        await weth.deposit({ value: MainnetHelper.noExp(10 ** 30) });

        tUSD_metapool_coin = await CRV3.deploy("tUSDPool", "tUSDPool", "18", 0);
        crv3 = await CRV3.attach(CRV3_ADDRESS);
        pool3 = await POOL3.attach(CRV3_POOL_ADDRESS);
        curveDAO = await CurveDAO.attach(CURVE_DAO_ADDRESS);
        tokenMinter = await TokenMinter.attach(GAUGE_MINTER);
        curveFactory = await CurveFactory.attach(CURVE_FACTORY_ADDRESS);

        await tUSD.mint(adminWallet.address, mm10);
        await tGOV.mint(adminWallet.address, mm10);
    });

    describe("CurveFi Test", () => {
        it("Uniswap ETH pool", async () => {
            console.log("Uniswap ETH pool");
            Factory = await ethers.getContractFactory("UniswapV2Factory");
            Router = await ethers.getContractFactory("UniswapV2Router02");
            Pair = await ethers.getContractFactory("UniswapV2Pair");

            console.log("Uniswap ETH pool part1");

            //factory = await Factory.deploy(adminWallet.address);
            factory = await Factory.attach("0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f");
            router = await Router.attach("0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D");
            console.log("Uniswap ETH pool part2");
            //router = await Router.deploy(factory.address, weth.address);

            let result1 = await factory.createPair(weth.address, tUSD.address);
            let poolAddress = await factory.getPair(weth.address, tUSD.address);
            console.log("Uniswap ETH pool part3");

            let pool = await Pair.attach(poolAddress);

            console.log(`pool token = ${util.inspect(await pool.balanceOf(pool.address))}`);

            const mm2 = MainnetHelper.noExp(10 ** 18 * 2 * 10 ** 6);
            const mm3 = MainnetHelper.noExp(10 ** 18 * 3 * 10 ** 6);
            const mm1 = MainnetHelper.noExp(Math.floor(10 ** 14));
            let balanceSend = MainnetHelper.noExp(10 ** 18 * 100);
            await tUSD.transfer(walletA.address, balanceSend);

            console.log(`transfer tUSD to UserA balance ${balanceSend}`);
            await MainnetHelper.printBalance("UserA", walletA.address, "tUSD", tUSD);

            await tUSD.approve(router.address, MainnetHelper.noExp(10 ** 50));
            await weth.approve(router.address, MainnetHelper.noExp(10 ** 50));

            let amt0 = 10 ** (6 + 18) * 2;
            let amt1 = 10 ** (6 + 18) * 2;
            console.log("\n--------------------");
            console.log("before liquidity add");

            await MainnetHelper.printBalance("admin", adminWallet.address, "tUSD", tUSD);
            await MainnetHelper.printBalance("admin", adminWallet.address, "weth", weth);

            await MainnetHelper.printBalance("pool", pool.address, "tUSD", tUSD);
            await MainnetHelper.printBalance("pool", pool.address, "weth", weth);
            await router.addLiquidity(
                weth.address,
                tUSD.address,
                MainnetHelper.noExp(amt0),
                MainnetHelper.noExp(amt1),
                0,
                0,
                adminWallet.address,
                Date.now() + 10000
            );

            console.log("after liquidity add");
            await MainnetHelper.printBalance("pool", pool.address, "tUSD", tUSD);
            await MainnetHelper.printBalance("pool", pool.address, "weth", weth);

            expect(Number(await tUSD.balanceOf(pool.address))).to.eq(amt0);
            expect(Number(await weth.balanceOf(pool.address))).to.eq(Number(amt1));
            console.log("end liquidity add");
            console.log("--------------------\n");

            console.log("--------------------");
            console.log("Before Swap ");
            await MainnetHelper.printBalance("UserA", walletA.address, "tUSD", tUSD);
            await MainnetHelper.printBalance("UserA", walletA.address, "weth", weth);

            await tUSD.connect(walletA).approve(router.address, MainnetHelper.noExp(10 ** 50));
            await router
                .connect(walletA)
                .swapExactTokensForTokensSupportingFeeOnTransferTokens(
                    MainnetHelper.noExp(balanceSend),
                    0,
                    [tUSD.address, weth.address],
                    walletA.address,
                    Date.now() + 10000
                );

            console.log("After Swap ");
            await MainnetHelper.printBalance("UserA", walletA.address, "tUSD", tUSD);
            await MainnetHelper.printBalance("UserA", walletA.address, "weth", weth);
            expect(await tUSD.balanceOf(walletA.address)).to.eq(0);

            console.log("End Swap ");
            console.log("--------------------\n");

            const twoWeeks = 1209600;

            console.log(`metaPoolToken balance adminWallet: ${await pool.balanceOf(adminWallet.address)}`);

            stakingRewards = await StakingRewards.deploy(
                adminWallet.address,
                adminWallet.address,
                tGOV.address,
                pool.address,
                twoWeeks
            );
            await tGOV.approve(stakingRewards.address, MainnetHelper.noExp(10 ** 50));

            // notifyRewardsAmount deposits rewards into the rewards contract
            // with 1 million tGOV
            const rewardAmt = 10 ** 18 * 10 ** 6;
            let resultStaking = await stakingRewards.notifyRewardAmount(
                MainnetHelper.noExp(rewardAmt),
                adminWallet.address
            );
            await pool.approve(stakingRewards.address, MainnetHelper.noExp(10 ** 40));
            await stakingRewards.stake(await pool.balanceOf(adminWallet.address));

            expect(await tUSD_metapool_coin.balanceOf(adminWallet.address)).to.eq(0);
            console.log(`balance before ${await tUSD_metapool_coin.balanceOf(adminWallet.address)}`);

            const secBetweenBlocks = 14;
            let blockBefore = await ethers.provider.getBlock();

            await MainnetHelper.printBalance("stakingRewards", stakingRewards.address, "tGOV", tGOV);

            const startTimestamp = (await ethers.provider.getBlock()).timestamp;
            await hre.network.provider.send("hardhat_mine", [
                "0x" + Number(500).toString(16),
                "0x" + Number(secBetweenBlocks).toString(16),
            ]);
            console.log("\nSTART SIMULATE REWARDS");
            console.log("--------------------------");
            const blockSteps = [50, 450, 4500, twoWeeks / secBetweenBlocks + 100];
            let blockTime;
            let blockNum = 0;
            for (let i = 0; i < blockSteps.length; ++i) {
                await hre.network.provider.send("hardhat_mine", [
                    "0x" + Number(blockSteps[i]).toString(16),
                    "0x" + Number(secBetweenBlocks).toString(16),
                ]);
                blockNum += blockSteps[i];
                blockTime = (await ethers.provider.getBlock()).timestamp;
                console.log(
                    `after ${blockNum} and ${((blockTime - startTimestamp) / 3600 / 24).toFixed(
                        2
                    )} days, Prct rewards earned: ${(
                        ((await stakingRewards.earned(adminWallet.address)) / rewardAmt) *
                        100
                    ).toFixed(6)}%`
                );
            }
            console.log("--------------------------");
            console.log("END SIMULATE REWARDS \n");

            await MainnetHelper.printBalance("admin", adminWallet.address, "tGOV", tGOV);
            await stakingRewards.getReward();
            await MainnetHelper.printBalance("admin", adminWallet.address, "tGOV", tGOV);
            await MainnetHelper.printBalance("stakingRewards", stakingRewards.address, "tGOV", tGOV);
            expect((await tGOV.balanceOf(stakingRewards.address)) / rewardAmt).to.be.at.most(0.00001);

            return;
        });
    });
});

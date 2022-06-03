import dotenv from "dotenv";
import { defaultBlockNumber, address3CRV, abi3CRVToken } from "../test/MainnetHelper";
import { createMetapool, getMetapool, fundMetapool } from "../test/CurveHelper";
const hre = require("hardhat");
const axios = require("axios").default;
dotenv.config({ path: "tenderly.env" });

// TODO: store this so we can delete it later
let forkId;
let FORK_URL;
const { TENDERLY_USER, TENDERLY_PROJECT, TENDERLY_ACCESS_KEY } = process.env;
const opts = {
    headers: {
        "X-Access-Key": TENDERLY_ACCESS_KEY as string,
    },
};

// deploy all of our contracts in order
async function main () {
    await hre.run("compile");

    // create a tenderly fork
    const TENDERLY_FORK_API = `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}/fork`;
    const body = {
        network_id: "1",
        block_number: defaultBlockNumber,
    };
    const res = await axios.post(TENDERLY_FORK_API, body, opts);
    console.log(`Forked with fork ID ${res.data.simulation_fork.id}. Check the Dashboard!`);
    forkId = res.data.simulation_fork.id;
    FORK_URL = `${TENDERLY_FORK_API}/${forkId}`;
    const FORK_RPC = `https://rpc.tenderly.co/fork/${forkId}`;

    const provider = new hre.ethers.providers.JsonRpcProvider(FORK_RPC);
    const signer = provider.getSigner();
    const [owner] = await hre.ethers.getSigners();

    // deploy lvusd
    const lvusdFactory = await hre.ethers.getContractFactory("LvUSDToken");
    const lvusd = await lvusdFactory.deploy(owner.address);
    await lvusd.deployed();
    await hre.tenderly.persistArtifacts({
        name: "LvUSDToken",
        address: lvusd.address,
    });
    console.log("LvUSDToken deployed to:", lvusd.address);

    // load 3crv
    const token3CRV = new hre.ethers.Contract(address3CRV, abi3CRVToken, owner);

    // deploy metapool
    const fundedPoolAmount = hre.ethers.utils.parseUnits("100.0");
    const addressPool = await createMetapool(lvusd, owner);
    console.log("metapool deployed:", addressPool);
    await token3CRV.approve(addressPool, fundedPoolAmount);
    await lvusd.approve(addressPool, fundedPoolAmount);
    console.log("approved pool to be funded");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        if (FORK_URL !== "undefined") {
            axios.delete(FORK_URL, opts).then(function () {
                console.log("fork deleted: ", FORK_URL);
                process.exit(1);
            });
        } else {
            process.exit(1);
        }
    });

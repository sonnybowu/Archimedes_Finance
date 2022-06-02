import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { PositionToken } from "../types/contracts";
import { buildContractTestContext, ContractTestContext, signers } from "./ContractTestContext";

describe("PositionToken test suit", function () {
    let r: ContractTestContext;
    const firstTokenId = 0;
    const secondTokenId = 1;
    const thirdTokenId = 2;
    let firstTokenOwner: SignerWithAddress;
    let firstTokenOwnerAddress: string;
    let secondTokenOwner: SignerWithAddress;
    let secondTokenOwnerAddress: string;
    let thirdTokenOwner: SignerWithAddress;
    let thirdTokenOwnerAddress: string;
    let positionTokenAsExecutive: PositionToken;

    before(async function () {
        const [owner] = await signers;
        r = await buildContractTestContext({
            positionToken: { executive: owner.address },
        });
        positionTokenAsExecutive = r.positionToken;
        firstTokenOwner = r.addr1;
        firstTokenOwnerAddress = r.addr1.address;
        secondTokenOwner = r.addr2;
        secondTokenOwnerAddress = r.addr2.address;
        thirdTokenOwner = r.addr3;
        thirdTokenOwnerAddress = r.addr3.address;
    });

    it("Should be built properly by ContractTestContext", async function () {
        expect(positionTokenAsExecutive).to.not.be.undefined;
    });

    it("Should not allow non executive to mint", async function () {
        const mintPromise = positionTokenAsExecutive.connect(firstTokenOwner).safeMint(r.addr1.address);
        await expect(mintPromise).to.be.revertedWith("Caller is not executive");
    });

    it("Should revert if the token id doesn't exist", async function () {
        await expect(positionTokenAsExecutive.ownerOf(0)).to.be.reverted;
    });

    it("Should be mintable from address designated executive", async function () {
        await positionTokenAsExecutive.safeMint(r.addr1.address);
        expect(await positionTokenAsExecutive.ownerOf(firstTokenId)).to.equal(firstTokenOwnerAddress);
    });

    it("Should increment the positionTokenId properly", async function () {
        await positionTokenAsExecutive.safeMint(r.addr2.address);
        expect(await positionTokenAsExecutive.ownerOf(secondTokenId)).to.equal(secondTokenOwnerAddress);
    });

    it("Should fail to burn if not executive", async function () {
        const burnPromise = r.positionToken.connect(secondTokenOwner).burn(firstTokenId);
        await expect(burnPromise).to.be.revertedWith("Caller is not executive");
    });

    it("Should not allow positionToken owner to burn positionToken directly. Position unwind required via executive", async function () {
        const burnPromise = r.positionToken.connect(firstTokenOwner).burn(firstTokenId);
        await expect(burnPromise).to.be.revertedWith("Caller is not executive");
    });

    it("Should allow executive to burn any token", async function () {
        await positionTokenAsExecutive.burn(firstTokenId);
        await positionTokenAsExecutive.burn(secondTokenId);
        expect(await positionTokenAsExecutive.exists(firstTokenId)).to.be.false;
        expect(await positionTokenAsExecutive.exists(secondTokenId)).to.be.false;
    });

    it("Should continue to increment id properly after tokens have been burned", async function () {
        await positionTokenAsExecutive.safeMint(r.addr3.address);
        expect(await positionTokenAsExecutive.ownerOf(thirdTokenId)).to.equal(thirdTokenOwnerAddress);
    });

    it("Should allow positionToken owner to transfer ownership", async function () {
        const safeTransferAsThirdOwner = r.positionToken.connect(thirdTokenOwner)["safeTransferFrom(address,address,uint256)"];
        await safeTransferAsThirdOwner(
            thirdTokenOwnerAddress,
            secondTokenOwnerAddress,
            thirdTokenId,
        );
        expect(await r.positionToken.ownerOf(thirdTokenId)).to.equal(secondTokenOwnerAddress);
    });

    it("Should not allow non owner to transfer positionToken", async function () {
        const safeTransferAsThirdOwner = r.positionToken.connect(thirdTokenOwner)["safeTransferFrom(address,address,uint256)"];
        /* thirdTokenOwner no longer owner of thirdTokenId, should not be able to transfer: */
        await expect(
            safeTransferAsThirdOwner(
                secondTokenOwnerAddress,
                thirdTokenOwnerAddress,
                thirdTokenId,
            ),
        ).to.be.revertedWith("ERC721: transfer caller is not owner nor approved");
    });
});

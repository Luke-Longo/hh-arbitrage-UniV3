import { assert, expect } from "chai"
import { ethers, network, deployments } from "hardhat"
import { PairFlash } from "../../typechain"
import { developmentChains } from "../../helper-hardhat-config"

!developmentChains.includes(network.name) ? describe.skip : describe("PairFlash", function () {})

describe("PairFlash", function () {
    let PairFlash: PairFlash
    beforeEach(async function () {
        await deployments.fixture()
        PairFlash = await ethers.getContract("PairFlash")
    })
    describe("constructor", function () {
        it("should set all values", async function () {})
    })
})

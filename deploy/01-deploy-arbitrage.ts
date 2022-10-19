import { DeployFunction } from "hardhat-deploy/dist/types"
import { network } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"

const deploy: DeployFunction = async (hre) => {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    let args = [
        networkConfig[network.name].SwapRouter,
        networkConfig[network.name].UniswapFactory,
        networkConfig[network.name].wethAddress,
    ]

    await deploy("PairFlash", {
        from: deployer,
        args,
        log: true,
    })
}

export default deploy

deploy.tags = ["all", "main"]

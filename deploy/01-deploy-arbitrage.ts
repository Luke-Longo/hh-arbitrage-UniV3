import { DeployFunction } from "hardhat-deploy/dist/types"
import { network } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"

const deploy: DeployFunction = async (hre) => {
    const { deployments, getNamedAccounts } = hre
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = await network.config.chainId!
    console.log("chainId", chainId)
    let args = [
        networkConfig[chainId].SwapRouter,
        networkConfig[chainId].UniswapFactory,
        networkConfig[chainId].wethAddress,
    ]

    const deployTx = await deploy("PairFlash", {
        from: deployer,
        args,
        log: true,
    })

    if (deployTx.newlyDeployed) {
        console.log("Contract PairFlash deployed at", deployTx.address)
    }
}

export default deploy

deploy.tags = ["all", "main"]

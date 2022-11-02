import { BigNumber } from "ethers"

type NetworkConfigItem = {
    name: string
    fundAmount: BigNumber
    fee?: string
    keyHash?: string
    interval?: string
    linkToken?: string
    vrfCoordinator?: string
    keepersUpdateInterval?: string
    oracle?: string
    jobId?: string
    ethUsdPriceFeed?: string
    SwapRouter?: string
    UniswapFactory?: string
    wethAddress?: string
}

type NetworkConfigMap = {
    [chainId: string]: NetworkConfigItem
}

export const networkConfig: NetworkConfigMap = {
    default: {
        name: "hardhat",
        fee: "100000000000000000",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
        fundAmount: BigNumber.from("1000000000000000000"),
        keepersUpdateInterval: "30",
        SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UniswapFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    31337: {
        name: "localhost",
        fee: "100000000000000000",
        keyHash: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
        jobId: "29fa9aa13bf1468788b7cc4a500a45b8",
        fundAmount: BigNumber.from("1000000000000000000"),
        keepersUpdateInterval: "30",
        ethUsdPriceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
        SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UniswapFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    1: {
        name: "mainnet",
        linkToken: "0x514910771af9ca656af840dff83e8264ecf986ca",
        fundAmount: BigNumber.from("0"),
        keepersUpdateInterval: "30",
        SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UniswapFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        wethAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    },
    5: {
        name: "goerli",
        linkToken: "0x326c977e6efc84e512bb9c30f76e30c160ed06fb",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        keyHash: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        vrfCoordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
        oracle: "0xCC79157eb46F5624204f47AB42b3906cAA40eaB7",
        jobId: "ca98366cc7314957b8c012c72f05aeeb",
        fee: "100000000000000000",
        fundAmount: BigNumber.from("100000000000000000"),
        keepersUpdateInterval: "30",
        SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UniswapFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        wethAddress: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    },
    137: {
        name: "polygon",
        linkToken: "0xb0897686c545045afc77cf20ec7a532e3120e0f1",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
        oracle: "0x0a31078cd57d23bf9e8e8f1ba78356ca2090569e",
        jobId: "12b86114fa9e46bab3ca436f88e1a912",
        fee: "100000000000000",
        fundAmount: BigNumber.from("100000000000000"),
        SwapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
        UniswapFactory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
        wethAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
    },
}

export const developmentChains: string[] = ["hardhat", "localhost"]
export const VERIFICATION_BLOCK_CONFIRMATIONS = 6

export const PROJECT_SETTINGS = {
    isLocal: false,
    isDeployed: false,
    localUrl: "http://127.0.0.1:8545/",
    localPrivateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    account2PrivateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
}
export const UNISWAP = {
    V2_ROUTER_02_ADDRESS: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    FACTORY_ADDRESS: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
}
export const SUSHISWAP = {
    V2_ROUTER_02_ADDRESS: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
    FACTORY_ADDRESS: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
}

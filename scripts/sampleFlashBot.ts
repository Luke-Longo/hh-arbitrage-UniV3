import { Alchemy, Network, Wallet, Utils } from "alchemy-sdk"
import { ethers } from "ethers"
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle"
import * as dotenv from "dotenv"

dotenv.config()

const { ALCHEMY_FLASHBOT_KEY, PRIVATE_KEY, ALCHEMY_FLASHBOT_URL, FLASHBOT_PRIVATE_KEY } =
    process.env

const settings = {
    apiKey: ALCHEMY_FLASHBOT_KEY!,
    network: Network.ETH_MAINNET, // Replace with your network.
}

const alchemy = new Alchemy(settings)

let wallet = new Wallet(PRIVATE_KEY!)

const nonce = await alchemy.core.getTransactionCount(wallet.address, "latest")

const blockNumber = await alchemy.core.getBlockNumber()

// you can use the data field to call specific functions on a contract, ie call the initiate swap on the paiFlash contract

let exampleTx = {
    to: "0x4b9007B0BcE78cfB634032ec31Ed56adB464287b",
    value: 10,
    gasLimit: "21000",
    maxFeePerGas: Utils.parseUnits("20", "gwei"),
    nonce: nonce,
    type: 2,
    chainId: 5,
    data: "0x",
}

let rawTransaction = await wallet.signTransaction(exampleTx)

const signedTx = await alchemy.transact.sendPrivateTransaction(
    rawTransaction,
    (await alchemy.core.getBlockNumber()) + 1
)

console.log(signedTx)

// From flashBots docs

// const provider = new ethers.providers.JsonRpcProvider({
//     url: ALCHEMY_FLASHBOT_URL!,
// })

// const authSigner = new ethers.Wallet(FLASHBOT_PRIVATE_KEY!)
// const flashbotsProvider = await FlashbotsBundleProvider.create(provider, authSigner)

// const signedBundle = await flashbotsProvider.signBundle([
//     {
//         signer: SOME_SIGNER_TO_SEND_FROM,
//         transaction: SOME_TRANSACTION_TO_SEND,
//     },
// ])

// const bundleReceipt = await flashbotsProvider.sendRawBundle(signedBundle, blockNumber)

// Setup: npm install alchemy-sdk
// Github: https://github.com/alchemyplatform/alchemy-sdk-js
import { Alchemy, Network, Wallet, Utils } from "alchemy-sdk"

import * as dotenv from "dotenv"

dotenv.config()

const { API_KEY, PRIVATE_KEY } = process.env

const settings = {
    apiKey: API_KEY,
    network: Network.ETH_MAINNET, // Replace with your network.
}
const alchemy = new Alchemy(settings)

let wallet = new Wallet(PRIVATE_KEY!)

const nonce = await alchemy.core.getTransactionCount(wallet.address, "latest")

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


import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.34.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import * as Utils from  './util/swapshop-tests-utils.ts';
import { SwapShop } from './model/swapshop-v1-model.ts';
import { GetInfoResponse } from './model/swapshop-v1-model.ts';


//  C O N S T A N T S
const contractName = 'swapshop-v1'
const defaultNftAssetContract = "sip009-test"
const contractPrincipal = (acc: Account) => `${acc.address}.${contractName}`
let logEvents = true

Clarinet.test({
    name: "get-info",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, dealer1, dealer2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        const receipt = swapShop.getInfo(dealer1)
        console.log(receipt.result)
        const resp = receipt.result.expectOk().expectTuple() as GetInfoResponse
        console.log(resp)
        // (ok {confirmations: u0, deal-status: u1, dealers: [ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG], time-lock: u5, version: "v1"})
    }
})

/**
 * 
    (define-read-only (get-info)
        (ok {
            deal-status: (get-deal-status),
            confirmations: (get-confirm-count),
            time-lock: (get-time-lock),
            version: (get-version),
            dealers: (get-dealers)
        })
    )
 */

Clarinet.test({
    name: "submitDeal-time-lock-expired",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, dealer1, dealer2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        chain.mineEmptyBlockUntil(50)

        const receipt = swapShop.submitDeal(dealer1)
        receipt.result.expectErr().expectUint(100)
     }
})

Clarinet.test({
    name: "submitDeal-dealer-not-found",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, dealer1, dealer2, dealer3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        const receipt = swapShop.submitDeal(dealer3)
        receipt.result.expectErr().expectUint(209)
     }
})


Clarinet.test({
    name: "sumbit-deal",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, dealer1, dealer2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: dealer1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)

        const receipt = swapShop.submitDeal(dealer1)
        receipt.result.expectOk()

        // >> CHECK NFT TRANSFER
        receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            dealer1.address,
            contractPrincipal(deployer),
            mint1.nftAsset,
            mint1.nftAssetId
        )
     }
})

Clarinet.test({
    name: "sumbit-deal-dealer2",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, dealer1, dealer2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: dealer1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)
        const receipt = swapShop.submitDeal(dealer2)
        receipt.result.expectOk()

        // >> CHECK STX TRANSFER
        receipt.events.expectSTXTransferEvent(
            10000,
            dealer2.address,
            contractPrincipal(deployer)
        )
     }
})

Clarinet.test({
    name: "submit-deal-twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, dealer1, dealer2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: dealer1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)

        const receipt = swapShop.submitDeal(dealer1)
        receipt.result.expectOk()

        // >> CHECK TRANSFER
        receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            dealer1.address,
            contractPrincipal(deployer),
            mint1.nftAsset,
            mint1.nftAssetId
        )

        const receipt2 = swapShop.submitDeal(dealer1)
        receipt2.result.expectErr().expectUint(202)
     }
})

Clarinet.test({
    name: "submit-deal-no-asset-to-transfer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, dealer1, dealer2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        const receipt = swapShop.submitDeal(dealer1)
        receipt.result.expectErr().expectUint(205)

     }
})

Clarinet.test({
    name: "claim-time-lock-not-expired",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, dealer1, dealer2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        const receipt = swapShop.claim(dealer1)
        receipt.result.expectErr().expectUint(101)
    }
})

Clarinet.test({
    name: "claim-no-dealer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, dealer1, dealer2, dealer3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        chain.mineEmptyBlockUntil(50)
        const receipt = swapShop.claim(dealer3)
        receipt.result.expectErr().expectUint(209)
    }
})

Clarinet.test({
    name: "claim-success",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, dealer1, dealer2, dealer3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: dealer1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)

        const dealReceipt = swapShop.submitDeal(dealer1)
        dealReceipt.result.expectOk()
        // >> CHECK NFT TRANSFER
        dealReceipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            dealer1.address,
            contractPrincipal(deployer),
            mint1.nftAsset,
            mint1.nftAssetId
        )

        chain.mineEmptyBlockUntil(50)
        
        const claimReceipt = swapShop.claim(dealer1)
        claimReceipt.result.expectOk()

         // >> CHECK NFT TRANSFER
        //  claimReceipt.events.expectNonFungibleTokenTransferEvent(
        //     mint1.tokenId,
        //     contractPrincipal(deployer),
        //     dealer1.address,
        //     mint1.nftAsset,
        //     mint1.nftAssetId
        // )
    }
})

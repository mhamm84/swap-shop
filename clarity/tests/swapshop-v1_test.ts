
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.34.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import * as Utils from  './util/swapshop-tests-utils.ts';
import { SwapShop, GetInfoResponse } from './model/swapshop-v1-model.ts';


//  C O N S T A N T S
const contractName = 'swapshop-v1'
const defaultNftAssetContract = "sip009-test"
const contractPrincipal = (acc: Account) => `${acc.address}.${contractName}`
let logEvents = true
const timelockBlocks = 36

Clarinet.test({
    name: "get-info",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        const receipt = swapShop.getInfo(trader1)
        console.log(receipt.result)
        const resp = receipt.result.expectOk().expectTuple() as GetInfoResponse
        assertEquals(resp.confirmations, "u0", "confimrations expected")
        assertEquals(resp.tradeStatus, "u1", "trade status expected")
        assertEquals(resp.timelock, "u"+timelockBlocks, "time lock expected")

        Utils.checkTradeInfo(receipt, 0, 1, timelockBlocks)
        // (ok {confirmations: u0, trade-status: u1, traders: [ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG], time-lock: u5, version: "v1"})
    }
})

/**
 * 
    (define-read-only (get-info)
        (ok {
            trade-status: (get-trade-status),
            confirmations: (get-confirm-count),
            time-lock: (get-time-lock),
            version: (get-version),
            traders: (get-traders)
        })
    )
 */

Clarinet.test({
    name: "submitTrade-time-lock-expired",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        chain.mineEmptyBlockUntil(50)

        const receipt = swapShop.submitTrade(trader1)
        receipt.result.expectErr().expectUint(100)
     }
})

Clarinet.test({
    name: "submitTrade-trader-not-found",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2, trader3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        const receipt = swapShop.submitTrade(trader3)
        receipt.result.expectErr().expectUint(208)
     }
})


Clarinet.test({
    name: "sumbit-trade-trader1",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: trader1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)

        const receipt = swapShop.submitTrade(trader1)
        receipt.result.expectOk()

        // >> CHECK NFT TRANSFER
        receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            trader1.address,
            contractPrincipal(deployer),
            mint1.nftAsset,
            mint1.nftAssetId
        )
     }
})

Clarinet.test({
    name: "sumbit-trade-trader2",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: trader1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)
        const receipt = swapShop.submitTrade(trader2)
        receipt.result.expectOk()

        // >> CHECK STX TRANSFER
        receipt.events.expectSTXTransferEvent(
            10000,
            trader2.address,
            contractPrincipal(deployer)
        )
     }
})

Clarinet.test({
    name: "submit-trade-twice",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: trader1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)

        const receipt = swapShop.submitTrade(trader1)
        receipt.result.expectOk()

        // >> CHECK TRANSFER
        receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            trader1.address,
            contractPrincipal(deployer),
            mint1.nftAsset,
            mint1.nftAssetId
        )

        const receipt2 = swapShop.submitTrade(trader1)
        receipt2.result.expectErr().expectUint(201)
     }
})

Clarinet.test({
    name: "submit-trade-no-asset-to-transfer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer, logEvents)

        const receipt = swapShop.submitTrade(trader1)
        receipt.result.expectErr().expectUint(204)

     }
})

Clarinet.test({
    name: "claim-time-lock-not-expired",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        const receipt = swapShop.claim(trader1)
        receipt.result.expectErr().expectUint(101)
    }
})

Clarinet.test({
    name: "claim-not-submitted",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        chain.mineEmptyBlockUntil(50)
        const receipt = swapShop.claim(trader1)
        receipt.result.expectErr().expectUint(209)
    }
})

Clarinet.test({
    name: "claim-no-trader",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2, trader3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        chain.mineEmptyBlockUntil(50)
        const receipt = swapShop.claim(trader3)
        receipt.result.expectErr().expectUint(208)
    }
})

Clarinet.test({
    name: "claim-double",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2, trader3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: trader1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)

        const trader1Receipt = swapShop.submitTrade(trader1)
        trader1Receipt.result.expectOk()
        // >> CHECK NFT TRANSFER TO CONTRACT
        trader1Receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            trader1.address,
            contractPrincipal(deployer),
            mint1.nftAsset,
            mint1.nftAssetId
        )

        chain.mineEmptyBlockUntil(50)
        
        const claim1Receipt = swapShop.claim(trader1)
        claim1Receipt.result.expectOk()

        // >> CHECK NFT TRANSFER BACK TO SENDER
        claim1Receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            contractPrincipal(deployer),
            trader1.address,
            mint1.nftAsset,
            mint1.nftAssetId
        )

        const claim1Receipt2 = swapShop.claim(trader1)
        claim1Receipt2.result.expectErr().expectUint(203)
    }
})


Clarinet.test({
    name: "claim-success",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2, trader3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: trader1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)

        const trader1Receipt = swapShop.submitTrade(trader1)
        trader1Receipt.result.expectOk()
        // >> CHECK NFT TRANSFER TO CONTRACT
        trader1Receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            trader1.address,
            contractPrincipal(deployer),
            mint1.nftAsset,
            mint1.nftAssetId
        )

        const trader2Receipt = swapShop.submitTrade(trader2)
        trader2Receipt.result.expectOk()
        // >> CHECK NFT TRANSFER TO CONTRACT
        trader2Receipt.events.expectSTXTransferEvent(
            10000,
            trader2.address,
            contractPrincipal(deployer)   
        )

        chain.mineEmptyBlockUntil(50)
        
        const claim1Receipt = swapShop.claim(trader1)
        claim1Receipt.result.expectOk()

        // >> CHECK NFT TRANSFER BACK TO SENDER
        claim1Receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            contractPrincipal(deployer),
            trader1.address,
            mint1.nftAsset,
            mint1.nftAssetId
        )

        const claim2Receipt = swapShop.claim(trader2)
        claim2Receipt.result.expectOk()

        // >> CHECK STX TRANSFER BACK TO SENDER
        claim2Receipt.events.expectSTXTransferEvent(
            10000,
            contractPrincipal(deployer),
            trader2.address 
        )
    }
})

Clarinet.test({
    name: "confirm-not-submitted",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2, trader3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        chain.mineEmptyBlockUntil(5)

        const confirmtrader1 = swapShop.confirmTrade(trader1)
        confirmtrader1.result.expectErr().expectUint(209)

        const receipt = swapShop.getInfo(trader1)
        console.log(receipt.result)
        Utils.checkTradeInfo(receipt, 0, 1, timelockBlocks)
    }
})

Clarinet.test({
    name: "confirm-trader-not-found",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2, trader3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        chain.mineEmptyBlockUntil(5)

        const confirmtrader1 = swapShop.confirmTrade(trader3)
        confirmtrader1.result.expectErr().expectUint(208)
    }
})

Clarinet.test({
    name: "confirm-success",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2, trader3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: trader1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)

        const trader1Receipt = swapShop.submitTrade(trader1)
        trader1Receipt.result.expectOk()
        // >> CHECK NFT TRANSFER TO CONTRACT
        trader1Receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            trader1.address,
            contractPrincipal(deployer),
            mint1.nftAsset,
            mint1.nftAssetId
        )

        const trader2Receipt = swapShop.submitTrade(trader2)
        trader2Receipt.result.expectOk()
        // >> CHECK STX TRANSFER TO CONTRACT
        trader2Receipt.events.expectSTXTransferEvent(
            10000,
            trader2.address,
            contractPrincipal(deployer)   
        )

        chain.mineEmptyBlockUntil(5)

        const confirmtrader1 = swapShop.confirmTrade(trader1)
        confirmtrader1.result.expectOk()

        const receipt = swapShop.getInfo(trader1)
        console.log(receipt.result)
        Utils.checkTradeInfo(receipt, 1, 1, timelockBlocks)

        const confirmtrader2 = swapShop.confirmTrade(trader2)
        confirmtrader2.result.expectOk()

        const receipt2 = swapShop.getInfo(trader2)
        console.log(receipt2.result)
        Utils.checkTradeInfo(receipt2, 2, 2, timelockBlocks)

        // >> CHECK NFT TRANSFER TO TRADER 2
        confirmtrader2.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            contractPrincipal(deployer),
            trader2.address,
            mint1.nftAsset,
            mint1.nftAssetId
        )
        // >> CHECK STX TRANSFER TO TRADER 1
        confirmtrader2.events.expectSTXTransferEvent(
            10000,
            contractPrincipal(deployer),
            trader1.address,
        )
    }
})

Clarinet.test({
    name: "confirm-trade-already-complete",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2, trader3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: trader1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)

        const trader1Receipt = swapShop.submitTrade(trader1)
        trader1Receipt.result.expectOk()
        // >> CHECK NFT TRANSFER TO CONTRACT
        trader1Receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            trader1.address,
            contractPrincipal(deployer),
            mint1.nftAsset,
            mint1.nftAssetId
        )

        const trader2Receipt = swapShop.submitTrade(trader2)
        trader2Receipt.result.expectOk()
        // >> CHECK STX TRANSFER TO CONTRACT
        trader2Receipt.events.expectSTXTransferEvent(
            10000,
            trader2.address,
            contractPrincipal(deployer)   
        )

        chain.mineEmptyBlockUntil(5)

        const confirmtrader1 = swapShop.confirmTrade(trader1)
        confirmtrader1.result.expectOk()

        const receipt = swapShop.getInfo(trader1)
        console.log(receipt.result)
        Utils.checkTradeInfo(receipt, 1, 1, timelockBlocks)

        const confirmtrader2 = swapShop.confirmTrade(trader2)
        confirmtrader2.result.expectOk()

        const receipt2 = swapShop.getInfo(trader2)
        console.log(receipt2.result)
        Utils.checkTradeInfo(receipt2, 2, 2, timelockBlocks)

        // >> CHECK NFT TRANSFER TO TRADER 2
        confirmtrader2.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            contractPrincipal(deployer),
            trader2.address,
            mint1.nftAsset,
            mint1.nftAssetId
        )
        // >> CHECK STX TRANSFER TO TRADER 1
        confirmtrader2.events.expectSTXTransferEvent(
            10000,
            contractPrincipal(deployer),
            trader1.address,
        )

        const confirm2trader2 = swapShop.confirmTrade(trader2)
        confirm2trader2.result.expectErr().expectUint(102)
    }
})

Clarinet.test({
    name: "confirm-trader-second-confirm-attempt",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2, trader3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: trader1, nftAsset: defaultNftAssetContract}
        const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)

        const trader1Receipt = swapShop.submitTrade(trader1)
        trader1Receipt.result.expectOk()
        // >> CHECK NFT TRANSFER TO CONTRACT
        trader1Receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            trader1.address,
            contractPrincipal(deployer),
            mint1.nftAsset,
            mint1.nftAssetId
        )

        const trader2Receipt = swapShop.submitTrade(trader2)
        trader2Receipt.result.expectOk()
        // >> CHECK STX TRANSFER TO CONTRACT
        trader2Receipt.events.expectSTXTransferEvent(
            10000,
            trader2.address,
            contractPrincipal(deployer)   
        )

        // FAST FWD >>>>>
        chain.mineEmptyBlockUntil(5)

        // FIRST CONFIRM
        const confirmtrader1 = swapShop.confirmTrade(trader1)
        confirmtrader1.result.expectOk()
        let receipt = swapShop.getInfo(trader1)
        Utils.checkTradeInfo(receipt, 1, 1, timelockBlocks)

        // SECOND CONFIRM - SAME TRADER
        const confirm2trader1 = swapShop.confirmTrade(trader1)
        confirm2trader1.result.expectErr().expectUint(202)
        receipt = swapShop.getInfo(trader1)
        Utils.checkTradeInfo(receipt, 1, 1, timelockBlocks)
    }
})

Clarinet.test({
    name: "submit-deal-done",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, trader1, trader2, trader3] = ['deployer', 'wallet_1', 'wallet_2', 'wallet_3'].map(name => accounts.get(name)!)  
        
        let swapShop = new SwapShop(chain, deployer, logEvents)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: trader1, nftAsset: defaultNftAssetContract}
		const mint1 = Utils.mintNft(minter)
        console.log("nft create - id: " + mint1.tokenId)

        const trader1Receipt = swapShop.submitTrade(trader1)
        trader1Receipt.result.expectOk()
        // >> CHECK NFT TRANSFER TO CONTRACT
        trader1Receipt.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            trader1.address,
            contractPrincipal(deployer),
            mint1.nftAsset,
            mint1.nftAssetId
        )

        const trader2Receipt = swapShop.submitTrade(trader2)
        trader2Receipt.result.expectOk()
        // >> CHECK STX TRANSFER TO CONTRACT
        trader2Receipt.events.expectSTXTransferEvent(
            10000,
            trader2.address,
            contractPrincipal(deployer)   
        )

        const confirmtrader1 = swapShop.confirmTrade(trader1)
        confirmtrader1.result.expectOk()

        const receipt = swapShop.getInfo(trader1)
        console.log(receipt.result)
        Utils.checkTradeInfo(receipt, 1, 1, timelockBlocks)

        const confirmtrader2 = swapShop.confirmTrade(trader2)
        confirmtrader2.result.expectOk()

        const receipt2 = swapShop.getInfo(trader2)
        console.log(receipt2.result)
        Utils.checkTradeInfo(receipt2, 2, 2, timelockBlocks)

        // >> CHECK NFT TRANSFER TO TRADER 2
        confirmtrader2.events.expectNonFungibleTokenTransferEvent(
            mint1.tokenId,
            contractPrincipal(deployer),
            trader2.address,
            mint1.nftAsset,
            mint1.nftAssetId
        )
        // >> CHECK STX TRANSFER TO TRADER 1
        confirmtrader2.events.expectSTXTransferEvent(
            10000,
            contractPrincipal(deployer),
            trader1.address,
        )

        const trader1Receipt2 = swapShop.submitTrade(trader1)
        trader1Receipt2.result.expectErr().expectUint(102)
    }
})

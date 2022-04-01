
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { PrivateSale, ListingResponse } from '../model/swap-shop-tests-private-sale-v1.ts';
import * as Utils from '../model/swap-shop-tests-utils.ts';

//  C O N S T A N T S
const contractName = 'private-sale-v1';
const defaultNftAssetContract = 'sip009-nft';
const contractPrincipal = (deployer: Account) => `${deployer.address}.${contractName}`;


Clarinet.test({
    name: "create-listing",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> MINT >>>>>>
        const adminEeceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminEeceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);
        
        //>>>>> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: tokenId, price: listPrice})
        receipt.result.expectOk().expectUint(tokenId)
        const listingId = receipt.result.expectOk().expectUint(1)
        console.log(receipt)

        //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 5)

        //>>>>> CHECK EVENTS >>>>>>
        Utils.assertNftTransfer(receipt.events[0], nftAsset, tokenId, seller.address, contractPrincipal(deployer))
    },
});

Clarinet.test({
    name: "list-nft-multiple",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)
        let privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> MINT >>>>>>
        const adminEeceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminEeceipt.result.expectOk().expectBool(true)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const mintDetails1 = Utils.mintNft(minter)
        const mintDetails2 = Utils.mintNft(minter)

        assertEquals(mintDetails1.tokenId, '1', "mint should have an id of 1")
        assertEquals(mintDetails2.tokenId, '2', "mint should have an id of 2")
        
        //>>>>> LIST >>>>>> 1
        const receipt = privateSale.createListing(seller, mintDetails1.nftAsset, {buyer: buyer.address, expiry: 5, nftId: mintDetails1.tokenId, price: listPrice})
        receipt.result.expectOk().expectUint(mintDetails1.tokenId)
        const listingId = receipt.result.expectOk().expectUint(1)

        //>>>>> CHECK LISTING >>>>>> 1
        checkListingResponse(chain, deployer, listingId, seller.address, mintDetails1.nftAsset, mintDetails1.tokenId, buyer.address, listPrice, 5)
        //>>>>> CHECK EVENTS >>>>>>
        Utils.assertNftTransfer(receipt.events[0], mintDetails1.nftAsset, mintDetails1.tokenId, seller.address, contractPrincipal(deployer))


        //>>>>> LIST >>>>>> 2
        const receipt2 = privateSale.createListing(seller, mintDetails2.nftAsset, {buyer: buyer.address, expiry: 10, nftId: mintDetails2.tokenId, price: listPrice})
        receipt2.result.expectOk().expectUint(mintDetails2.tokenId)
        const listingId2 = receipt2.result.expectOk().expectUint(2)

        //>>>>> CHECK LISTING >>>>>> 2
        checkListingResponse(chain, deployer, listingId2, seller.address, mintDetails2.nftAsset, mintDetails2.tokenId, buyer.address, listPrice, 10)
        //>>>>> CHECK EVENTS >>>>>>
        Utils.assertNftTransfer(receipt2.events[0], mintDetails2.nftAsset, mintDetails2.tokenId, seller.address, contractPrincipal(deployer))
    },
});

Clarinet.test({
    name: "list-nft-not-whitelisted",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)
        const privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, nftAssetId, tokenId } = Utils.mintNft(minter)

        //>>>>> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: tokenId, price: listPrice})
        receipt.result.expectErr().expectUint(1004)

    },
});

Clarinet.test({
    name: "list-nft-invalid-nft-id",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        const privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> MINT >>>>>>
        const adminReceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminReceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, nftAssetId, tokenId } = Utils.mintNft(minter);
        
        //>>>>> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: 0, price: listPrice})
        receipt.result.expectErr().expectUint(1000)
    },
});

Clarinet.test({
    name: "list-nft-invalid-nft-id",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)
        const privateSale = new PrivateSale(chain, deployer)
        let listPrice = 0

        //>>>>> MINT >>>>>>
        const adminReceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminReceipt.result.expectOk().expectBool(true)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, nftAssetId, tokenId } = Utils.mintNft(minter)

        //>>>>> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: tokenId, price: listPrice})
        receipt.result.expectErr().expectUint(1005)
    },
});

Clarinet.test({
    name: "list-nft-listing-expiry-in-past",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)
        const privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> MINT >>>>>>
        const adminReceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminReceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, nftAssetId, tokenId } = Utils.mintNft(minter)

        chain.mineEmptyBlock(10)

        //>>>>> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: tokenId, price: listPrice})
        receipt.result.expectErr().expectUint(1006)
    },
});

Clarinet.test({
    name: "list-nft-not-found",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        const privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> WHITELIST >>>>>>
        const adminReceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminReceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, nftAssetId, tokenId } = Utils.mintNft(minter)

        //>>>>> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: 10, price: listPrice})
        receipt.result.expectErr().expectUint(1002)
    },
});

Clarinet.test({
    name: "list-nft-not-owned-by-seller",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        const privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> WHITELIST >>>>>>
        const adminReceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminReceipt.result.expectOk().expectBool(true);      

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: deployer, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);
        
        //>>>>> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: tokenId, price: listPrice})
        receipt.result.expectErr().expectUint(1001)
    },
});

Clarinet.test({
    name: "unlist-nft",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> WHITELIST >>>>>>
        const adminEeceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminEeceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);
        
        //>>>>> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: tokenId, price: listPrice})
        const listingId = receipt.result.expectOk().expectUint(1)

        //>>>>> CHECK EVENTS >>>>>>
        Utils.assertNftTransfer(receipt.events[0], nftAsset, tokenId, seller.address, contractPrincipal(deployer))

        //>>>>> UNLIST >>>>>>
        const unlistreceipt = privateSale.unlist(seller, nftAsset, listingId)
        unlistreceipt.result.expectOk().expectBool(true)

        //>>>>> CHECK EVENTS >>>>>>
        console.log(unlistreceipt.events)
        Utils.assertNftTransfer(unlistreceipt.events[1], nftAsset, tokenId, contractPrincipal(deployer), seller.address)

        //>>>>> CHECK NO LISTING >>>>>>
        const listingReadReceipt = chain.callReadOnlyFn(contractName, 'get-listing', [types.uint(listingId)], deployer.address);
        listingReadReceipt.result.expectErr().expectUint(1007)
        
    },
});

Clarinet.test({
    name: "unlist-nft-not-owner-who-listed",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> WHITELIST >>>>>>
        const adminEeceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminEeceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);
        
        //>>>>> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: tokenId, price: listPrice})
        const listingId = receipt.result.expectOk().expectUint(1)

        //>>>>> CHECK EVENTS >>>>>>
        Utils.assertNftTransfer(receipt.events[0], nftAsset, tokenId, seller.address, contractPrincipal(deployer))

        //>>>>> UNLIST >>>>>>
        const unlistreceipt = privateSale.unlist(buyer, nftAsset, listingId)
        unlistreceipt.result.expectErr().expectUint(1001)

        //>>>>> CHECK EVENTS >>>>>>
        assertEquals(unlistreceipt.events.length, 0, "should be no events")

        // //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 5)
    },
});

Clarinet.test({
    name: "unlist-nft-no-listing",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);

        //>>>>> UNLIST >>>>>>
        const unlistreceipt = privateSale.unlist(seller, nftAsset, 11)
        unlistreceipt.result.expectErr().expectUint(1007)
        assertEquals(unlistreceipt.events.length, 0, "should be no events")
    },
});

Clarinet.test({
    name: "purchase",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> MINT >>>>>>
        const adminEeceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminEeceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, nftAssetId, tokenId } = Utils.mintNft(minter);
        
        //>>>>> [SELLER] -> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 20, nftId: tokenId, price: listPrice})
        receipt.result.expectOk().expectUint(tokenId)
        const listingId = receipt.result.expectOk().expectUint(1)
        console.log("listingId: " + listingId)

        //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 20)

        //>>>>> [BUYER] -> PURCHASE >>>>>>
        const purchaseReceipt = privateSale.purchase(buyer, nftAsset, listingId)
        purchaseReceipt.result.expectOk().expectBool(true)

        //>>>>> CHECK EVENTS >>>>>>
        Utils.assertNftTransfer(purchaseReceipt.events[0], nftAsset, tokenId, contractPrincipal(deployer), buyer.address)
        purchaseReceipt.events.expectSTXTransferEvent(listPrice, buyer.address, seller.address);
    },
});

Clarinet.test({
    name: "confirm-sale-not-owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> MINT >>>>>>
        const adminEeceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminEeceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);
        
        //>>>>> [SELLER] -> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 20, nftId: tokenId, price: listPrice})
        receipt.result.expectOk().expectUint(tokenId)
        const listingId = receipt.result.expectOk().expectUint(1)

        //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 20)

        //>>>>> [BUYER] -> PURCHASE >>>>>>
        const purchaseReceipt = privateSale.purchase(seller, nftAsset, listingId)
        purchaseReceipt.result.expectErr().expectUint(1001)

        //>>>>> CHECK EVENTS >>>>>>
        assertEquals(purchaseReceipt.events.length, 0, "should be no events")
    },
});

Clarinet.test({
    name: "confirm-sale-expired",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> MINT >>>>>>
        const adminEeceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminEeceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);
        
        //>>>>> [SELLER] -> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 20, nftId: tokenId, price: listPrice})
        receipt.result.expectOk().expectUint(tokenId)
        const listingId = receipt.result.expectOk().expectUint(1)
        console.log("listingId: " + listingId)

        //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 20)

        chain.mineEmptyBlock(30)

        //>>>>> [BUYER] -> PURCHASE >>>>>>
        const purchaseReceipt = privateSale.purchase(buyer, nftAsset, listingId)
        purchaseReceipt.result.expectErr().expectUint(1010)

        //>>>>> CHECK EVENTS >>>>>>
        assertEquals(purchaseReceipt.events.length, 0, "should be no events")
    },
});

Clarinet.test({
    name: "confirm-sale-wrong-nft-asset",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)
        let listPrice = 1000000

        //>>>>> MINT >>>>>>
        const adminEeceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminEeceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);
        
        //>>>>> [SELLER] -> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 20, nftId: tokenId, price: listPrice})
        receipt.result.expectOk().expectUint(tokenId)
        const listingId = receipt.result.expectOk().expectUint(1)
        console.log("listingId: " + listingId)

        //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 20)

        //>>>>> [BUYER] -> PURCHASE >>>>>>
        const purchaseReceipt = privateSale.purchase(buyer, Utils.qualifiedName('its-a-rug'), listingId)
        if(purchaseReceipt === undefined) {
            assertEquals(true, true, 'confirmReceipt was was undefined as Runtime error thrown from contract')
        }
    },
});


function checkListingResponse(
        chain: Chain, user: Account, listingId: number,
        owner: string, nftContract: string, nftId: number, buyer: string, price: number, expiry: number) {

        const listingReadReceipt = chain.callReadOnlyFn(contractName, 'get-listing', [types.uint(listingId)], user.address);
        const ldr = listingReadReceipt.result.expectOk().expectTuple() as ListingResponse

        ldr.owner.expectPrincipal(owner)
        ldr.nftContract.expectPrincipal(nftContract)
        ldr.nftId.expectUint(nftId)
        ldr.buyer.expectPrincipal(buyer)
        ldr.price.expectUint(price)
        ldr.expiry.expectUint(expiry)
}




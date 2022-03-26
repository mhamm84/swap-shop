
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { PrivateSale, ListingResponse,  createListingDetails } from '../model/swap-shop-tests-private-sale-v1.ts';
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

        //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 5, false)
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
        checkListingResponse(chain, deployer, listingId, seller.address, mintDetails1.nftAsset, mintDetails1.tokenId, buyer.address, listPrice, 5, false)

        //>>>>> LIST >>>>>> 2
        const receipt2 = privateSale.createListing(seller, mintDetails2.nftAsset, {buyer: buyer.address, expiry: 10, nftId: mintDetails2.tokenId, price: listPrice})
        receipt2.result.expectOk().expectUint(mintDetails2.tokenId)
        const listingId2 = receipt2.result.expectOk().expectUint(2)

        //>>>>> CHECK LISTING >>>>>> 2
        checkListingResponse(chain, deployer, listingId2, seller.address, mintDetails2.nftAsset, mintDetails2.tokenId, buyer.address, listPrice, 10, false)
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

        //>>>>> LIST >>>>>>
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 1, nftId: tokenId, price: listPrice})
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

        //>>>>> UNLIST >>>>>>
        const unlistreceipt = privateSale.unlist(seller, listingId)
        unlistreceipt.result.expectOk().expectBool(true)

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

        //>>>>> UNLIST >>>>>>
        const unlistreceipt = privateSale.unlist(buyer, listingId)
        unlistreceipt.result.expectErr().expectUint(1001)

        // //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 5, false)
    },
});

Clarinet.test({
    name: "unlist-nft-no-listing",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)

        //>>>>> UNLIST >>>>>>
        const unlistreceipt = privateSale.unlist(seller, 11)
        unlistreceipt.result.expectErr().expectUint(1007)
    },
});

Clarinet.test({
    name: "accept-listing-terms",
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
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: tokenId, price: listPrice})
        receipt.result.expectOk().expectUint(tokenId)
        const listingId = receipt.result.expectOk().expectUint(1)
        console.log("listingId: " + listingId)

        //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 5, false)

        //>>>>> [BUYER] -> ACCEPT TERMS >>>>>>
        const acceptReceipt = privateSale.acceptListingTerms(buyer, listingId)
        console.log(acceptReceipt.result)
        acceptReceipt.result.expectOk().expectBool(true)

    },
});

Clarinet.test({
    name: "accept-listing-terms-no-listing",
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
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: tokenId, price: listPrice})
        receipt.result.expectOk().expectUint(tokenId)
        const listingId = receipt.result.expectOk().expectUint(1)
        console.log("listingId: " + listingId)

        //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 5, false)

        //>>>>> [BUYER] -> ACCEPT TERMS >>>>>>
        const acceptReceipt = privateSale.acceptListingTerms(buyer, 101)
        console.log(acceptReceipt.result)
        acceptReceipt.result.expectErr().expectUint(1007)

    },
});

Clarinet.test({
    name: "accept-listing-terms-not-buyer",
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
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: tokenId, price: listPrice})
        receipt.result.expectOk().expectUint(tokenId)
        const listingId = receipt.result.expectOk().expectUint(1)
        console.log("listingId: " + listingId)

        //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 5, false)

        //>>>>> [BUYER] -> ACCEPT TERMS >>>>>>
        const acceptReceipt = privateSale.acceptListingTerms(seller, listingId)
        console.log(acceptReceipt.result)
        acceptReceipt.result.expectErr().expectUint(1012)

    },
});

Clarinet.test({
    name: "accept-listing-expired",
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
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 5, nftId: tokenId, price: listPrice})
        receipt.result.expectOk().expectUint(tokenId)
        const listingId = receipt.result.expectOk().expectUint(1)
        console.log("listingId: " + listingId)

        //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 5, false)

        chain.mineEmptyBlock(10)

        //>>>>> [BUYER] -> ACCEPT TERMS >>>>>>
        const acceptReceipt = privateSale.acceptListingTerms(buyer, listingId)
        console.log(acceptReceipt.result)
        acceptReceipt.result.expectErr().expectUint(1010)

    },
});

Clarinet.test({
    name: "accept-listing-already-accepted",
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
        const receipt = privateSale.createListing(seller, nftAsset, {buyer: buyer.address, expiry: 10, nftId: tokenId, price: listPrice})
        receipt.result.expectOk().expectUint(tokenId)
        const listingId = receipt.result.expectOk().expectUint(1)

        //>>>>> CHECK LISTING >>>>>>
        checkListingResponse(chain, deployer, listingId, seller.address, nftAsset, tokenId, buyer.address, listPrice, 10, false)

        //>>>>> [BUYER] -> ACCEPT TERMS >>>>>>
        const acceptReceipt = privateSale.acceptListingTerms(buyer, listingId)
        acceptReceipt.result.expectOk().expectBool(true)

        //>>>>> [BUYER] -> ACCEPT TERMS AGAIN >>>>>>
        const acceptReceipt2 = privateSale.acceptListingTerms(buyer, listingId)
        acceptReceipt2.result.expectErr().expectUint(1013)

    },
});

function checkListingResponse(
        chain: Chain, user: Account, listingId: number,
        owner: string, nftContract: string, nftId: number, buyer: string, price: number, expiry: number, accepted: boolean) {

        const listingReadReceipt = chain.callReadOnlyFn(contractName, 'get-listing', [types.uint(listingId)], user.address);
        const ldr = listingReadReceipt.result.expectOk().expectTuple() as ListingResponse

        ldr.owner.expectPrincipal(owner)
        ldr.nftContract.expectPrincipal(nftContract)
        ldr.nftId.expectUint(nftId)
        ldr.buyer.expectPrincipal(buyer)
        ldr.price.expectUint(price)
        ldr.expiry.expectUint(expiry)
        ldr.accepted.expectBool(accepted)
}




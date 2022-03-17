
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { PrivateSale, Listing, createListingDetails } from '../model/swap-shop-tests-private-sale-v1.ts';
import * as Utils from '../model/swap-shop-tests-utils.ts';

//  C O N S T A N T S
const contractName = 'private-sale-v1';
const defaultNftAssetContract = 'sip009-nft';
const contractPrincipal = (deployer: Account) => `${deployer.address}.${contractName}`;

Clarinet.test({
    name: "list-nft",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)

        //>>>>> MINT >>>>>>
        const adminEeceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminEeceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);
        
        //>>>>> LIST >>>>>>
        const listingDetails = createListingDetails({buyer: buyer.address, listingExpiry: 5, nftId: tokenId, price: 1000000})
        const receipt = privateSale.listNft(seller, nftAsset, listingDetails)
        receipt.result.expectOk().expectUint(tokenId)
        const listingId = receipt.result.expectOk()

        //>>>>> CHECK LISTING >>>>>>
        const listingReadReceipt = chain.callReadOnlyFn(contractName, 'get-listing', [listingId], deployer.address);
        const ldr: { [key: string]: string } = listingReadReceipt.result.expectOk().expectTuple() as any;
		ldr['owner'].expectPrincipal(seller.address);
		ldr['nft-contract'].expectPrincipal(nftAsset);
		ldr['nft-id'].expectUint(tokenId);
		ldr['buyer'].expectPrincipal(buyer.address);
		ldr['price'].expectUint(1000000);
		ldr['expiry'].expectUint(5);
    },
});

Clarinet.test({
    name: "list-nft-multiple",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)
        let privateSale = new PrivateSale(chain, deployer)

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
        const listingDetails = createListingDetails({buyer: buyer.address, listingExpiry: 5, nftId: mintDetails1.tokenId, price: 1000000})
        const receipt = privateSale.listNft(seller, mintDetails1.nftAsset, listingDetails)
        receipt.result.expectOk().expectUint(mintDetails1.tokenId)
        const listingId = receipt.result.expectOk()

        //>>>>> CHECK LISTING >>>>>> 1
        const listingReadReceipt = chain.callReadOnlyFn(contractName, 'get-listing', [listingId], deployer.address)
        const ldr: { [key: string]: string } = listingReadReceipt.result.expectOk().expectTuple() as any
		ldr['owner'].expectPrincipal(seller.address)
		ldr['nft-contract'].expectPrincipal(mintDetails1.nftAsset)
		ldr['nft-id'].expectUint(mintDetails1.tokenId)
		ldr['buyer'].expectPrincipal(buyer.address)
		ldr['price'].expectUint(1000000)
		ldr['expiry'].expectUint(5)

        //>>>>> LIST >>>>>> 2
        const listingDetails2 = createListingDetails({buyer: buyer.address, listingExpiry: 10, nftId: mintDetails2.tokenId, price: 1000000})
        const receipt2 = privateSale.listNft(seller, mintDetails2.nftAsset, listingDetails2)
        receipt2.result.expectOk().expectUint(mintDetails2.tokenId)
        const listingId2 = receipt2.result.expectOk()

        //>>>>> CHECK LISTING >>>>>> 2
        const listingReadReceipt2 = chain.callReadOnlyFn(contractName, 'get-listing', [listingId2], deployer.address)
        const ldr2: { [key: string]: string } = listingReadReceipt2.result.expectOk().expectTuple() as any
		ldr2['owner'].expectPrincipal(seller.address)
		ldr2['nft-contract'].expectPrincipal(mintDetails2.nftAsset)
		ldr2['nft-id'].expectUint(mintDetails2.tokenId)
		ldr2['buyer'].expectPrincipal(buyer.address)
		ldr2['price'].expectUint(1000000)
		ldr2['expiry'].expectUint(10)
    },
});

Clarinet.test({
    name: "list-nft-not-whitelisted",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)
        const privateSale = new PrivateSale(chain, deployer)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, nftAssetId, tokenId } = Utils.mintNft(minter)

        //>>>>> LIST >>>>>>
        const listingDetails = createListingDetails({buyer: buyer.address, listingExpiry: 5, nftId: tokenId, price: 1000000})
        const receipt = privateSale.listNft(seller, nftAsset, listingDetails)
        receipt.result.expectErr().expectUint(105)

    },
});

Clarinet.test({
    name: "list-nft-invalid-nft-id",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        const privateSale = new PrivateSale(chain, deployer)

        //>>>>> MINT >>>>>>
        const adminReceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminReceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, nftAssetId, tokenId } = Utils.mintNft(minter);
        
        //>>>>> LIST >>>>>>
        const listingDetails = createListingDetails({buyer: buyer.address, listingExpiry: 5, nftId: 0, price: 1000000})
        const receipt = privateSale.listNft(seller, nftAsset, listingDetails)
        receipt.result.expectErr().expectUint(101)

    },
});

Clarinet.test({
    name: "list-nft-invalid-nft-id",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)
        const privateSale = new PrivateSale(chain, deployer)

        //>>>>> MINT >>>>>>
        const adminReceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminReceipt.result.expectOk().expectBool(true)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, nftAssetId, tokenId } = Utils.mintNft(minter)

        //>>>>> LIST >>>>>>
        const listingDetails = createListingDetails({buyer: buyer.address, listingExpiry: 5, nftId: tokenId, price: 0})
        const receipt = privateSale.listNft(seller, nftAsset, listingDetails)
        receipt.result.expectErr().expectUint(106)

    },
});

Clarinet.test({
    name: "list-nft-listing-expiry-in-past",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)
        const privateSale = new PrivateSale(chain, deployer)

        //>>>>> MINT >>>>>>
        const adminReceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminReceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, nftAssetId, tokenId } = Utils.mintNft(minter)

        //>>>>> LIST >>>>>>
        const listingDetails = createListingDetails({buyer: buyer.address, listingExpiry: 1, nftId: tokenId, price: 1000000})
        const receipt = privateSale.listNft(seller, nftAsset, listingDetails)
        receipt.result.expectErr().expectUint(107)

    },
});

Clarinet.test({
    name: "list-nft-not-found",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        const privateSale = new PrivateSale(chain, deployer)

        //>>>>> WHITELIST >>>>>>
        const adminReceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminReceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, nftAssetId, tokenId } = Utils.mintNft(minter)

        //>>>>> LIST >>>>>>
        const listingDetails = createListingDetails({buyer: buyer.address, listingExpiry: 5, nftId: 10, price: 1000000})
        const receipt = privateSale.listNft(seller, nftAsset, listingDetails)
        receipt.result.expectErr().expectUint(103)

    },
});

Clarinet.test({
    name: "list-nft-not-owned-by-seller",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        const privateSale = new PrivateSale(chain, deployer)

        //>>>>> WHITELIST >>>>>>
        const adminReceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminReceipt.result.expectOk().expectBool(true);      

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: deployer, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);
        
        //>>>>> LIST >>>>>>
        const listingDetails = createListingDetails({buyer: buyer.address, listingExpiry: 5, nftId: tokenId, price: 1000000})
        const receipt = privateSale.listNft(seller, nftAsset, listingDetails)
        receipt.result.expectErr().expectUint(102)
    },
});

Clarinet.test({
    name: "unlist-nft",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)

        //>>>>> WHITELIST >>>>>>
        const adminEeceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminEeceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);
        
        //>>>>> LIST >>>>>>
        const listingDetails = createListingDetails({buyer: buyer.address, listingExpiry: 5, nftId: tokenId, price: 1000000})
        const receipt = privateSale.listNft(seller, nftAsset, listingDetails)
        const listingId = receipt.result.expectOk().expectUint(1)

        //>>>>> UNLIST >>>>>>
        const unlistreceipt = privateSale.unlistNft(seller, listingId)
        unlistreceipt.result.expectOk().expectBool(true)

        //>>>>> CHECK NO LISTING >>>>>>
        const listingReadReceipt = chain.callReadOnlyFn(contractName, 'get-listing', [types.uint(listingId)], deployer.address);
        listingReadReceipt.result.expectErr().expectUint(108)
        
    },
});

Clarinet.test({
    name: "unlist-nft-not-owner-who-listed",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)

        //>>>>> WHITELIST >>>>>>
        const adminEeceipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        adminEeceipt.result.expectOk().expectBool(true);    

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: seller, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter);
        
        //>>>>> LIST >>>>>>
        const listingDetails = createListingDetails({buyer: buyer.address, listingExpiry: 5, nftId: tokenId, price: 1000000})
        const receipt = privateSale.listNft(seller, nftAsset, listingDetails)
        const listingId = receipt.result.expectOk().expectUint(1)
        let listingReadReceipt1 = chain.callReadOnlyFn(contractName, 'get-listing', [types.uint(listingId)], deployer.address);

        //>>>>> UNLIST >>>>>>
        const unlistreceipt = privateSale.unlistNft(buyer, listingId)
        unlistreceipt.result.expectErr().expectUint(102)

        //>>>>> CHECK LISTING >>>>>>
        const listingReadReceipt = chain.callReadOnlyFn(contractName, 'get-listing', [types.uint(listingId)], deployer.address);
        const ldr: { [key: string]: string } = listingReadReceipt.result.expectOk().expectTuple() as any;
		ldr['owner'].expectPrincipal(seller.address);
		ldr['nft-contract'].expectPrincipal(nftAsset);
		ldr['nft-id'].expectUint(tokenId);
		ldr['buyer'].expectPrincipal(buyer.address);
		ldr['price'].expectUint(1000000);
		ldr['expiry'].expectUint(5);
        
    },
});

Clarinet.test({
    name: "unlist-nft-no-listing",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)

        //>>>>> UNLIST >>>>>>
        const unlistreceipt = privateSale.unlistNft(seller, 11)
        unlistreceipt.result.expectErr().expectUint(108)
    },
});




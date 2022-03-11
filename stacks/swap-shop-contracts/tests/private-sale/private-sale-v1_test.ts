
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { PrivateSale, Listing, createListing } from '../model/swap-shop-tests-private-sale-v1.ts';
import * as Utils from '../model/swap-shop-tests-utils.ts';

//  C O N S T A N T S
const contractName = 'private-sale-v1';
const defaultNftAssetContract = 'sip009-nft';
const contractPrincipal = (deployer: Account) => `${deployer.address}.${contractName}`;

Clarinet.test({
    name: "list-nft",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, maker, buyer] = ['deployer', 'wallet_1', 'wallet_1'].map(name => accounts.get(name)!);
        let privateSale = new PrivateSale(chain, deployer)

        // white list the NFT asset
        let receipt = privateSale.adminAddNftAssetToWhitelist(deployer, defaultNftAssetContract)
        receipt.result.expectOk().expectBool(true);    

        // Mint an NFT
        const minter = {
            chain: chain,
            deployer: deployer,
            recipient: maker,
            nftAssetContract: defaultNftAssetContract,
        }
		const { nftAssetContract, nftAssetId, tokenId } = Utils.mintNft(minter);
        console.log(`Minted -> nftContract: ${nftAssetContract} nftAssetId: ${nftAssetId} tokenId: ${tokenId}`)

        // Create a listing
        const listing = createListing(
            {
                buyer: buyer.address,
                listingExpiry: 5,
                nftId: tokenId,
                price: 1000000,
            }
        )
        const block = chain.mineBlock([
            Tx.contractCall(contractName, 'list-nft', [ 
                    types.principal(nftAssetContract),
                    listing
                ], maker.address)
        ]);
        console.log(block)
        console.log(block.receipts[0])
        block.receipts[0].result.expectOk()

    },
});



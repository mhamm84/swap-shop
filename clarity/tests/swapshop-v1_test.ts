
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.34.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import * as Utils from  './util/swapshop-tests-utils.ts';
import { SwapShop } from './model/swapshop-v1-model.ts';

const defaultNftAssetContract = "sip009-test"


Clarinet.test({
    name: "mint",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, seller, buyer] = ['deployer', 'wallet_1', 'wallet_2'].map(name => accounts.get(name)!)

        let swapShop = new SwapShop(chain, deployer)

        //>>>>> MINT >>>>>>
        const minter = {chain: chain, deployer: deployer, recipient: deployer, nftAsset: defaultNftAssetContract}
		const { nftAsset, tokenId } = Utils.mintNft(minter)
        console.log("nft create - id: " + tokenId)

        const receipt = swapShop.submitDeal(deployer)
        receipt.result.expectOk()
     }

})

Clarinet.test({
    name: "Ensure that <...>",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let block = chain.mineBlock([
            /* 
             * Add transactions with: 
             * Tx.contractCall(...)
            */
        ]);
        assertEquals(block.receipts.length, 0);
        assertEquals(block.height, 2);

        block = chain.mineBlock([
            /* 
             * Add transactions with: 
             * Tx.contractCall(...)
            */
        ]);
        assertEquals(block.receipts.length, 0);
        assertEquals(block.height, 3);
    },
});

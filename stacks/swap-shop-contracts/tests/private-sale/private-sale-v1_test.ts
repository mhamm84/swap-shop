
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { PrivateSale } from '../model/swap-shop-tests-private-sale-v1.ts';
import { Sip009NftTransferEvent } from '../model/swap-shop-tests-utils.ts';

//  C O N S T A N T S
const contractName = 'private-sale-v1';
const defaultNftAssetContract = 'sip009-nft';
const contractPrincipal = (deployer: Account) => `${deployer.address}.${contractName}`;


function mintNft(
    { chain, deployer, recipient, nftAssetContract = defaultNftAssetContract }: 
    { chain: Chain, deployer: Account, recipient: Account, nftAssetContract?: string }) {

    const block = chain.mineBlock([
        Tx.contractCall(nftAssetContract, 'mint', [types.principal(recipient.address)], deployer.address),
    ]);

    block.receipts[0].result.expectOk();
    const nftMintEvent = block.receipts[0].events[0].nft_mint_event;
    const [nftAssetContractPrincipal, nftAssetId] = nftMintEvent.asset_identifier.split('::');

    return { nftAssetContract: nftAssetContractPrincipal, nftAssetId, tokenId: nftMintEvent.value.substr(1), block };
}

Clarinet.test({
    name: "Tester",
    async fn(chain: Chain, accounts: Map<string, Account>) {

        const [deployer, maker] = ['deployer', 'wallet_1'].map(name => accounts.get(name)!);
		const { nftAssetContract, nftAssetId, tokenId } = mintNft({ chain, deployer, recipient: maker });
        console.log("mintNft....")
        console.log(`nftContract: ${nftAssetContract} nftAssetId: ${nftAssetId} tokenId: ${tokenId}`)

    },
});

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

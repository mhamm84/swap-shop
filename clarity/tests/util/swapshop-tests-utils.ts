import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.34.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

export interface NftMinter {
    chain: Chain,
    deployer: Account,
    recipient: Account,
    nftAsset: string,
}

export const mintNft = (minter: NftMinter) => {
    const block = minter.chain.mineBlock([
        Tx.contractCall(minter.nftAsset, 'mint', [types.principal(minter.recipient.address)], minter.deployer.address),
    ]);
    block.receipts[0].result.expectOk();
    const nftMintEvent = block.receipts[0].events[0].nft_mint_event;
    const [nftAsset, nftAssetId] = nftMintEvent.asset_identifier.split('::');
    return { nftAsset: nftAsset, nftAssetId: nftAssetId, tokenId: nftMintEvent.value.substr(1), block }
}


/**
 * [
        {
            type: "nft_transfer_event",
            nft_transfer_event: {
            asset_identifier: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-test::swapshop-test-nft",
            sender: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
            recipient: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.swapshop-v1",
            value: "u1"
            }
        }
    ]
 */
export interface Sip009NftTransferEvent {
	type: string,
	nft_transfer_event: {
		asset_identifier: string,
		sender: string,
		recipient: string,
		value: string
	}
}

export function assertNftTransfer(event: Sip009NftTransferEvent, nftAssetContract: string, tokenId: number, sender: string, recipient: string) {
	assertEquals(typeof event, 'object');
	assertEquals(event.type, 'nft_transfer_event');
	assertEquals(event.nft_transfer_event.asset_identifier.substr(0, nftAssetContract.length), nftAssetContract);
	event.nft_transfer_event.sender.expectPrincipal(sender);
	event.nft_transfer_event.recipient.expectPrincipal(recipient);
	event.nft_transfer_event.value.expectUint(tokenId);
}
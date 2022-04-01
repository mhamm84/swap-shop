import {
    Account,
    Chain,
    Tx,
    types,
  } from "https://deno.land/x/clarinet@v0.14.0/index.ts";

import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

// Get full qualified name based on contract name
export function qualifiedName(contractName: string) {
    return "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM." + contractName;
}

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
    console.log("event.nft_transfer_event.asset_identifier:" + event.nft_transfer_event.asset_identifier)
    console.log("nftAssetContract: " + nftAssetContract)
	assertEquals(event.nft_transfer_event.asset_identifier.substr(0, nftAssetContract.length), nftAssetContract);
	event.nft_transfer_event.sender.expectPrincipal(sender);
	event.nft_transfer_event.recipient.expectPrincipal(recipient);
	event.nft_transfer_event.value.expectUint(tokenId);
}


// EXAMPLE RESPONSE
// {
//     asset_identifier: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-nft::swap-nft",
//     recipient: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
//     value: "u1"
//   }
//   {
//     result: "(ok u1)",
//     events: [
//       {
//         type: "nft_transfer_event",
//         nft_transfer_event: {
//           asset_identifier: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-nft::swap-nft",
//           sender: "ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
//           recipient: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.private-sale-v1",
//           value: "u1"
//         }
//       }
//     ]
//   }
  
  


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
    console.log(nftMintEvent)
    const [nftAsset, nftAssetId] = nftMintEvent.asset_identifier.split('::');
    const mintDetails = { nftAsset: nftAsset, nftAssetId: nftAssetId, tokenId: nftMintEvent.value.substr(1), block }
    return mintDetails
}
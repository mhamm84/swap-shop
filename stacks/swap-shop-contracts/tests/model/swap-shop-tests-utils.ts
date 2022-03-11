import {
    Account,
    Chain,
    Tx,
    types,
  } from "https://deno.land/x/clarinet@v0.14.0/index.ts";

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

export interface NftMinter {
    chain: Chain,
    deployer: Account,
    recipient: Account,
    nftAssetContract: string,
}

export const mintNft = (minter: NftMinter) => {
    const block = minter.chain.mineBlock([
        Tx.contractCall(minter.nftAssetContract, 'mint', [types.principal(minter.recipient.address)], minter.deployer.address),
    ]);
    block.receipts[0].result.expectOk();
    const nftMintEvent = block.receipts[0].events[0].nft_mint_event;
    const [nftAssetContractPrincipal, nftAssetId] = nftMintEvent.asset_identifier.split('::');

    return { nftAssetContract: nftAssetContractPrincipal, nftAssetId, tokenId: nftMintEvent.value.substr(1), block };
}
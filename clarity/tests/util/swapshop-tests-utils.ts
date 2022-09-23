import { Clarinet, Tx, Chain, Account, types, TxReceipt } from 'https://deno.land/x/clarinet@v0.34.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { GetInfoResponse } from '../model/swapshop-v1-model.ts';

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
    return { nftAsset: nftAsset, nftAssetId: nftAssetId, tokenId: nftMintEvent.value, block }
}

export const checkTradeInfo = (receipt: TxReceipt, confirmations: number, tradeStatus: number, timelock: number) => {
    const resp = receipt.result.expectOk().expectTuple() as GetInfoResponse
        assertEquals(resp.confirmations, "u"+confirmations, "confimrations expected")
        assertEquals(resp.tradeStatus, "u"+tradeStatus, "trade status expected")
        assertEquals(resp.timelock, "u"+timelock, "time lock expected")
}
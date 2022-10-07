import { Clarinet, Tx, Chain, Account, types, TxReceipt } from 'https://deno.land/x/clarinet@v0.34.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { GetInfoResponse } from '../model/swapshop-v1-model.ts';

export interface NftMinter {
    chain: Chain,
    deployer: Account,
    recipient: Account,
    nftAsset: string,
}

export interface FtMinter {
    chain: Chain,
    deployer: Account,
    recipient: Account,
    ftAsset: string,
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

export const mintFt = (amount: number, minter: FtMinter) => {
    const block = minter.chain.mineBlock([
        Tx.contractCall(minter.ftAsset, 'mint', [types.uint(amount), types.principal(minter.recipient.address)], minter.deployer.address),
    ]);
    block.receipts[0].result.expectOk();
    let [receipt] = block.receipts
    for(var i:number = 0; i<receipt.events.length; i++){
        console.log(receipt.events[i])
    }
    const ftMintEvent = block.receipts[0].events[0].ft_mint_event;
    const [ftAsset, ftAssetId] = ftMintEvent.asset_identifier.split('::');
    return { ftAsset: ftAsset, ftAssetId: ftAssetId, amount: ftMintEvent.amount, block }
}

// {"type":"ft_mint_event","ft_mint_event":{"asset_identifier":"ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE.clarity-coin::clarity-coin","recipient":"ST1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE","amount":"1000"}}


export const checkTradeInfo = (receipt: TxReceipt, confirmations: number, tradeStatus: number, timelock: number) => {
    const resp = receipt.result.expectOk().expectTuple() as GetInfoResponse
        assertEquals(resp.confirmations, "u"+confirmations, "confimrations expected")
        assertEquals(resp.tradeStatus, "u"+tradeStatus, "trade status expected")
        assertEquals(resp.timelock, "u"+timelock, "time lock expected")
}
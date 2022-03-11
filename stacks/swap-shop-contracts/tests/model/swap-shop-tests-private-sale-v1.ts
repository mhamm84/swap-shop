import {
  Account,
  Chain,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";

import * as Utils from './swap-shop-tests-utils.ts';

const contractName = 'private-sale-v1'

// (define-public (list-nft (nft-asset <nft-trait>) (listing-details {nft-id: uint, buyer: principal, price: uint, listing-expiry: uint}))
// (contract-call? .private-sale-v1 list-nft 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-nft {buyer: tx-sender, listing-expiry: u5, nft-id: u1, price: u10000000})

export interface Listing {
  nftId: number,
  buyer: string,
  price: number,
  listingExpiry: number
}

export const createListing = (listing: Listing) =>
  types.tuple({
    'buyer': types.principal(listing.buyer),
    'listing-expiry': types.uint(listing.listingExpiry),
    'nft-id': types.uint(listing.nftId),
    'price': types.uint(listing.price),
  });


export class PrivateSale {

  chain: Chain
  deployer: Account

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain
    this.deployer = deployer
  }

  adminAddNftAssetToWhitelist(user: Account, nftAsset: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, "admin-add-nft-asset-to-whitelist", [
        types.principal(Utils.qualifiedName(nftAsset))
      ], user.address)
    ]);
    let [receipt] = block.receipts
    return receipt;
  }

  isWhitelisted(user: Account, nftAsset: string) {
    return this.chain.callReadOnlyFn(contractName, "is-whitelisted", [
      types.principal(Utils.qualifiedName(nftAsset))
    ], user.address
    );
  }

  adminUpdateNftAssetInWhitelist(user: Account, nftAsset: string, flag: boolean) {
    let nftAssetPrincipal = types.principal(Utils.qualifiedName(nftAsset))
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, "admin-update-nft-asset-in-whitelist", [
        nftAssetPrincipal,
        types.bool(flag)
      ], user.address)
    ]);
    let [receipt] = block.receipts
    return receipt
  }

  //admin-set-contract-owner
  adminSetContractOwner(user: Account, newOwner: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, "admin-set-contract-owner", [
        types.principal(newOwner.address),
      ], user.address)
    ]);
    return block.receipts[0];
  }
  
}
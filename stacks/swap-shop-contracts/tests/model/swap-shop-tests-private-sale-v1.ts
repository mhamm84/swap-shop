import {
  Account,
  Chain,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";

import * as Utils from './swap-shop-tests-utils.ts';

const contractName = 'swap-shop-private-sale-v1'

// (define-public (list-nft (nft-asset <nft-trait>) (listing-details {nft-id: uint, buyer: principal, price: uint, listing-expiry: uint}))
// (contract-call? .swap-shop-private-sale-v1 list-nft 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sip009-nft {buyer: tx-sender, listing-expiry: u5, nft-id: u1, price: u10000000})

export type ListingDetails = {
  nftId: number,
  buyer: string,
  price: number,
  expiry: number
}

export type ListingResponse = {
  owner: string,
  buyer: string,
  nftId: string,
  price: string,
  expiry: string,
  nftContract: string,
  accepted: string
}

export const createListingDetails = (listing: ListingDetails) =>
  types.tuple({
    'buyer': types.principal(listing.buyer),
    'expiry': types.uint(listing.expiry),
    'nftId': types.uint(listing.nftId),
    'price': types.uint(listing.price),
  })


export class PrivateSale {

  chain: Chain
  deployer: Account

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain
    this.deployer = deployer
  }

  createListing(seller: Account, nftAsset: string, commission: string, listingDetails: any) {

    let listing = createListingDetails(listingDetails)
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, 'create-listing', [ 
              types.principal(nftAsset),
              types.principal(Utils.qualifiedName(commission)),
              listing
          ], seller.address)
    ]);
    let [receipt] = block.receipts
    return receipt
  }

  purchase(buyer: Account, nftAsset: string, commission: string, nftId: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, 'purchase', [
        types.principal(nftAsset),
        types.principal(Utils.qualifiedName(commission)),
        types.uint(nftId)
      ], buyer.address)
    ])
    let [receipt] = block.receipts
    return receipt
  }

  unlist(seller: Account, nftAsset: string, nftId: number) {
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, 'unlist', [
        types.principal(nftAsset),
        types.uint(nftId)
      ], seller.address)
    ])
    let [receipt] = block.receipts
    return receipt
  }

  adminAddCommission(user: Account, commission: string, enabled: boolean) {
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, 'admin-add-commission', [
        types.principal(Utils.qualifiedName(commission)),
        types.bool(enabled)
      ], user.address)
    ])
    let [receipt] = block.receipts
    return receipt
  }

  isCommissionEnabled(user: Account, commission: string) {
    return this.chain.callReadOnlyFn(contractName, "is-commission-enabled", [
      types.principal(Utils.qualifiedName(commission))
    ], user.address)
  }

  adminAddToWhitelist(user: Account, nftAsset: string) {
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, "admin-add-nft-asset-to-whitelist", [
        types.principal(Utils.qualifiedName(nftAsset))
      ], user.address)
    ])
    let [receipt] = block.receipts
    return receipt
  }

  isWhitelisted(user: Account, nftAsset: string) {
    return this.chain.callReadOnlyFn(contractName, "is-whitelisted", [
      types.principal(Utils.qualifiedName(nftAsset))
    ], user.address)
  }

  adminUpdateInWhitelist(user: Account, nftAsset: string, flag: boolean) {
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, "admin-update-nft-asset-in-whitelist", [
        types.principal(Utils.qualifiedName(nftAsset)),
        types.bool(flag)
      ], user.address)
    ])
    let [receipt] = block.receipts
    return receipt
  }

  //admin-set-contract-owner
  adminSetContractOwner(user: Account, newOwner: Account) {
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, "admin-set-contract-owner", [
        types.principal(newOwner.address),
      ], user.address)
    ])
    return block.receipts[0]
  }
  
}
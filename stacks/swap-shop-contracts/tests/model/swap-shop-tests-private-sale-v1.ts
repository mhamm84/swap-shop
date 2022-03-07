import {
  Account,
  Chain,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";

import * as Utils from './swap-shop-tests-utils.ts';

const contractName = 'private-sale-v1'

class PrivateSale {

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

  adminCheckNftAssetWhitelisted(user: Account, nftAsset: string) {
    return this.chain.callReadOnlyFn(contractName, "admin-check-nft-asset-whitelisted", [
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

export { PrivateSale };
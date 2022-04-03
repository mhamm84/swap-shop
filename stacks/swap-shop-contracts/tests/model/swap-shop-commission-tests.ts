import {
  Account,
  Chain,
  Tx,
  types,
} from "https://deno.land/x/clarinet@v0.14.0/index.ts";

import * as Utils from './swap-shop-tests-utils.ts';

const contractName = 'swap-shop-commission'

export class Commission {

  chain: Chain
  deployer: Account

  constructor(chain: Chain, deployer: Account) {
    this.chain = chain
    this.deployer = deployer
  }

  changeRecipient(deployer:Account, recipient : string) {
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, 'change-recipient',[
        types.principal(recipient),
      ], deployer.address)
    ])
    let [receipt] = block.receipts
    return receipt;
  }

  changeCommission(deployer:Account, newCommissionSlice : number) {
    let block = this.chain.mineBlock([
      Tx.contractCall(contractName, 'change-commission',[
        types.uint(newCommissionSlice),
      ], deployer.address)
    ])
    let [receipt] = block.receipts
    return receipt;
  }

}
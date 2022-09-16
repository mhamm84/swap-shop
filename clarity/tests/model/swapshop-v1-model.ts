import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.31.0/index.ts';

const contractName = 'swapshop-v1'

export class SwapShop {

    chain: Chain
    deployer: Account

    constructor(chain: Chain, deployer: Account) {
        this.chain = chain
        this.deployer = deployer
    }

    submitDeal(sender: Account) {
        let block = this.chain.mineBlock([
            Tx.contractCall(contractName, 'submit-deal', [], sender.address)
        ])
        let [receipt] = block.receipts
        return receipt
    }

}
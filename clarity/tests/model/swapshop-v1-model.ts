import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.34.0/index.ts';

const contractName = 'swapshop-v1'

export class SwapShop {

    chain: Chain
    deployer: Account
    logEvents: boolean

    constructor(chain: Chain, deployer: Account, logEvents: boolean) {
        this.chain = chain
        this.deployer = deployer
        this.logEvents = logEvents
    }

    submitDeal(sender: Account) {
        let block = this.chain.mineBlock([
            Tx.contractCall(contractName, 'submit-deal', [], sender.address)
        ])
        let [receipt] = block.receipts

        if(this.logEvents) {
            for(var i:number = 0; i<receipt.events.length; i++){
                console.log(receipt.events[i])
            }
        }

        return receipt
    }

    claim(sender: Account) {
        let block = this.chain.mineBlock([
            Tx.contractCall(contractName, 'claim', [], sender.address)
        ])
        let [receipt] = block.receipts
        
        if(this.logEvents) {
            for(var i:number = 0; i<receipt.events.length; i++){
                console.log(receipt.events[i])
            }
        }

        return receipt
    }

}
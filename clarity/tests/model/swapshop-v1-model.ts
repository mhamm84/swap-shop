import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.34.0/index.ts';

const contractName = 'swapshop-v1'


/**
 * {
        confirmations: "u0",
        dealStatus: "u1",
        dealers: "[ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG]",
        timeLock: "u5",
        version: '"v1"'
    }
 */
export type GetInfoResponse = {
    dealStatus: string,
    confirmations: string,
    timelock: string,
    version: string,
    dealers: string
}

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

    getInfo(sender: Account) {
        let block = this.chain.mineBlock([
            Tx.contractCall(contractName, 'get-info', [], sender.address)
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
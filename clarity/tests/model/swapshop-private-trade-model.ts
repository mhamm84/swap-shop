import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.34.0/index.ts';

const contractName = 'swapshop-private-trade-v1'


/**
 * {
        confirmations: "u0",
        tradeStatus: "u1",
        traders: "[ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5, ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG]",
        timeLock: "u5",
        version: '"v1"'
    }
 */
export type GetInfoResponse = {
    tradeStatus: string,
    confirmations: string,
    timelock: string,
    version: string,
    traders: string
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

    submitTrade(sender: Account) {
        let block = this.chain.mineBlock([
            Tx.contractCall(contractName, 'submit-trade', [], sender.address)
        ])
        let [receipt] = block.receipts

        if(this.logEvents) {
            for(var i:number = 0; i<receipt.events.length; i++){
                console.log(receipt.events[i])
            }
        }

        return receipt
    }

    confirmTrade(sender: Account) {
        let block = this.chain.mineBlock([
            Tx.contractCall(contractName, 'confirm-trade', [], sender.address)
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
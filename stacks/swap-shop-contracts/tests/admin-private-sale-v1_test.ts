
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts'
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts'
import { PrivateSale } from './model/swap-shop-tests-private-sale-v1.ts'
import * as Utils from './model/swap-shop-tests-utils.ts'

//  C O N S T A N T S
const contractName = 'swap-shop-private-sale-v1'
const defaultNftAssetContract = 'sip009-nft'
const commissionContract = 'swap-shop-commission'
const contractPrincipal = (deployer: Account) => `${deployer.address}.${contractName}`


Clarinet.test({
    name: "admin-add-to-whitelist",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        // Get the deployer account.
        let deployer = accounts.get('deployer')!
        let privateSale = new PrivateSale(chain, deployer)

        let receipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        receipt.result.expectOk().expectBool(true)    
    },
})

Clarinet.test({
    name: "admin-add-to-whitelist-not-deployer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!
        let wallet1 = accounts.get('wallet_1')!
        let privateSale = new PrivateSale(chain, deployer)

        let receipt = privateSale.adminAddToWhitelist(wallet1, defaultNftAssetContract)
        receipt.result.expectErr().expectUint(1003)
    },
})

Clarinet.test({
    name: "is-whitelisted",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!
        let privateSale = new PrivateSale(chain, deployer)
        privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        let call = await privateSale.isWhitelisted(deployer, defaultNftAssetContract)
        call.result.expectBool(true)
    },
})

Clarinet.test({
    name: "is-whitelisted-no-entry",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!
        let privateSale = new PrivateSale(chain, deployer)
        privateSale.adminAddToWhitelist(deployer, 'does-not-exist') 
        let call = await privateSale.isWhitelisted(deployer, defaultNftAssetContract)
        call.result.expectBool(false)
    },
})

Clarinet.test({
    name: "admin-update-nft-asset-in-whitelist-existing",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!
        let privateSale = new PrivateSale(chain, deployer)

        let addedAssetRes = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        addedAssetRes.result.expectOk().expectBool(true)   

        let updateRes = privateSale.adminUpdateInWhitelist(deployer, defaultNftAssetContract, false)
        updateRes.result.expectOk().expectBool(true)
    }
})

Clarinet.test({
    name: "admin-update-nft-asset-in-whitelist-new",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!
        let privateSale = new PrivateSale(chain, deployer)

        let updateRes = privateSale.adminUpdateInWhitelist(deployer, defaultNftAssetContract, false)
        updateRes.result.expectOk().expectBool(true)
    }
})

Clarinet.test({
    name: "admin-update-nft-asset-in-whitelist-auth",
    async fn(chain: Chain, accounts: Map<string,Account>) {
        let deployer = accounts.get("deployer")!
        let wallet1 = accounts.get("wallet_1")!
        let privateSale = new PrivateSale(chain, deployer)

        let addedAssetRes = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        addedAssetRes.result.expectOk().expectBool(true)  

        let updateRes = privateSale.adminUpdateInWhitelist(wallet1, defaultNftAssetContract, false)
        updateRes.result.expectErr().expectUint(1003)
    }
})

Clarinet.test({
    name: "add a commission which is enabled",
    async fn(chain: Chain, accounts: Map<string,Account>) {
        let deployer = accounts.get("deployer")!
        let privateSale = new PrivateSale(chain, deployer)

        let res = privateSale.adminAddCommission(deployer, commissionContract, true)
        res.result.expectOk().expectBool(true)

        let findCheck = privateSale.isCommissionEnabled(deployer, commissionContract)
        findCheck.result.expectBool(true)
    }
})

Clarinet.test({
    name: "add a commission which is disabled",
    async fn(chain: Chain, accounts: Map<string,Account>) {
        let deployer = accounts.get("deployer")!
        let privateSale = new PrivateSale(chain, deployer)

        let res = privateSale.adminAddCommission(deployer, commissionContract, false)
        res.result.expectOk().expectBool(true)

        let findCheck = privateSale.isCommissionEnabled(deployer, commissionContract)
        findCheck.result.expectBool(false)
    }
})

Clarinet.test({
    name: "add a commission with user not authorized",
    async fn(chain: Chain, accounts: Map<string,Account>) {
        let deployer = accounts.get("deployer")!
        let wallet1 = accounts.get("wallet_1")!
        let privateSale = new PrivateSale(chain, deployer)

        let res = privateSale.adminAddCommission(wallet1, commissionContract, true)
        res.result.expectErr().expectUint(1003)
    }
})

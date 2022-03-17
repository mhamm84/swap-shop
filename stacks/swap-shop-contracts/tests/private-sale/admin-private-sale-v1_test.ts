
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { PrivateSale } from '../model/swap-shop-tests-private-sale-v1.ts';
import { Sip009NftTransferEvent } from '../model/swap-shop-tests-utils.ts';

//  C O N S T A N T S
const contractName = 'private-sale-v1';
const defaultNftAssetContract = 'sip009-nft';
const contractPrincipal = (deployer: Account) => `${deployer.address}.${contractName}`;


Clarinet.test({
    name: "admin-add-to-whitelist",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        // Get the deployer account.
        let deployer = accounts.get('deployer')!;
        let privateSale = new PrivateSale(chain, deployer)

        let receipt = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        console.log(receipt) // --- { result: "(ok true)", events: [] }
        receipt.result.expectOk().expectBool(true);    
    },
});

Clarinet.test({
    name: "admin-add-to-whitelist-not-deployer",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!
        let wallet1 = accounts.get('wallet_1')!
        let privateSale = new PrivateSale(chain, deployer)

        let receipt = privateSale.adminAddToWhitelist(wallet1, defaultNftAssetContract)
        console.log(receipt)
        receipt.result.expectErr().expectUint(104);
    },
});

Clarinet.test({
    name: "is-whitelisted",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let privateSale = new PrivateSale(chain, deployer)
        privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        let call = await privateSale.isWhitelisted(deployer, defaultNftAssetContract);
        call.result.expectBool(true);
    },
});

Clarinet.test({
    name: "is-whitelisted-no-entry",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let privateSale = new PrivateSale(chain, deployer)
        privateSale.adminAddToWhitelist(deployer, 'does-not-exist') 
        let call = await privateSale.isWhitelisted(deployer, defaultNftAssetContract);
        call.result.expectBool(false);
    },
});

Clarinet.test({
    name: "admin-update-nft-asset-in-whitelist-existing",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let privateSale = new PrivateSale(chain, deployer)

        let addedAssetRes = privateSale.adminAddToWhitelist(deployer, defaultNftAssetContract)
        addedAssetRes.result.expectOk().expectBool(true);   

        let updateRes = privateSale.adminUpdateInWhitelist(deployer, defaultNftAssetContract, false)
        updateRes.result.expectOk().expectBool(true)
    }
})

Clarinet.test({
    name: "admin-update-nft-asset-in-whitelist-new",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
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
        addedAssetRes.result.expectOk().expectBool(true);  

        let updateRes = privateSale.adminUpdateInWhitelist(wallet1, defaultNftAssetContract, false)
        updateRes.result.expectErr().expectUint(104)
    }
})

Clarinet.test({
    name: "admin-set-contract-owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let newOwner = accounts.get("wallet_1")!
        let privateSale = new PrivateSale(chain, deployer)

        let updateRes = privateSale.adminSetContractOwner(deployer, newOwner)
        updateRes.result.expectOk().expectBool(true)
    }
})

Clarinet.test({
    name: "admin-set-contract-owner-not-current-owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let newOwner = accounts.get("wallet_1")!
        let privateSale = new PrivateSale(chain, deployer)

        let updateRes = privateSale.adminSetContractOwner(newOwner, newOwner)
        updateRes.result.expectErr().expectUint(104)
    }
})

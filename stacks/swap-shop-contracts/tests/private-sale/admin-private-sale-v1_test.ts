
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { PrivateSale } from '../model/swap-shop-tests-private-sale-v1.ts';
import { Sip009NftTransferEvent } from '../model/swap-shop-tests-utils.ts';

//  C O N S T A N T S
const contractName = 'private-sale-v1';
const defaultNftAssetContract = 'sip009-nft';
const contractPrincipal = (deployer: Account) => `${deployer.address}.${contractName}`;


Clarinet.test({
    name: "success-admin-add-nft-asset-to-whitelist",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        // Get the deployer account.
        let deployer = accounts.get('deployer')!;
        let privateSale = new PrivateSale(chain, deployer)

        let receipt = privateSale.adminAddNftAssetToWhitelist(deployer, defaultNftAssetContract)
        console.log(receipt) // --- { result: "(ok true)", events: [] }
        receipt.result.expectOk().expectBool(true);    
    },
});

Clarinet.test({
    name: "fail-not-deployer-admin-add-nft-asset-to-whitelist",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!
        let wallet1 = accounts.get('wallet_1')!
        let privateSale = new PrivateSale(chain, deployer)

        let receipt = privateSale.adminAddNftAssetToWhitelist(wallet1, defaultNftAssetContract)
        console.log(receipt)
        receipt.result.expectErr().expectUint(104);
    },
});

Clarinet.test({
    name: "success-admin-check-nft-asset-whitelisted",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let privateSale = new PrivateSale(chain, deployer)
        privateSale.adminAddNftAssetToWhitelist(deployer, defaultNftAssetContract)
        let call = await privateSale.adminCheckNftAssetWhitelisted(deployer, defaultNftAssetContract);
        call.result.expectBool(true);
    },
});

Clarinet.test({
    name: "fail-admin-check-nft-asset-whitelisted-no-entry",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let privateSale = new PrivateSale(chain, deployer)
        privateSale.adminAddNftAssetToWhitelist(deployer, 'does-not-exist') 
        let call = await privateSale.adminCheckNftAssetWhitelisted(deployer, defaultNftAssetContract);
        call.result.expectBool(false);
    },
});

Clarinet.test({
    name: "success-admin-update-nft-asset-in-whitelist-existing",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let privateSale = new PrivateSale(chain, deployer)

        let addedAssetRes = privateSale.adminAddNftAssetToWhitelist(deployer, defaultNftAssetContract)
        addedAssetRes.result.expectOk().expectBool(true);   

        let updateRes = privateSale.adminUpdateNftAssetInWhitelist(deployer, defaultNftAssetContract, false)
        updateRes.result.expectOk().expectBool(true)
    }
})

Clarinet.test({
    name: "success-admin-update-nft-asset-in-whitelist-new",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let privateSale = new PrivateSale(chain, deployer)

        let updateRes = privateSale.adminUpdateNftAssetInWhitelist(deployer, defaultNftAssetContract, false)
        updateRes.result.expectOk().expectBool(true)
    }
})

Clarinet.test({
    name: "fail-admin-update-nft-asset-in-whitelist-auth",
    async fn(chain: Chain, accounts: Map<string,Account>) {
        let deployer = accounts.get("deployer")!
        let wallet1 = accounts.get("wallet_1")!
        let privateSale = new PrivateSale(chain, deployer)

        let addedAssetRes = privateSale.adminAddNftAssetToWhitelist(deployer, defaultNftAssetContract)
        addedAssetRes.result.expectOk().expectBool(true);  

        let updateRes = privateSale.adminUpdateNftAssetInWhitelist(wallet1, defaultNftAssetContract, false)
        updateRes.result.expectErr().expectUint(104)
    }
})

Clarinet.test({
    name: "success-admin-set-contract-owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let newOwner = accounts.get("wallet_1")!
        let privateSale = new PrivateSale(chain, deployer)

        let updateRes = privateSale.adminSetContractOwner(deployer, newOwner)
        updateRes.result.expectOk().expectBool(true)
    }
})

Clarinet.test({
    name: "fail-admin-set-contract-owner-not-current-owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        let deployer = accounts.get('deployer')!;
        let newOwner = accounts.get("wallet_1")!
        let privateSale = new PrivateSale(chain, deployer)

        let updateRes = privateSale.adminSetContractOwner(newOwner, newOwner)
        updateRes.result.expectErr().expectUint(104)
    }
})

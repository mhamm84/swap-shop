
import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v0.14.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';
import { PrivateSale, Commission } from '../model/swap-shop-commission-tests.ts';
import * as Utils from '../model/swap-shop-tests-utils.ts';

//  C O N S T A N T S
const contractName = 'private-sale-v1';
const defaultNftAssetContract = 'sip009-nft';

Clarinet.test({
    name: "create-listing",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const [deployer, newOwner] = ['deployer', 'wallet_1'].map(name => accounts.get(name)!);
        let swapShopCommission = new Commission(chain, deployer)

        const receipt = swapShopCommission.changeOwner(deployer, newOwner)
        receipt.result.expectOk().expectBool(true);   
        
    },
});
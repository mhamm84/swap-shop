# S W A P  - S H O P


## S C E N A R I O

Alice has 3 Megapont Ape NFT’s she wants to sell to Bob and Bob wants to pay 5000 STX to Alice in return for the 3 Meagapont Ape NFT’s.

## C U R R E N T  O P T I O N S

Alice, could trust Bob and transfer her 3 NFT’s to Bob and trust that Bob will honor their agreement and transfer 5000 STX to Alice when the NFT’s are confirmed in his wallet.

Bob could trust Alice and Bob could transfer 5000 STX to Alice and when the 5000 STX are confirmed in Alice’s wallet, Alice sends Bob the 3 NFT’s

Alice could list the 3 NFT’s on a marketplace and then Bob purchase them when they show up for sale in the marketplace. 

A custodial swap contract could be used to transfer the NFT assets to, which Bob would be the only user allowed to purchase them.

There are obviously major drawbacks to all these approaches. In the first two, you have to have trust in the other party that they will send the correct assets as agreed for a private sale or even send any assets at all. Both Alice or Bob could decide to not honor the agreed assets. The market place sale would required that no other user purchases the asset. For example, 1 of the NFT’s might have a buy request pending for another user so Bob may miss out on it. Also there are the marketplace commissions involved for the private sale. The custodial swap contract is a much better option for a private sale so far, the major downside to this is that Alice has to transfer her 3 NFTs to the contract and has to trust the contract.

## P O S S I B L E  S O L U T I O N

A potential solution to perform a non-custodial private sale would be to utilize a multi-sig contract which has Alice and Bob as the signers on the contract and that any transfers have to be confirmed by both parties to execute the transactions involved. In this case, a transfer of Alice’s 3 NFT’s to Bob and a transaction sending Bob’s 5000 STX to Alice.

### M U L T I  S I G
https://github.com/Trust-Machines/multisafe

The work by multisafe will be used as the framework of the Clarity contracts needed to implement a safe swap between parties. At a high level , a contract is initialized with the founding owners addresses and a threshold of confirmations needed to execute external executor smart contracts. Owners and thresholds can be updated by authorized principals. Transactions are submitted by owners and then are voted on by the owners to execute the smart contracts referenced by the transaction when the threshold is reached.

### T I M E  L O C K
One issue straight away is what happens if the other person disappears. For example, if Alice sends her 3 NFT’s to the multi-sig contract they stuck there if Bob does not work with Alice to complete the transaction. Same with Bob sending the 5000 STX, Alice could disappear and the STX are stuck. A way around this is to enable each party to claim back their assets after a certain amount of time has passed. This way if the time lock is set for ~ 24 hours and the sale is not completed for in that time, Alice, Bob or both can send through a claim transaction to send them back their asset(s)

### C O N S E N S U S 
Both parties of the deal need to confirm/approve the deal. Only when both parties have confirmed can the transactions be attempted
To complete the deal.

### A T O M I C I T Y
In Alice & Bob’s case, 4 transfers (3 NFT transfers, 1 STX transfer) need to take place on the Stacks blockchain successfully to make the sale complete. Either all 4 complete successfully or they all revert. 

### C O M M I S S I O N 
To help with the hosting fees an optional commission structure could be added to enable setting for deals down the road


## C L A R I N E T  H E L P E R

### Clarinet console calls

```
clarient console
```

```
// View the assets of each wallet
::get_assets_maps
```

#### admin - Add nft asset to whitelist
```
(contract-call? .swapshop-v1 get-info)
```

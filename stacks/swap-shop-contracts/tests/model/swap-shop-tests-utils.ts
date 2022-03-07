

// Get full qualified name based on contract name
export function qualifiedName(contractName: string) {
    return "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM." + contractName;
}

export interface Sip009NftTransferEvent {
    type: string,
    nft_transfer_event: {
        asset_identifier: string,
        sender: string,
        recipient: string,
        value: string
    }
}
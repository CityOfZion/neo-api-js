export function getRawMemPool () {
    return this.$post('getrawmempool', []);
}

export function getRawTransaction (txId, verbose) {
    return this.$post('getrawtransaction', [txId, verbose ? 1 : 0]);
}

export function getTxOut (txId, index) {
    return this.$post('gettxout', [txId, index]);
}


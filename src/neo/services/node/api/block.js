export function getLastBlockHash () {
    return this.$post('getbestblockhash', []);
}

export function getBlockByHeight (height, verbose) {
    return this.$post('getblock', [height, verbose ? 1 : 0]);
}

export function getBlockCount () {
    return this.$post('getblockcount', []);
}

export function getBlockHashByHeight (height) {
    return this.$post('getblockhash', [height]);
}


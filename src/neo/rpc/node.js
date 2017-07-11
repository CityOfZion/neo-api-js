export function getConnectionCount () {
    return this.$post('getconnectioncount', []);
}

export function getRawMemPool () {
    return this.$post('getrawmempool', []);
}


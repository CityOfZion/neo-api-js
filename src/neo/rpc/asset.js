export function getBalance (assetId) {
    return this.$post('getbalance', [assetId]);
}

export function getTransactionByTxid (txid) {
    return this.$get('tx/get_tx/' + txid);
}

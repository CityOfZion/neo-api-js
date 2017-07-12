export function getAddressValue (address) {
    return this.$get('address/get_value/' + address);
}

export function getUnspentCoinsByAddress (address) {
    return this.$get('address/get_unspent/' + address);
}
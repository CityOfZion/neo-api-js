export function getBlockByHash (blockhash) {
    return this.$get('block/get_block/' + blockhash);
}

export function getBlockByHeight (height) {
    return this.$get('block/get_block/' + height);
}

export function getCurrentBlock () {
    return this.$get('block/get_current_block');
}

export function getCurrentBlockHeight () {
    return this.$get('block/get_current_height');
}

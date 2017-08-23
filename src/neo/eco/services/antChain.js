import { RestService } from '../../services/rest';
import { serviceOptions } from '../../services/serviceOptions';

export function antChain(options) {
    let inst = new RestService();

    serviceOptions(inst, 'antChain', options);

    //Block
    inst.getBlockByHash = getBlockByHash;
    inst.getBlockByHeight = getBlockByHeight;
    inst.getCurrentBlock = getCurrentBlock;
    inst.getCurrentBlockHeight = getCurrentBlockHeight;

    //Address
    inst.getAddressBalance = getAddressBalance;
    inst.getUnspentCoinsByAddress = getUnspentCoinsByAddress;

    //Tx
    inst.getTransactionByTxid = getTransactionByTxid;

    return inst;
}

function getAddressBalance (address) {
    return this.$get('address/get_value/' + address);
}

function getUnspentCoinsByAddress (address) {
    return this.$get('address/get_unspent/' + address);
}

function getBlockByHash (blockhash) {
    return this.$get('block/get_block/' + blockhash);
}

function getBlockByHeight (height) {
    return this.$get('block/get_block/' + height);
}

function getCurrentBlock () {
    return this.$get('block/get_current_block');
}

function getCurrentBlockHeight () {
    return this.$get('block/get_current_height');
}

function getTransactionByTxid (txid) {
    return this.$get('tx/get_tx/' + txid);
}
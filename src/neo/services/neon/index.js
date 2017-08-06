import { RestService } from '../rest';
import { serviceOptions } from '../serviceOptions';

export function neon(options) {
    var inst = new RestService();

    serviceOptions(inst, 'neon', options);

    inst.getCurrentBlockHeight = getCurrentBlockHeight;
    inst.getAddressBalance = getAddressBalance;
    inst.getAssetTransactionsByAddress = getAssetTransactionsByAddress;
    inst.getTransactionByTxid = getTransactionByTxid;

    return inst;
}

function getCurrentBlockHeight () {
    return this.$get('block/height');
}

function getAddressBalance (address) {
    return this.$get('address/balance/' + address);
}

function getAssetTransactionsByAddress (address) {
    return this.$get('address/history/' + address);
}

function getTransactionByTxid (txid) {
    return this.$get('transaction/' + txid);
}
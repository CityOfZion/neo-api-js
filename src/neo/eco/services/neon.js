import { RestService } from '../../services/rest';
import { serviceOptions } from '../../services/serviceOptions';

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
    return this.$get('block/height', null, { transformResponse: transformResponse });

    function transformResponse (response) {
        return {
            height: response.data && response.data.block_height
        };
    }
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
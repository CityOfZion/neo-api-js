import { RestService } from '../rest';
import { serviceOptions } from '../serviceOptions';

export function antChainXyz(options) {
    var inst = new RestService();

    serviceOptions(inst, 'antChainXyz', options);

    inst.getAddressBalance = getAddressBalance;
    inst.getAssetTransactionsByAddress = getAssetTransactionsByAddress;

    return inst;
}

function getAddressBalance (address) {
    return this.$get('address/info/' + address);
}

function getAssetTransactionsByAddress (address) {
    return this.$get('address/utxo/' + address);
}
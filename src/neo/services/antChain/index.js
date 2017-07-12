import { getBlockByHash, getBlockByHeight, getCurrentBlock, getCurrentBlockHeight } from './api/block';
import { getAddressValue, getUnspentCoinsByAddress } from './api/address';
import { getTransactionByTxid } from './api/tx';

import { RestService } from './rest';
import { serviceOptions } from '../serviceOptions';

export function antChain(options) {
    var inst = new RestService();

    inst.defaultProtocol = 'http';
    inst.supportsProtocol = supportsProtocol;

    serviceOptions(inst, options);

    //Block
    inst.getBlockByHash = getBlockByHash;
    inst.getBlockByHeight = getBlockByHeight;
    inst.getCurrentBlock = getCurrentBlock;
    inst.getCurrentBlockHeight = getCurrentBlockHeight;

    //Address
    inst.getAddressValue = getAddressValue;
    inst.getUnspentCoinsByAddress = getUnspentCoinsByAddress;

    //Tx
    inst.getTransactionByTxid = getTransactionByTxid;

    return inst;

    function supportsProtocol (protocol) {
        return protocol === 'http';
    }
}

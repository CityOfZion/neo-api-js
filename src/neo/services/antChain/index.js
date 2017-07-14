import { getBlockByHash, getBlockByHeight, getCurrentBlock, getCurrentBlockHeight } from './api/block';
import { getAddressBalance, getUnspentCoinsByAddress } from './api/address';
import { getTransactionByTxid } from './api/tx';

import { RestService } from './rest';
import { serviceOptions } from '../serviceOptions';
import { registerTransforms } from '../../registry.js';

import antChainTransforms from './transforms';

registerTransforms('antChain', antChainTransforms);

export function antChain(options) {
    var inst = new RestService();

    inst.serviceName = 'antChain';
    inst.defaultProtocol = 'http';

    inst.hasProtocolSupport = hasProtocolSupport;

    serviceOptions(inst, options);

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

    function hasProtocolSupport (protocol) {
        return protocol === 'http';
    }
}

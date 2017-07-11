import { getBlockByHash, getBlockByHeight, getCurrentBlock, getCurrentBlockHeight } from './block';
import { getAddressValue, getUnspentCoinsByAddress } from './address';
import { getTransactionByTxid } from './tx';

import { RestService } from './rest.service';

export function rest(options) {
    var inst = new RestService(options);

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
}

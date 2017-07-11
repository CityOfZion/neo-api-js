import { getBalance } from './asset';
import { getLastBlockHash, getBlockByHeight, getBlockCount, getBlockHashByHeight } from './block';
import { getConnectionCount, getRawMemPool } from './node';
import { getRawTransaction, getTxOut } from './tx';

import { RpcService } from './rpc.service';

export function rpc(options) {
    var inst = new RpcService(options);

    //Asset
    inst.getBalance = getBalance;

    //Block
    inst.getLastBlockHash = getLastBlockHash;
    inst.getBlockByHeight = getBlockByHeight;
    inst.getBlockCount = getBlockCount;
    inst.getBlockHashByHeight = getBlockHashByHeight;

    //Node
    inst.getConnectionCount = getConnectionCount;
    inst.getRawMemPool = getRawMemPool;

    //Tx
    inst.getRawTransaction = getRawTransaction;
    inst.getTxOut = getTxOut;

    return inst;
}
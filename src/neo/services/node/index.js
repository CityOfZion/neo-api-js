import { getBalance } from './api/asset';
import { getConnectionCount } from './api/net';
import { getRawMemPool, getRawTransaction, getTxOut } from './api/tx';
import { getLastBlockHash, getBlockByHeight, getBlockCount, getBlockHashByHeight } from './api/block';

import { RpcService } from './rpc';
import { serviceOptions } from '../serviceOptions';

export function node(options) {
    var inst = new RpcService();

    inst.defaultProtocol = 'rpc';
    inst.supportsProtocol = supportsProtocol;

    serviceOptions(inst, options);

    //Asset
    inst.getBalance = getBalance;

    //Block
    inst.getLastBlockHash = getLastBlockHash;
    inst.getBlockByHeight = getBlockByHeight;
    inst.getBlockCount = getBlockCount;
    inst.getBlockHashByHeight = getBlockHashByHeight;

    //Net
    inst.getConnectionCount = getConnectionCount;

    //Tx
    inst.getRawMemPool = getRawMemPool;
    inst.getRawTransaction = getRawTransaction;
    inst.getTxOut = getTxOut;

    return inst;

    //TODO - support WebSocket
    function supportsProtocol (protocol) {
        return protocol === 'rpc';
    }
}
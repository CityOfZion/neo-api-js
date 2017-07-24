import { RpcService } from '../rpc';
import { serviceOptions } from '../serviceOptions';

export function node(options) {
    var inst = new RpcService();

    serviceOptions(inst, 'node', options);

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
}

function getBalance (assetId) {
    return this.$post('getbalance', [assetId]);
}

function getLastBlockHash () {
    return this.$post('getbestblockhash', []);
}

function getBlockByHeight (height, verbose) {
    return this.$post('getblock', [height, verbose ? 1 : 0]);
}

function getBlockCount () {
    return this.$post('getblockcount', []);
}

function getBlockHashByHeight (height) {
    return this.$post('getblockhash', [height]);
}

function getConnectionCount () {
    return this.$post('getconnectioncount', []);
}

function getRawMemPool () {
    return this.$post('getrawmempool', []);
}

function getRawTransaction (txId, verbose) {
    return this.$post('getrawtransaction', [txId, verbose ? 1 : 0]);
}

function getTxOut (txId, index) {
    return this.$post('gettxout', [txId, index]);
}
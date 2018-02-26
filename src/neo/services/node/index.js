import { RpcService } from '../rpc';
import { serviceOptions } from '../serviceOptions';

export function node(options) {
    var inst = new RpcService();

    serviceOptions(inst, 'node', options);

    inst.dumpPrivKey = dumpPrivKey;
    inst.getAccountState = getAccountState;
    inst.getApplicationLog = getApplicationLog;
    inst.getAssetState = getAssetState;
    inst.getBalance = getBalance;
    inst.getBestBlockHash = getBestBlockHash;
    inst.getBlock = getBlock;
    inst.getBlockCount = getBlockCount;
    inst.getBlockHash = getBlockHash;
    inst.getBlockSysFee = getBlockSysFee;
    inst.getConnectionCount = getConnectionCount;
    inst.getContractState = getContractState;
    inst.getNewAddress = getNewAddress;
    inst.getRawMemPool = getRawMemPool;
    inst.getRawTransaction = getRawTransaction;
    inst.getStorage = getStorage;
    inst.getTxOut = getTxOut;
    inst.getPeers = getPeers;
    inst.getVersion = getVersion;
    inst.invoke = invoke;
    inst.invokeFunction = invokeFunction;
    inst.invokeScript = invokeScript;
    inst.listAddress = listAddress;
    inst.sendRawTransaction = sendRawTransaction;
    inst.sendToAddress = sendToAddress;
    inst.sendMany = sendMany;
    inst.validateAddress = validateAddress;


    return inst;
}


//http://docs.neo.org/en-us/node/api/dumpprivkey.html
function dumpPrivKey (address) {
    return this.$post('dumpprivkey', [address]);
}

//http://docs.neo.org/en-us/node/api/getaccountstate.html
function getAccountState (address) {
    return this.$post('getaccountstate', [address]);
}

//http://docs.neo.org/en-us/node/api/getapplicationlog.html
function getApplicationLog (txId, verbose) {
    return this.$post('getapplicationlog', [txId, verbose ? 1 : 0]);
}

//http://docs.neo.org/en-us/node/api/getassetstate.html
function getAssetState (assetId) {
    return this.$post('getassetstate', [assetId]);
}

//http://docs.neo.org/en-us/node/api/getbalance.html
function getBalance (assetId) {
    return this.$post('getbalance', [assetId]);
}

//http://docs.neo.org/en-us/node/api/getbestblockhash.html
function getBestBlockHash () {
    return this.$post('getbestblockhash', []);
}

//http://docs.neo.org/en-us/node/api/getblock.html
//http://docs.neo.org/en-us/node/api/getblock2.html
function getBlock (hashOrIndex, verbose) {
    return this.$post('getblock', [hashOrIndex, verbose ? 1 : 0]);
}

//http://docs.neo.org/en-us/node/api/getblockcount.html
function getBlockCount () {
    return this.$post('getblockcount', []);
}

//http://docs.neo.org/en-us/node/api/getblockhash.html
function getBlockHash (index) {
    return this.$post('getblockhash', [index]);
}

//http://docs.neo.org/en-us/node/api/getblocksysfee.html
function getBlockSysFee (index) {
    return this.$post('getblocksysfee', [index]);
}

//http://docs.neo.org/en-us/node/api/getconnectioncount.html
function getConnectionCount () {
    return this.$post('getconnectioncount', []);
}

//http://docs.neo.org/en-us/node/api/getcontractstate.html
function getContractState (scriptHash) {
    return this.$post('getcontractstate', [scriptHash]);
}

//http://docs.neo.org/en-us/node/api/getnewaddress.html
function getNewAddress () {
    return this.$post('getnewaddress', []);
}

//http://docs.neo.org/en-us/node/api/getrawmempool.html
function getRawMemPool () {
    return this.$post('getrawmempool', []);
}

//http://docs.neo.org/en-us/node/api/getrawtransaction.html
function getRawTransaction (txId, verbose) {
    return this.$post('getrawtransaction', [txId, verbose ? 1 : 0]);
}

//http://docs.neo.org/en-us/node/api/getstorage.html
function getStorage (scriptHash, key) {
    return this.$post('getstorage', [scriptHash, key]);
}

//http://docs.neo.org/en-us/node/api/gettxout.html
function getTxOut (txId, n) {
    return this.$post('gettxout', [txId, n]);
}

//http://docs.neo.org/en-us/node/api/getpeers.html
function getPeers () {
    return this.$post('getpeers', []);
}

//http://docs.neo.org/en-us/node/api/getversion.html
function getVersion () {
    return this.$post('getversion', []);
}

//http://docs.neo.org/en-us/node/api/invoke.html
function invoke (scriptHash, params) {
    return this.$post('invoke', [scriptHash, params]);
}

//http://docs.neo.org/en-us/node/api/invokefunction.html
function invokeFunction (scriptHash, operation, params) {
    return this.$post('invokefunction', [scriptHash, operation, params]);
}

//http://docs.neo.org/en-us/node/api/invokescript.html
function invokeScript (script) {
    return this.$post('invokescript', [script]);
}

//http://docs.neo.org/en-us/node/api/listaddress.html
function listAddress () {
    return this.$post('listaddress', []);
}

//http://docs.neo.org/en-us/node/api/sendrawtransaction.html
function  sendRawTransaction(hex) {
    return this.$post('sendrawtransaction', [hex]);
}

//http://docs.neo.org/en-us/node/api/sendtoaddress.html
function  sendToAddress(assetId, address, value, fee) {
    return this.$post('sendtoaddress', [assetId, address, value, fee ? 1 : 0]);
}

//http://docs.neo.org/en-us/node/api/sendmany.html
function  sendMany(outputsArray, fee, changeAddress) {
    var params = [outputsArray, fee ? 1 : 0];
    if(changeAddress !== undefined) {
        params.push(changeAddress);
    }
    return this.$post('sendmany', params);
}

//http://docs.neo.org/en-us/node/api/validateaddress.html
function  validateAddress(address) {
    return this.$post('validateaddress', [address]);
}
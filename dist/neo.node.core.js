'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function IntervalUtil (options) {

    var _defaults = {
        interval: 25 * 1000,            //25 Seconds
        errorInterval: 5 * 60 * 1000    //5 Minutes
    };

    var _options;
    var _intervalFunction;
    var _intervalId;
    var _running;

    if (typeof options === 'number') {

        options = Math.max(1000, options); //1 second minimum

        options = {interval: options};
    }

    _options = Object.assign({}, _defaults, options || {});

    //function noop () {}

    function start (intervalFunction) {

        if (_running) {
            stop();
        }

        _intervalFunction = intervalFunction;
        _running = true;

        _startInterval(_options.interval);
    }

    function stop () {
        _running = false;
        clearTimeout(_intervalId);
    }

    function isRunning () {
        return _running;
    }

    function _startInterval (delay) {

        _intervalId = setTimeout(function () {
            _intervalFunction();
        }, delay);
    }

    this.stop = stop;
    this.start = start;
    this.isRunning = isRunning;
}

function IpcService () {

    this.$send = $send;

    function $send (method, params) {
        return ipcRequest(this, method, params);
    }

    function ipcRequest (service, method, params) {

        if (!method) {
            throw new Error('You must configure the ipc method');
        }

        let data = {
            method: method,
            params: params || []
        };

        let options = {};

        options.data = data;

        return makeServiceRequest(service, options);
    }
}

let protocolClient;

let registry = {
    registerProtocolClient: registerProtocolClient
};


function registerProtocolClient (client) {
    protocolClient = client;
}

function getProtocolClient () {
    return protocolClient;
}

function serviceOptions(service, serviceName, initObj) {

    if (typeof initObj === 'string') {
        initObj = { baseUrl: initObj };
    }
    else if (typeof initObj !== 'object') {
        initObj = {};
    }

    service.serviceLatency = 0;
    service.serviceLatencyStartTime = 0;
    service.serviceLastConnectedTime = Date.now();
    service.serviceName = serviceName;
    service.serviceBaseUrl = initObj.baseUrl || '';
    service.servicePollInterval = initObj.poll;
    service.serviceMonitorLatency = initObj.monitorLatency;

    service.baseUrl = baseUrl;
    service.protocolClient = protocolClient;
    service.poll = poll;
    service.monitorLatency = monitorLatency;
    service.startLatencyTimer = startLatencyTimer;
    service.stopLatencyTimer = stopLatencyTimer;
    service.latency = latency;
    service.lastConnectedTime = lastConnectedTime;


    function startLatencyTimer () {
        service.serviceLatencyStartTime = Date.now();
    }

    function stopLatencyTimer (hasError) {

        if (hasError) {
            service.serviceLatency = 0;
        }
        else {
            service.serviceLastConnectedTime = Date.now();
            service.serviceLatency = service.serviceLastConnectedTime - service.serviceLatencyStartTime;
        }
    }

    function baseUrl (val) {

        if (!val) {
            return this.serviceBaseUrl;
        }

        this.serviceBaseUrl = val;

        return this;
    }

    function protocolClient (val) {

        if (!val) {
            return this.serviceProtocolClient || getProtocolClient();
        }

        this.serviceProtocolClient = val;

        return this;
    }

    function poll (val) {

        if (!val) {
            return this.servicePollInterval;
        }

        this.servicePollInterval = val;

        return this;
    }

    function monitorLatency (val) {

        if (!val) {
            return this.serviceMonitorLatency;
        }

        this.serviceMonitorLatency = val;

        return this;
    }

    function latency (val) {

        if (!val) {
            return this.serviceLatency;
        }

        //read-only
        //this.serviceLatency = val;

        return this;
    }

    function lastConnectedTime (val) {

        if (!val) {
            return this.serviceLastConnectedTime;
        }

        //read-only
        //this.serviceLastConnectedTime = val;

        return this;
    }
}

function rest (options) {
    let inst = new RestService();

    serviceOptions(inst, 'rest', options);

    return inst;
}

function RestService () {

    this.$post = $post;
    this.$get = $get;
    this.$put = $put;
    this.$delete = $delete;

    function $post (url, data, options, queryParams) {
        return httpRequest(this, url, 'POST', data, options, queryParams);
    }

    function $get (url, queryParams, options) {
        return httpRequest(this, url, 'GET', null, options, queryParams);
    }

    function $put (url, data, options, queryParams) {
        return httpRequest(this, url, 'PUT', data, options, queryParams);
    }

    function $delete (url, queryParams, options) {
        return httpRequest(this, url, 'DELETE', null, options, queryParams);
    }

    function httpRequest (service, url, method, data, options, queryParams) {

        if (!method || !url) {
            throw new Error('You must configure at least the http method and url');
        }

        options = options || {};

        if (service.baseUrl() !== undefined) {
            url = service.baseUrl() + url;
        }

        options.url = url;
        options.body = data;
        options.method = method;
        options.queryParams = queryParams;

        if (!options.hasOwnProperty('transformResponse')) {
            options.transformResponse = function (response) {
                return response.data;
            };
        }

        if (!options.hasOwnProperty('transformResponseError')) {
            options.transformResponseError = function (response) {
                return response.data;
            };
        }

        return makeServiceRequest(service, options);
    }
}

let factory = ServiceFactory();

function ServiceFactory () {

    function createRcpService (options) {
        let inst = new RpcService();

        serviceOptions(inst, 'node', options);

        return inst;
    }

    function createIpcService (options) {
        let inst = new IpcService();

        serviceOptions(inst, 'node', options);

        return inst;
    }

    function createRestService (options) {
        let inst = new RestService();

        serviceOptions(inst, 'node', options);

        return inst;
    }

    return {
        createRcpService: createRcpService,
        createIpcService: createIpcService,
        createRestService: createRestService
    };
}

let service = Service();

service.factory = factory;

function Service () {

    // All requests under the same policy will get coalesced.
    function PollingPolicy (options) {

        this.options = options;
        this.stopAll = function () {}; //set by PollRunner
        this.startAll = function () {}; //set by PollRunner

        this._interval = function () {};
        this._requests = [];
    }

    //When Batch of methods complete
    PollingPolicy.prototype.onInterval = onInterval;
    PollingPolicy.prototype.run = run;

    function onInterval (fn) {

        if (typeof fn !== 'function') {
            throw new Error('onInterval(fn) - "fn" must be of type "function"');
        }

        this._interval = fn;
    }

    function run (method) {
        this._requests.push(method);
    }

    function createPollingPolicy (options) {
        return new PollingPolicy(options);
    }

    function isPollingPolicy (obj) {
        return obj instanceof PollingPolicy;
    }

    //number, optionsObj or PollPolicy
    function getPollRunner (obj) {

        if(obj instanceof PollingPolicy) {
            if (!obj._pollRunner) {
                obj._pollRunner = new PollRunner(obj);
            }

            return obj._pollRunner;
        }

        return new PollRunner(new PollingPolicy(obj));
    }

    return {
        createPollingPolicy: createPollingPolicy,
        isPollingPolicy: isPollingPolicy,
        getPollRunner: getPollRunner
    };
}

function PollRunner (policy) {

    let intervalUtil = new IntervalUtil(policy.options);
    let _isPaused = false;
    let _isPolling = false;
    
    this.isPolling = isPolling;
    this.addRequest = addRequest;
    this.pause = pause;
    this.play = play;

    policy.stopAll = pause;
    policy.startAll = play;

    function isPolling() {
        return _isPolling || intervalUtil.isRunning();
    }

    function addRequest (request) {
        policy._requests.push(request);

        return this;
    }

    function pause() {
        _isPaused = true;

        intervalUtil.stop();
    }

    function play() {
        if (_isPaused) {
            _isPaused = false;

            intervalUtil.start(runAll);
        }
    }

    setTimeout(runAll, 0);

    function runAll () {
        let count = policy._requests.length;

        _isPolling = true;

        policy._requests.forEach(function (request) {
            request().then(complete).catch(complete);
        });

        function complete () {
            --count;

            if (count === 0) {
                policy._interval();

                _isPolling = false;

                if (!_isPaused) {
                    intervalUtil.start(runAll);
                }
            }
        }
    }
}

function makeServiceRequest (restService, httpOptions) {

    return _wrapPromise(function (resolve, reject, notify) {

        let ctx = prepareContext();

        ctx.successFunction = resolve;
        ctx.errorFunction = reject;
        ctx.notifyFunction = notify;
        ctx.transformResponse = httpOptions.transformResponse || noop;
        ctx.transformResponseError = httpOptions.transformResponseError || noop;

        let client = restService.protocolClient();

        let options = client.buildRequestOptions(httpOptions);

        let poll = restService.poll();

        if (restService.monitorLatency()) {
            ctx.startLatencyTimer = restService.startLatencyTimer;
            ctx.stopLatencyTimer = restService.stopLatencyTimer;
        }

        if (poll) {
            let pollRunner = service.getPollRunner(poll).addRequest(function () {
                return _makeServiceRequest(client, options, ctx);
            });

            ctx.stopPolling = pollRunner.pause;
            ctx.isPolling = pollRunner.isPolling;
        }
        else {
            _makeServiceRequest(client, options, ctx);
        }
    });
}

function noop () {}

//Only top-level Promise has notify. This is intentional as then().notify() does not make any sense.
//  Notify keeps the chain open indefinitely and can be called repeatedly.
//  Once Then is called, the promise chain is considered resolved and marked for cleanup. Notify can never be called after a then.
function _wrapPromise (callback) {

    let promise = new Promise(function (resolve, reject) {
        callback(resolve, reject, handleNotify);
    });

    promise._notify = noop;
    promise.notify = notify;

    function notify (fn) {

        if (promise._notify === noop) {
            promise._notify = fn;
        }
        else {
            //Support chaining notify calls: notify().notify()
            let chainNotify = promise._notify;

            promise._notify = function (result) {
                return fn(chainNotify(result));
            };
        }

        return this;
    }

    function handleNotify (result) {
        promise._notify(result);
    }

    return promise;
}

function prepareContext() {
    let ctx = { };

    ctx.stopPolling = noop;
    ctx.isPolling = noop;//function () { return false; };
    ctx.startLatencyTimer = noop;
    ctx.stopLatencyTimer = noop;

    return ctx;
}

function _makeServiceRequest (client, options, ctx) {

    ctx.startLatencyTimer();

    let promise = client.invoke(options);

    promise.catch(function (response) {
        ctx.errorFunction(response);

        ctx.stopLatencyTimer(true);
    });

    promise = promise.then(function (response) {

        ctx.stopLatencyTimer();

        let data = ctx.transformResponse(response);

        if (!data) {
            let error = ctx.transformResponseError(response);

            if (error) {
                ctx.errorFunction(error, response);
                if (ctx.isPolling()) {
                    ctx.stopPolling();
                }

                return;
            }
        }

        if (ctx.isPolling()) {
            ctx.notifyFunction(data, response);
        }
        else {
            ctx.successFunction(data, response);
        }

    });

    return promise;

}

function RpcService () {

    this.$post = $post;

    function $post (rpcMethod, rpcParams) {
        return rpcRequest(this, 'POST', rpcMethod, rpcParams);
    }

    function rpcRequest (service, method, rpcMethod, rpcParams) {

        if (!rpcMethod) {
            throw new Error('You must configure the rpc method');
        }

        var data = { jsonrpc: '2.0', id: 1 };

        data.method = rpcMethod;
        data.params = rpcParams || [];

        var options = {};

        options.url = service.baseUrl();
        options.data = data;
        options.method = method;

        options.transformResponse = function (response) {
            return response.data.result;
        };

        options.transformResponseError = function (response) {
            return response.data.error;
        };

        return makeServiceRequest(service, options);
    }
}

function node(options) {
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

exports.node = node;
exports.rest = rest;
exports.registry = registry;
exports.service = service;

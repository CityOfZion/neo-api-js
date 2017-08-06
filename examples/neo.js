(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.neo = global.neo || {})));
}(this, (function (exports) { 'use strict';

var protocolClient;
var serviceMap = {};

var registry = {
    registerTransforms: registerTransforms,
    registerProtocolClient: registerProtocolClient
};


function registerProtocolClient (client) {
    protocolClient = client;
}

function getProtocolClient () {
    return protocolClient;
}

function registerTransforms (serviceName, transforms) {
    serviceMap[serviceName] =  transforms;
}

function getTransformsByService (serviceName) {
    return serviceMap[serviceName];
}

function serviceOptions(service, serviceName, initObj) {

    if (typeof initObj === 'string') {
        initObj = { baseUrl: initObj};
    }
    else if (typeof initObj !== 'object') {
        initObj = {};
    }

    service.serviceName = serviceName;
    service.serviceBaseUrl = initObj.baseUrl || '';
    service.servicePollInterval = initObj.poll;
    service.serviceUseTransforms = false;

    service.baseUrl = baseUrl;
    service.protocolClient = protocolClient;
    service.poll = poll;
    service.useTransforms = useTransforms;

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

    function useTransforms (val) {

        if (!val) {
            return this.serviceUseTransforms;
        }

        this.serviceUseTransforms = val;

        return this;
    }
}



//neo.node().baseUrl('').protocol('http').poll(2000).getBlockHeight();
//neo.node().baseUrl('http://localhost:3033').poll(2000).getBlockHeight();
//neo.node({ baseUrl: 'http://localhost:3033', poll: 2000 }).getBlockHeight();

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

var service = Service();

function Service () {

    // All requests under the same policy will get coalesced.
    function PollingPolicy (options) {
        this.options = options;
        this._interval = function () {};
        this._methods = [];
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
        this._methods.push(method);
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

    var intervalUtil = new IntervalUtil(policy.options);
    var _isPaused = false;
    var _isPolling = true;

    this.stop = intervalUtil.stop;
    this.isPolling = isPolling;
    this.run = run;
    this.pause = pause;
    this.play = play;

    function isPolling() {
        return _isPolling || intervalUtil.isRunning;
    }

    function run (method) {
        policy._methods.push(method);

        return this;
    }

    function pause() {
        _isPaused = true;
    }

    function play() {
        if (_isPaused) {
            _isPaused = false;

            intervalUtil.start(runAll);
        }
    }

    setTimeout(runAll, 0);

    function runAll () {
        var count = policy._methods.length;

        _isPolling = false;

        policy._methods.forEach(function (method) {
            method().then(complete).catch(complete);
        });

        function complete () {
            --count;

            if (count === 0) {
                policy._interval();

                if (!_isPaused) {
                    intervalUtil.start(runAll);
                }
            }
        }
    }
}

function makeRpcRequest (restService, httpOptions, methodSignature) {

    return _wrapPromise(function (resolve, reject, notify) {

        var ctx = prepareContext(restService, methodSignature);

        ctx.successFunction = resolve;
        ctx.errorFunction = reject;
        ctx.notifyFunction = notify;
        ctx.transformResponse = httpOptions.transformResponse || noop;
        ctx.transformResponseError = httpOptions.transformResponseError || noop;

        var rpcClient = restService.protocolClient();

        var rpcOptions = rpcClient.buildRequestOptions(httpOptions);

        var poll = restService.poll();

        if (poll) {
            var pollRunner = service.getPollRunner(poll).run(function () {
                return _makeRpcRequest(rpcClient, rpcOptions, ctx);
            });

            ctx.stopPolling = pollRunner.stop;
            ctx.isPolling = pollRunner.isPolling;
        }
        else {
            _makeRpcRequest(rpcClient, rpcOptions, ctx);
        }
    });
}

function noop () {}

function _wrapPromise (callback) {

    function notify (fn) {
        promise._notify = fn;

        return this;
    }

    function handleNotify (result) {
        promise._notify(result);
    }

    var promise = new Promise(function (resolve, reject) {
        callback(resolve, reject, handleNotify);
    });

    promise._notify = noop;
    promise.notify = notify;

    return promise;
}

function prepareContext(service$$1, methodSignature) {
    var ctx = {};

    ctx.transform = transformPassThrough;
    ctx.stopPolling = noop;
    ctx.isPolling = function () { return false; };

    if (service$$1.serviceUseTransforms && service$$1.serviceName)  {

        var availableTransforms = getTransformsByService(service$$1.serviceName);

        if (availableTransforms) {
            ctx.transform = getTransform(availableTransforms, methodSignature);
        }
    }

    return ctx;
}

function getTransform (availableTransforms, methodSignature) {
    return function (rawData) {

        var foundTransform;

        availableTransforms.some(function (entry) {
            if (methodSignature.indexOf(entry.sig) === 0) {
                foundTransform = entry.transform;

                return true;
            }
        });

        return foundTransform ? foundTransform(rawData) : rawData;
    };
}

function transformPassThrough (rawData) {
    return rawData;
}

function _makeRpcRequest (rpcClient, rpcOptions, ctx) {

    return rpcClient.invoke(rpcOptions)
        .then(function (response) {

            var data = ctx.transformResponse(response);

            if (!data) {
                var error = ctx.transformResponseError(response);

                if (error) {
                    ctx.errorFunction(error, response);
                    if (ctx.isPolling()) {
                        ctx.stopPolling();
                    }

                    return;
                }
            }

            if (ctx.isPolling()) {
                ctx.notifyFunction(ctx.transform(data), response);
            }
            else {
                ctx.successFunction(ctx.transform(data), response);
            }

        })
        .catch(function (response) {
            ctx.errorFunction(response);
        });
}

function rest (options) {
    var inst = new RestService();

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

        var methodSignature = method + '::' + url;

        options = options || {};

        if (service.baseUrl() !== undefined) {
            url = service.baseUrl() + url;
        }

        options.url = url;
        options.body = data;
        options.method = method;
        options.queryParams = queryParams;

        options.transformResponse = function (response) {
            return response.data;
        };

        options.transformResponseError = function (response) {
            return response.data;
        };

        return makeRpcRequest(service, options, methodSignature);
    }
}

function antChain(options) {
    var inst = new RestService();

    serviceOptions(inst, 'antChain', options);

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
}

function getAddressBalance (address) {
    return this.$get('address/get_value/' + address);
}

function getUnspentCoinsByAddress (address) {
    return this.$get('address/get_unspent/' + address);
}

function getBlockByHash (blockhash) {
    return this.$get('block/get_block/' + blockhash);
}

function getBlockByHeight (height) {
    return this.$get('block/get_block/' + height);
}

function getCurrentBlock () {
    return this.$get('block/get_current_block');
}

function getCurrentBlockHeight () {
    return this.$get('block/get_current_height');
}

function getTransactionByTxid (txid) {
    return this.$get('tx/get_tx/' + txid);
}

function antChainXyz(options) {
    var inst = new RestService();

    serviceOptions(inst, 'antChainXyz', options);

    inst.getAddressBalance = getAddressBalance$1;
    inst.getAssetTransactionsByAddress = getAssetTransactionsByAddress;

    return inst;
}

function getAddressBalance$1 (address) {
    return this.$get('address/info/' + address);
}

function getAssetTransactionsByAddress (address) {
    return this.$get('address/utxo/' + address);
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

        var methodSignature = method + '::' + rpcMethod;

        return makeRpcRequest(service, options, methodSignature);
    }
}

function node(options) {
    var inst = new RpcService();

    serviceOptions(inst, 'node', options);

    //Asset
    inst.getBalance = getBalance;

    //Block
    inst.getLastBlockHash = getLastBlockHash;
    inst.getBlockByHeight = getBlockByHeight$1;
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

function getBlockByHeight$1 (height, verbose) {
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

var bind = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
var index$1 = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
};

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object' && !isArray(obj)) {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

var utils = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: index$1,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  extend: extend,
  trim: trim
};

var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
var enhanceError = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }
  error.request = request;
  error.response = response;
  return error;
};

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
var createError = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
var settle = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  // Note: status is not exposed by XDomainRequest
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
var buildURL = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      }

      if (!utils.isArray(val)) {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
var parseHeaders = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
    }
  });

  return parsed;
};

var isURLSameOrigin = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
  (function standardBrowserEnv() {
    var msie = /(msie|trident)/i.test(navigator.userAgent);
    var urlParsingNode = document.createElement('a');
    var originURL;

    /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
    function resolveURL(url) {
      var href = url;

      if (msie) {
        // IE needs attribute set twice to normalize properties
        urlParsingNode.setAttribute('href', href);
        href = urlParsingNode.href;
      }

      urlParsingNode.setAttribute('href', href);

      // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
      return {
        href: urlParsingNode.href,
        protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
        host: urlParsingNode.host,
        search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
        hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
        hostname: urlParsingNode.hostname,
        port: urlParsingNode.port,
        pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
                  urlParsingNode.pathname :
                  '/' + urlParsingNode.pathname
      };
    }

    originURL = resolveURL(window.location.href);

    /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
    return function isURLSameOrigin(requestURL) {
      var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
      return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
    };
  })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return function isURLSameOrigin() {
      return true;
    };
  })()
);

// btoa polyfill for IE<10 courtesy https://github.com/davidchambers/Base64.js

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function E() {
  this.message = 'String contains an invalid character';
}
E.prototype = new Error;
E.prototype.code = 5;
E.prototype.name = 'InvalidCharacterError';

function btoa$1(input) {
  var str = String(input);
  var output = '';
  for (
    // initialize result and counter
    var block, charCode, idx = 0, map = chars;
    // if the next str index does not exist:
    //   change the mapping table to "="
    //   check if d has no fractional digits
    str.charAt(idx | 0) || (map = '=', idx % 1);
    // "8 - idx % 1 * 8" generates the sequence 2, 4, 6, 8
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = str.charCodeAt(idx += 3 / 4);
    if (charCode > 0xFF) {
      throw new E();
    }
    block = block << 8 | charCode;
  }
  return output;
}

var btoa_1 = btoa$1;

var cookies = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
  (function standardBrowserEnv() {
    return {
      write: function write(name, value, expires, path, domain, secure) {
        var cookie = [];
        cookie.push(name + '=' + encodeURIComponent(value));

        if (utils.isNumber(expires)) {
          cookie.push('expires=' + new Date(expires).toGMTString());
        }

        if (utils.isString(path)) {
          cookie.push('path=' + path);
        }

        if (utils.isString(domain)) {
          cookie.push('domain=' + domain);
        }

        if (secure === true) {
          cookie.push('secure');
        }

        document.cookie = cookie.join('; ');
      },

      read: function read(name) {
        var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
        return (match ? decodeURIComponent(match[3]) : null);
      },

      remove: function remove(name) {
        this.write(name, '', Date.now() - 86400000);
      }
    };
  })() :

  // Non standard browser env (web workers, react-native) lack needed support.
  (function nonStandardBrowserEnv() {
    return {
      write: function write() {},
      read: function read() { return null; },
      remove: function remove() {}
    };
  })()
);

var btoa = (typeof window !== 'undefined' && window.btoa && window.btoa.bind(window)) || btoa_1;

var xhr = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();
    var loadEvent = 'onreadystatechange';
    var xDomain = false;

    // For IE 8/9 CORS support
    // Only supports POST and GET calls and doesn't returns the response headers.
    // DON'T do this for testing b/c XMLHttpRequest is mocked, not XDomainRequest.
    if (process.env.NODE_ENV !== 'test' &&
        typeof window !== 'undefined' &&
        window.XDomainRequest && !('withCredentials' in request) &&
        !isURLSameOrigin(config.url)) {
      request = new window.XDomainRequest();
      loadEvent = 'onload';
      xDomain = true;
      request.onprogress = function handleProgress() {};
      request.ontimeout = function handleTimeout() {};
    }

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request[loadEvent] = function handleLoad() {
      if (!request || (request.readyState !== 4 && !xDomain)) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        // IE sends 1223 instead of 204 (https://github.com/mzabriskie/axios/issues/201)
        status: request.status === 1223 ? 204 : request.status,
        statusText: request.status === 1223 ? 'No Content' : request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies$$1 = cookies;

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(config.url)) && config.xsrfCookieName ?
          cookies$$1.read(config.xsrfCookieName) :
          undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (config.withCredentials) {
      request.withCredentials = true;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = xhr;
  } else if (typeof process !== 'undefined') {
    // For node use HTTP adapter
    adapter = xhr;
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

var defaults_1 = defaults;

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

var InterceptorManager_1 = InterceptorManager;

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
var transformData = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

var isCancel = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
var dispatchRequest = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults_1.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
var isAbsoluteURL = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
var combineURLs = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager_1(),
    response: new InterceptorManager_1()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = utils.merge({
      url: arguments[0]
    }, arguments[1]);
  }

  config = utils.merge(defaults_1, this.defaults, { method: 'get' }, config);
  config.method = config.method.toLowerCase();

  // Support baseURL config
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

var Axios_1 = Axios;

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

var Cancel_1 = Cancel;

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel_1(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

var CancelToken_1 = CancelToken;

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
var spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios_1(defaultConfig);
  var instance = bind(Axios_1.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios_1.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios$1 = createInstance(defaults_1);

// Expose Axios class to allow class inheritance
axios$1.Axios = Axios_1;

// Factory for creating new instances
axios$1.create = function create(instanceConfig) {
  return createInstance(utils.merge(defaults_1, instanceConfig));
};

// Expose Cancel & CancelToken
axios$1.Cancel = Cancel_1;
axios$1.CancelToken = CancelToken_1;
axios$1.isCancel = isCancel;

// Expose all/spread
axios$1.all = function all(promises) {
  return Promise.all(promises);
};
axios$1.spread = spread;

var axios_1 = axios$1;

// Allow use of default import syntax in TypeScript
var default_1 = axios$1;

axios_1.default = default_1;

var index = axios_1;

//AXIOS workaround - process.env.NODE_ENV
if (typeof process === 'undefined' && !window.process) {
    window.process = {env: {}};
}

var axiosClient = AxiosClient();

function AxiosClient (){

    var supportMap = { http: true, rpc: true };

    function hasProtocolSupport (protocol) {
        return supportMap[protocol];
    }

    function invoke (restOptions) {
        return index(restOptions);
    }

    function serialize (obj) {
        return obj && Object.keys(obj).map(function (key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
        }).join('&');
    }

    function filterKeys (srcOptions, keys) {
        return keys.reduce(function (result, k) {
            if (srcOptions[k]) {
                result[k] = srcOptions[k];
            }

            return result;
        }, {});
    }

    function buildRequestOptions (options) {

        //Build Url with queryParams
        var paramStr = options.queryParams && serialize(options.queryParams);

        if(paramStr) {
            options.url = options.url + '?' + paramStr;
        }

        // Don't allow any undefined values into Fetch Options
        options = filterKeys(options, ['method', 'url', 'params', 'body', 'data', 'cache', 'headers']);

        options.headers = {};
        
        options.headers['Accept'] = 'application/json';
        options.headers['Content-Type'] = 'application/json';

        if (options.body) {
            options.body = JSON.stringify(options.body);
        }

        if (options.data) {
            options.data = JSON.stringify(options.data);
        }

        return options;
    }

    return {
        invoke: invoke,
        hasProtocolSupport: hasProtocolSupport,
        buildRequestOptions: buildRequestOptions
    };
}

var AddressBalanceFactory = AddressBalanceFactory$1();

function AddressBalanceFactory$1 () {

    function AddressBalance () {
        this.id = undefined;
        this.antShares = undefined;
        this.antCoins = undefined;
    }

    AddressBalance.prototype.update = update;

    function update (rawData) {
        this.id = rawData.address;

        if (rawData.asset && rawData.asset.length === 2) {
            this.antShares = Object.assign({}, rawData.asset[0]);
            this.antCoins = Object.assign({}, rawData.asset[1]);
        }
    }

    function createFromJson (rawData) {
        var inst = new AddressBalance();

        inst.update(rawData);

        return inst;
    }

    return {
        createFromJson: createFromJson
    };
}

var AddressAssetFactory = AddressAssetFactory$1();

function AddressAssetFactory$1 () {

    function AddressAsset () {
        this.id = undefined;
        this.name = undefined;
        this.balance = undefined;
        this.transactions = undefined;
    }

    AddressAsset.prototype.update = update;

    function update (rawData) {
        this.id = rawData.assetId;
        this.name = rawData.name;
        this.balance = rawData.balance;

        //List of transactions that contribute to the total balance
        this.transactions = rawData.list.map(function (tx) {
            return Object.assign({}, tx);
        });
    }

    function createFromJson (rawDataList) {

        return rawDataList.map(function (rawData) {
            var inst = new AddressAsset();

            inst.update(rawData);

            return inst;
        });
    }

    return {
        createFromJson: createFromJson
    };
}

var antChainTransforms = AntChainTransforms();

function AntChainTransforms () {

    function transformGetValue (result) {
        return AddressBalanceFactory.createFromJson(result);
    }

    function transformGetUnspent (result) {
        return AddressAssetFactory.createFromJson(result);
    }

    return [
        { sig: 'GET::address/get_value/', transform: transformGetValue },
        { sig: 'GET::address/get_unspent/', transform: transformGetUnspent }
    ];

}

registerProtocolClient(axiosClient);

registerTransforms('antChain', antChainTransforms);

exports.antChain = antChain;
exports.antChainXyz = antChainXyz;
exports.node = node;
exports.rest = rest;
exports.registry = registry;
exports.service = service;

Object.defineProperty(exports, '__esModule', { value: true });

})));

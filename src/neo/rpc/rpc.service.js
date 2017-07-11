import provider from '../provider.js';

export function RpcService (opts) {

    var BASE_URL = '';

    if (opts) {
        if (typeof(opts) === 'string') {
            BASE_URL = opts;
        }
        else if (opts.hasOwnProperty('baseUrl')) {
            BASE_URL = opts.baseUrl;
        }
    }

    this.$post = $post;

    function $post (rpcMethod, rpcParams) {
        return rpcRequest('POST', rpcMethod, rpcParams);
    }

    function rpcRequest (method, rpcMethod, rpcParams) {

        return wrapPromise(function (resolve, reject) {

            var options = {};

            var data = { jsonrpc: '2.0', id: 1 };
            data.method = rpcMethod;
            data.params = rpcParams || [];

            options.url = BASE_URL;
            options.data = data;
            options.method = method;
            options.successFunction = resolve;
            options.errorFunction = reject;

            makeRpcRequest(options);
        });
    }

    // PRIVATE FUNCTIONS

    function wrapPromise (callback) {
        return new Promise(function (resolve, reject) {
            callback(resolve, reject);
        });
    }

    function makeRpcRequest (options) {

        if (!options.url) {
            throw new Error('You must configure at least the rpc url');
        }

        var rpcProvider = provider();

        var rpcOptions = rpcProvider.buildRequestOptions(options);

        rpcProvider.invoke(rpcOptions)
            .then(function (response) {
                if (response.data.error) {
                    options.errorFunction(response.data.error, response);
                }
                else {
                    options.successFunction(response.data.result, response.status, response.headers, response.config);
                }
            })
            .catch(function (response) {
                options.errorFunction(response);
            });
    }
}


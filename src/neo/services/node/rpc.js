import { prepareOptions } from '../serviceOptions.js';

export function RpcService () {

    this.$post = $post;

    function $post (rpcMethod, rpcParams) {
        return rpcRequest('POST', rpcMethod, rpcParams, prepareOptions(this));
    }

    function rpcRequest (method, rpcMethod, rpcParams, serviceOptions) {

        return wrapPromise(function (resolve, reject) {

            var data = { jsonrpc: '2.0', id: 1 };
            data.method = rpcMethod;
            data.params = rpcParams || [];

            serviceOptions.url = serviceOptions.baseUrl;
            serviceOptions.data = data;
            serviceOptions.method = method;
            serviceOptions.successFunction = resolve;
            serviceOptions.errorFunction = reject;

            makeRpcRequest(serviceOptions);
        });
    }

    // PRIVATE FUNCTIONS

    function wrapPromise (callback) {
        return new Promise(function (resolve, reject) {
            callback(resolve, reject);
        });
    }

    function makeRpcRequest (serviceOptions) {

        if (!serviceOptions.url) {
            throw new Error('You must configure at least the rpc url');
        }

        var rpcProvider = serviceOptions.provider;

        var rpcOptions = rpcProvider.buildRequestOptions(serviceOptions);

        rpcProvider.invoke(rpcOptions)
            .then(function (response) {
                if (response.data.error) {
                    serviceOptions.errorFunction(response.data.error, response);
                }
                else {
                    serviceOptions.successFunction(response.data.result, response.status, response.headers, response.config);
                }
            })
            .catch(function (response) {
                serviceOptions.errorFunction(response);
            });
    }
}


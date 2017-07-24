import { prepareOptions } from './serviceOptions.js';

export function RpcService () {

    this.$post = $post;

    function $post (rpcMethod, rpcParams) {
        return rpcRequest(this, 'POST', rpcMethod, rpcParams);
    }

    function rpcRequest (service, method, rpcMethod, rpcParams) {

        return wrapPromise(function (resolve, reject) {

            var serviceOptions = prepareOptions(service, method + '::' + rpcMethod);

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

        var rpcClient = serviceOptions.protocolClient;

        var rpcOptions = rpcClient.buildRequestOptions(serviceOptions);

        rpcClient.invoke(rpcOptions)
            .then(function (response) {
                if (response.data.error) {
                    serviceOptions.errorFunction(response.data.error, response);
                }
                else {
                    serviceOptions.successFunction(serviceOptions.transform(response.data.result), response);
                }
            })
            .catch(function (response) {
                serviceOptions.errorFunction(response);
            });
    }
}


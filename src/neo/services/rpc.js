import { makeRpcRequest } from './serviceRequester.js';

export function RpcService () {

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


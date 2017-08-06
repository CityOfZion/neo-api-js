import { getTransformsByService } from '../registry.js';
import { service as neoService } from './service.js';

export function makeRpcRequest (restService, httpOptions, methodSignature) {

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
            var pollRunner = neoService.getPollRunner(poll).addRequest(function () {
                return _makeRpcRequest(rpcClient, rpcOptions, ctx);
            });

            ctx.stopPolling = pollRunner.pause;
            ctx.isPolling = pollRunner.isPolling;
        }
        else {
            _makeRpcRequest(rpcClient, rpcOptions, ctx);
        }
    });
}

function noop () {}

//Only top-level Promise has notify. This is intentional as then().notify() does not make any sense.
//  Notify keeps the chain open indefinitely and can be called repeatedly.
//  Once Then is called, the promise chain is considered resolved and marked for cleanup. Notify can never be called after a then.
function _wrapPromise (callback) {

    var promise = new Promise(function (resolve, reject) {
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
            var chainNotify = promise._notify;

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

function prepareContext(service, methodSignature) {
    var ctx = {};

    ctx.transform = transformPassThrough;
    ctx.stopPolling = noop;
    ctx.isPolling = function () { return false; };

    if (service.serviceUseTransforms && service.serviceName)  {

        var availableTransforms = getTransformsByService(service.serviceName);

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

    var promise = rpcClient.invoke(rpcOptions);

    promise.catch(function (response) {
        ctx.errorFunction(response);
    });

    promise = promise.then(function (response) {

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

    });

    return promise;

}

import { service as neoService } from './service.js';

export function makeServiceRequest (restService, httpOptions) {

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
            let pollRunner = neoService.getPollRunner(poll).addRequest(function () {
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
